import axios from "axios";
import fs from "fs";

interface TransferEdge {
  node: {
    pair: string
    amount: number;
    amount_raw: string
    block_number: number;
    from_address: string;
    to_address: string;
    // Add more properties as needed
  };
}

// Function to update user balances
function updateBalances(transfers: TransferEdge[], balances: Record<string, Record<string, string>>) {
  // Process each transfer
  transfers.forEach((edge: TransferEdge) => {
    const transfer = edge.node;



    // Decrease the balance of the sender
    if (transfer.from_address != '0x0000000000000000000000000000000000000000000000000000000000000000' && transfer.from_address != transfer.pair) {
      balances[transfer.pair][transfer.from_address] =
        (BigInt(balances[transfer.pair][transfer.from_address] || 0n) - BigInt(transfer.amount_raw)).toString();
    }

    if (transfer.to_address != '0x0000000000000000000000000000000000000000000000000000000000000000' && transfer.to_address != transfer.pair) {
      // Increase the balance of the receiver
      balances[transfer.pair][transfer.to_address] =
        (BigInt(balances[transfer.pair][transfer.to_address] || 0n) + BigInt(transfer.amount_raw)).toString();

    }
  });
  // Return the updated balances
  return balances;
}


function calculateTotalBalances(balances: Record<string, Record<string, string>>) {
  const totalBalances: Record<string, { totalBalance: string, uniqueAddresses: number }> = {};

  // Iterate over each pair
  for (const pair in balances) {
    if (Object.prototype.hasOwnProperty.call(balances, pair)) {
      let totalBalance = "0";
      const uniqueAddresses = new Set<string>();

      // Sum up the balances for the pair and count unique addresses
      for (const address in balances[pair]) {
        if (Object.prototype.hasOwnProperty.call(balances[pair], address)) {
          totalBalance = (BigInt(totalBalance) + BigInt(balances[pair][address])).toString();
          if (balances[pair][address] != '0') {
            uniqueAddresses.add(address);

          }
        }
      }

      // Store total balance and number of unique addresses for the pair
      totalBalances[pair] = {
        totalBalance,
        uniqueAddresses: uniqueAddresses.size
      };
    }
  }
  // Log total balances and number of unique addresses for each pair
  for (const pair in totalBalances) {
    if (Object.prototype.hasOwnProperty.call(totalBalances, pair)) {
      console.log(`Pair: ${pair}, Total Balance: ${totalBalances[pair].totalBalance}, Unique Addresses: ${totalBalances[pair].uniqueAddresses}`);
    }
  }

  return totalBalances;
}



async function fetchGraphQLData() {
  try {
    const response = await axios.post("http://localhost:8080/v1beta1/relay", {
      query: `
        query {
        pairs_connection(where: {pair: {_in: ["0x0601f72228f73704e827de5bcd8dadaad52c652bb1e42bf492d90bbe22df2cec", "0x030615bec9c1506bfac97d9dbd3c546307987d467a7f95d5533c2e861eb81f3f"]}}) {
            edges {
              node {
                pair
                amount
                amount_raw
                block_number
                from_address
                to_address
              }
            }
          }
        }
      `,
    });

    // Access the transfer data from the response
    const transfers: TransferEdge[] =
      response.data.data.pairs_connection.edges;

    // Create an empty balances object
    const balancesData = fs.readFileSync("./data/sithswap_balances_602626.json", "utf-8");
    const balances: Record<string, Record<string, string>> = JSON.parse(balancesData);

    // Update user addresses with padHexString() function
    for (const pair in balances) {
      if (Object.prototype.hasOwnProperty.call(balances, pair)) {
        const updatedAddresses: Record<string, string> = {};
        for (const address in balances[pair]) {
          if (Object.prototype.hasOwnProperty.call(balances[pair], address)) {
            updatedAddresses[padHexString(address)] = balances[pair][address].toString();
          }
        }
        balances[pair] = updatedAddresses;
      }
    }


    updateBalances(transfers, balances);
    const totalBalances = calculateTotalBalances(balances);

    let filePath = 'userLastBalances2.json'
    // Write balances to a JSON file
    fs.writeFileSync(filePath, JSON.stringify(balances, null, 2));

    console.log("Balances updated and saved to file:", filePath);

  } catch (error) {
    console.error("Error fetching GraphQL data:", error);
  }
}


function padHexString(hexString: string) {
  const expectedLength = 66; // "0x" prefix + 64 characters
  const currentLength = hexString.length;

  if (currentLength < expectedLength) {
    const paddingLength = expectedLength - currentLength;
    const padding = "0".repeat(paddingLength);
    return "0x" + padding + hexString.slice(2);
  } else {
    return hexString;
  }
}

fetchGraphQLData();
