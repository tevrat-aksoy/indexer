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


// Assuming hash.getSelectorFromName() is a valid function or placeholder
// Define the Pairs interface
const pairAddress = ['0x030615bec9c1506bfac97d9dbd3c546307987d467a7f95d5533c2e861eb81f3f',
    '0x00900978e650c11605629fc3eda15447d57e884431894973e4928d8cb4c70c24',
    '0x007e0f920c961c6c57cd53981b9f2ff5ff88b172a2bec8c525b88953b452220d',
    '0x0601f72228f73704e827de5bcd8dadaad52c652bb1e42bf492d90bbe22df2cec',//5
    '0x0032ebb8e68553620b97b308684babf606d9556d5c0a652450c32e85f40d000d',//1
    '0x015e9cd2d4d6b4bb9f1124688b1e6bc19b4ff877a01011d28c25c9ee918e83e5',//3
    '0x02aab581754064a87ade1b680fd9756dc3a17440a87aaf496dcfb39fd163d1dd',//4
    '0x06e1ed57b7e9fed35364ca419340c47479e93206a2dcda5e50530ae198d872ea',//6
    '0x00691fa7f66d63dc8c89ff4e77732fff5133f282e7dbd41813273692cc595516',//7
    '0x05e86d570376e8dc917d241288150a3286c8ad7151638c152d787eca2b96aec3',//8
    '0x00a144ef99419e4dbb3ef99bc2db894fbe7b4532ebed9592a407908727321fcf',//9
    '0x034b7f1c71726cd75e3b1664371beec65890e46f110f2c175d465163638c691a',//10
    '0x04d15040581b20b7682ad69db3c57fd0513fdc55639b8b406da3ddcd5ba39b8a',//11
    '0x0106ff0f48fba1274b1f4f65e6d847fa58ac455e95318754fec20eb221b660ed',//12
    '0x024bd1600bbe18593e983f858f2e7a69148e6b973f43b6304b2b8cf110059595',//13
    '0x03b65c0d9664f7d186c457f6678044485fa3dc4e9bb921c9491bd229287351c8',//14
    '0x07500d8ba71b0a0c587fa431753dbb01a4595a434f27b296358c2c4cb7f83585',//15
    '0x02718bbc0176cff083b5c95ac22691bd1c16d55d37ae153d3ba347ce2292417e',//16
    '0x04244758dc89add83255ee9268e041117dc3249efeb29652ac0916c0e3a55c59',//17
    '0x01283d9f872498556e11b48ec440d66ebe55c6624bc34b737ffb3939fc08203e',//18
    '0x03e7a67de574f596f5d6dcb5e50edca8652ceaa46cac080bbbd28c0f9531b1ca',//19
    '0x00a20410b97dcbfb44f370b67f877c669d859ff85c536d5e8e8336b6d565e1f8',//20
    '0x069b1da498135bb5b06a322627f28945ca13bb759fa92074e8b4e1f06c567600',//21
    '0x0502392d078e1244af81a85cb4bb1a1bcd4c835f1a17bed748b63ecb4cdc68a0',//22
    '0x0100ca9537647afd8bc0bdee6443ef6f3b32b0c2529bb5f58a34f7f0e8b63399',//23
    '0x06825609a60a2af922714890fc4782acd861fbba09c7c33fa8a121e58ec5fac7',//24
    '0x02b22819fc804715679a2bc31461293550c9017ad99a97e769e7ef0788ee388c',//25
    '0x0293a96c020f9a3afc02e712a406805f87916069c6264ed4a0af643f87849bbd',//26
    '0x01eb8805c2f3cc4a7ac8ddde3f8b3e1d7d197053fa6050e318de2100e4eb2d18',//27
    '0x068fa77586bc98d71125e342660ebdfb17a1c26027002af1dd8a620d93ea3ba3',//28
    '0x00c480346ef90a9463ef16b5ed5f9f9de66944f1eef78504d280a03086f46435',//29
    '0x0351d125294ae90c5ac53405ebc491d5d910e4f903cdc5d8c0d342dfa71fd0e9',//30
    '0x01f410986ac70a3d2f945bedc47133abe0d20d95e0cb65cd16e9e77e03bcd9d9',//31
    '0x0115727566214adea6e723c317397a4da457892aad6d408b16c9d8522603984b',//32
    '0x0270c5118157dd722b02abad4a7e11eeafe9edadd00f913ba512a08e4240bc97',//33
    '0x07123ec5f2fbaafa6ee674ed3a25ac9f34a90096fcb6104611425e914b52b7ee',//34
    '0x0386fff4b2e8d72937026f9cdfa1c4b3eac4cb8f87c3e84402e9383de94a8077',//35
    '0x02efeeafbc0a2cd5271374ff3f7ead26427e9b7baedc43c77e166a87865305d2',//36
    '0x0413cbdab66b994cace5a1df220eefd6e85bfc87efbf3792302c9e9b5100941e',//37
    '0x006ed8ee00f928cddc942e7117e69d7efa9e841d5446f620cd9f580d1aa45346',//38
    '0x05a48c4b7facae106db116acc33e5dcbaf5410dec061bdd5f63aee3a4d3566e4',//39
    '0x0291038a5226897265cd2448cc15b1eafd61c378f3d33db6bc8a8d1cd1ff185e',//40
    '0x03744f90dfa2754b46be1c478603323f89250b81350236adcd94da11628e5ba3',//41
    '0x01bc37e1096dd31e22b076e6c8db74275d51026eceadaa50e2c183b203166c86',//42
    '0x0319ec34f61307b30846680ed0125c4c7a022d98e3a6a445663d2fdae3a95d53',//43
    '0x0204145af026dfc1bf3e5858065ee327ad60710a886e35220915729e6c067637',//200
    '0x0142ac41fd6f8c89daf796d70ee260f81c063df164072007bcae74322c0465b2'// 201
];

// Define an empty array to store the events
let events = [];

// Fill events array dynamically using pairAddress
pairAddress.forEach(address => {
    events.push({
        fromAddress: address,
        keys: [
            hash.getSelectorFromName("Transfer"),
        ],
        includeReceipt: false,
    });
});

// Construct the filter object
export const filter = {
    // Only request header if any event matches.
    header: {
        weak: true,
    },
    events: events
};

export function decodeTransfersInBlock({ header, events }) {
    const { blockNumber, timestamp } = header;
    return events.map(({ event, transaction }) => {
        const transactionHash = transaction.meta.hash;
        const transferId = `${transactionHash}_${event.index}`;

        const [fromAddress, toAddress, amountLow, amountHigh] = event.data;
        const amountRaw = uint256.uint256ToBN({ low: amountLow, high: amountHigh });
        const amount = formatUnits(amountRaw, DECIMALS);
        //console.log('TX hasdhhh::', transactionHash);
        //console.log('event fromAddress::', event.fromAddress);

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
