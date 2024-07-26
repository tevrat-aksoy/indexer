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
                "0x030615bec9c1506bfac97d9dbd3c546307987d467a7f95d5533c2e861eb81f3f",
            keys: [
                hash.getSelectorFromName("Transfer"),
            ],
            includeReceipt: false,
        },
        {
            fromAddress:
                "0x0601f72228f73704e827de5bcd8dadaad52c652bb1e42bf492d90bbe22df2cec",
            keys: [
                hash.getSelectorFromName("Transfer"),
            ],
            includeReceipt: false,
        }

    ],
};

export function decodeTransfersInBlock({ header, events }) {
    const { blockNumber, timestamp } = header;

    return events.map(({ event, transaction }) => {
        const transactionHash = transaction.meta.hash;
        const transferId = `${transactionHash}_${event.index}`;

        const [fromAddress, toAddress, amountLow, amountHigh] = event.data;
        const amountRaw = uint256.uint256ToBN({ low: amountLow, high: amountHigh });
        const amount = formatUnits(amountRaw, DECIMALS);

        // Convert to snake_case because it works better with postgres.
        return {
            pair: event.fromAddress,
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