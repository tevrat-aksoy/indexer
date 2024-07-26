/* Starknet ETH indexer
 *
 * This file contains a filter and transform to index Starknet ETH transactions.
 */

// You can import any library supported by Deno.
import { hash, uint256 } from "https://esm.run/starknet@5.14";
import { formatUnits } from "https://esm.run/viem@1.4";

const DECIMALS = 18;
// Can read from environment variables if you want to.
// In that case, run with `--env-from-file .env` and put the following in .env:
// TOKEN_DECIMALS=18
// const DECIMALS = Deno.env.get('TOKEN_DECIMALS') ?? 18;

export const filter = {
    // Only request header if any event matches.
    header: {
        weak: true,
    },
    events: [
        {
            fromAddress:
                "0x007e0f920c961c6c57cd53981b9f2ff5ff88b172a2bec8c525b88953b452220d",
            keys: [
                hash.getSelectorFromName("Transfer"),
            ],
            includeReceipt: false,
        },
    ],
};

export function decodeTransfersInBlock({ header, events }) {
    const { blockNumber, blockHash, timestamp } = header;
    return events.map(({ event, transaction }) => {
        const transactionHash = transaction.meta.hash;
        const transferId = `${transactionHash}_${event.index}`;

        const [fromAddress, toAddress, amountLow, amountHigh] = event.data;
        const amountRaw = uint256.uint256ToBN({ low: amountLow, high: amountHigh });
        const amount = formatUnits(amountRaw, DECIMALS);
        console.log('TX hasdhhh::', transactionHash);
        console.log('TX fromAddress::', fromAddress);
        console.log('event fromAddress::', event.fromAddress);
        
        // Convert to snake_case because it works better with postgres.
        return {
            network: "starknet-mainner",
            symbol: "STRK-ETH",
            block_hash: blockHash,
            block_number: +blockNumber,
            block_timestamp: timestamp,
            transaction_hash: transactionHash,
            transfer_id: transferId,
            from_address: fromAddress,
            to_address: toAddress,
            amount: +amount,
            amount_raw: amountRaw.toString(),
        };
    });
}

//  apibara run   transfers.js  -A dna_v62CMrgwmMLqPLffV7AI