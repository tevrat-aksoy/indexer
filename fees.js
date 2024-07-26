// Before running this script, you must setup your database to include a `transfers` table.
// See README.md for instructions.
import { decodeTransfersInBlock, filter } from "./common/fees.js";

// Configure indexer for streaming Starknet Goerli data starting at the specified block.

// fist block18570
export const config = {
    streamUrl: "https://mainnet.starknet.a5a.ch",
    startingBlock: 91130,
    network: "starknet",
    filter,
    sinkType: "postgres",
    sinkOptions: {
        noTls: true,
        tableName: "fees",
    },
};

// Transform each block using the function defined in starknet.js.
export default decodeTransfersInBlock;

// apibara run   fees.js  -A dna_v62CMrgwmMLqPLffV7AI
//export POSTGRES_CONNECTION_STRING="postgres://postgres:postgres@localhost:5432/postgres"
// docker compose up
// http://localhost:8080/console