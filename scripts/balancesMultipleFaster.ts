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


const round1Last = 602407
const round2Last = 624467
const round3Last = 629830

const round9Last = 653146

async function fetchGraphQLData() {

  const totalBalances: Record<string, Record<string, string>> = {}; // Total balances for all users across all pairs

  const initialBalances: Record<string, Record<string, string>> = {};
  let startBlock = round3Last;
  let endBlock = round9Last;

  const response = await axios.post("http://localhost:8080/v1beta1/relay", {
    query: `
        query {
          pairs_connection(where: {block_number: {_lte: ${startBlock}}}){
            edges {
              node {
                pair
                from_address
                to_address
                amount_raw
              }
            }
          }
        }
      `,
  });
  const initialTransfers: TransferEdge[] = response.data.data.pairs_connection.edges;

  // Initialize balances for each pair
  initialTransfers.forEach(transfer => {
    const pair = transfer.node.pair;
    initialBalances[pair] = initialBalances[pair] || {};
  });

  updateBalancesUpToBlock(initialTransfers, initialBalances, startBlock);

  let i = 0;

  for (let block = startBlock; block <= endBlock; block += 20) {
    console.log('block::', block, '  i:::', i);
    i = i + 1;
    try {
      const response = await axios.post("http://localhost:8080/v1beta1/relay", {
        query: `
        query {
          pairs_connection(where: {block_number: {_lt: ${block} ,_gt: ${startBlock} }}){
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

      // Merge initialBalances with balances
      Object.keys(initialBalances).forEach(pair => {
        balances[pair] = { ...initialBalances[pair] };
      });


      updateBalancesUpToBlock(transfers, balances, block);

      Object.keys(balances).forEach(pair => {
        if (!totalBalances[pair]) {
          totalBalances[pair] = {};
        }
        Object.keys(balances[pair]).forEach(address => {
          if (!totalBalances[pair][address]) {
            totalBalances[pair][address] = balances[pair][address];
          } else {
            totalBalances[pair][address] = (BigInt(totalBalances[pair][address]) +
              BigInt(balances[pair][address])).toString();
          }
        });
      });

    } catch (error) {
      console.error("Error fetching GraphQL data:", error);
    }
  }

  let filePath = './result/multipleBlocksFaster.json'
  // Write balances to a JSON file
  fs.writeFileSync(filePath, JSON.stringify(totalBalances, null, 2));

  console.log("Balances updated and saved to file:", filePath);

}

fetchGraphQLData();
