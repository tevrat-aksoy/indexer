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

// Function to update user balances up to a specific block
function updateBalancesUpToBlock(transfers: TransferEdge[], balances: Record<string, Record<string, string>>, targetBlock: number) {
  // Process each transfer
  transfers.forEach((edge: TransferEdge) => {
    const transfer = edge.node;

    // Skip transfers that occurred after the target block
    if (transfer.block_number > targetBlock) {
      return;
    }

    // Decrease the balance of the sender
    if (transfer.from_address !== '0x0000000000000000000000000000000000000000000000000000000000000000' && transfer.from_address !== transfer.pair) {
      balances[transfer.pair][transfer.from_address] =
        (BigInt(balances[transfer.pair][transfer.from_address] || 0n) - BigInt(transfer.amount_raw)).toString();
    }

    // Increase the balance of the receiver
    if (transfer.to_address !== '0x0000000000000000000000000000000000000000000000000000000000000000' && transfer.to_address !== transfer.pair) {
      balances[transfer.pair][transfer.to_address] =
        (BigInt(balances[transfer.pair][transfer.to_address] || 0n) + BigInt(transfer.amount_raw)).toString();
    }
  });

  // Return the updated balances
  return balances;
}




async function fetchGraphQLData() {
  try {
    const response = await axios.post("http://localhost:8080/v1beta1/relay", {
      query: `
        query {
          pairs_connection{
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
    const balances: Record<string, Record<string, string>> = {};

    // Initialize balances for each pair
    transfers.forEach(transfer => {
      const pair = transfer.node.pair;
      balances[pair] = balances[pair] || {};
    });

    let targetBlock = 614683
    updateBalancesUpToBlock(transfers, balances, targetBlock);


    let filePath = './result/balanceAt.json'
    // Write balances to a JSON file
    fs.writeFileSync(filePath, JSON.stringify(balances, null, 2));

    console.log("Balances updated and saved to file:", filePath);

  } catch (error) {
    console.error("Error fetching GraphQL data:", error);
  }
}

fetchGraphQLData();
