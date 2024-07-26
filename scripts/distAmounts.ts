
const fs = require('fs');


// Given data
const STRKUSDC = "0x00900978e650c11605629fc3eda15447d57e884431894973e4928d8cb4c70c24";
const USDCUSDT = "0x0601f72228f73704e827de5bcd8dadaad52c652bb1e42bf492d90bbe22df2cec";
const STRKETH = "0x007e0f920c961c6c57cd53981b9f2ff5ff88b172a2bec8c525b88953b452220d";
const ETHUSDC = "0x030615bec9c1506bfac97d9dbd3c546307987d467a7f95d5533c2e861eb81f3f";

const rewardAmounts: Record<string, bigint> = {
    "0x030615bec9c1506bfac97d9dbd3c546307987d467a7f95d5533c2e861eb81f3f": 4938000000000000000000n,
    "0x007e0f920c961c6c57cd53981b9f2ff5ff88b172a2bec8c525b88953b452220d": 4336000000000000000000n,
    "0x00900978e650c11605629fc3eda15447d57e884431894973e4928d8cb4c70c24": 2858000000000000000000n,
    "0x0601f72228f73704e827de5bcd8dadaad52c652bb1e42bf492d90bbe22df2cec": 4458000000000000000000n,
};


async function main() {

    const userBalances = JSON.parse(
        fs.readFileSync('./result/multipleBlocksFaster.json'));

    const totalBalances: Record<string, bigint> = {}; // Define type explicitly
    const userRewards: Record<string, Record<string, string>> = {};
    const userTotalRewards: Record<string, string> = {};


    // Iterate through the pool addresses
    for (const poolAddress in userBalances) {
        const poolData = userBalances[poolAddress];
        for (const userAddress in poolData) {
            const balance = BigInt(poolData[userAddress]); // Convert balance to BigInt for accurate arithmetic
            if (totalBalances[poolAddress]) {
                totalBalances[poolAddress] += balance;
            } else {
                totalBalances[poolAddress] = balance;
            }
        }
    }
    console.log(totalBalances);

    // Iterate through the pool addresses
    for (const poolAddress in userBalances) {
        const poolData = userBalances[poolAddress];
        const poolTotalBalance = totalBalances[poolAddress];

        userRewards[poolAddress] = {};
        // Iterate through users in the pool
        for (const userAddress in poolData) {
            const userBalance = BigInt(poolData[userAddress]); // Convert balance to BigInt for accurate arithmetic
            const poolReward = rewardAmounts[poolAddress];
            const userReward = userBalance * poolReward / poolTotalBalance;
            userRewards[poolAddress][userAddress] = userReward.toString();
        }
    }
    const totalBalances2: Record<string, bigint> = {}; // Define type explicitly

    // Iterate through the pool addresses
    for (const poolAddress in userRewards) {
        const poolData = userRewards[poolAddress];
        for (const userAddress in poolData) {
            const balance = BigInt(poolData[userAddress]); // Convert balance to BigInt for accurate arithmetic
            if (totalBalances2[poolAddress]) {
                totalBalances2[poolAddress] += balance;
            } else {
                totalBalances2[poolAddress] = balance;
            }
        }
    }

    console.log(totalBalances2);
    // Write user rewards to a JSON file
    fs.writeFileSync('./result/userRewards.json', JSON.stringify(userRewards, null, 2));

    const totalUserRewards: Record<string, bigint> = {}; // Total rewards for each user

    // Iterate through the pool addresses
    for (const poolAddress in userRewards) {
        const poolData = userRewards[poolAddress];
        for (const userAddress in poolData) {
            const balance = BigInt(poolData[userAddress]); // Convert balance to BigInt for accurate arithmetic
            if (totalUserRewards[userAddress]) {
                totalUserRewards[userAddress] += balance;
            } else {
                totalUserRewards[userAddress] = balance;
            }
        }
    }

    // Filter out users with zero rewards
    const filteredUserRewards: Record<string, bigint> = Object.entries(totalUserRewards)
        .filter(([_, amount]) => amount !== 0n)
        .reduce((acc, [address, amount]) => {
            acc[address] = amount;
            return acc;
        }, {} as Record<string, bigint>);

    // Convert user rewards to the desired JSON format
    const userRewardsArray = Object.entries(filteredUserRewards).map(([address, amount]) => ({
        address,
        amount: amount.toString()
    }));

    // Write user rewards to a JSON file
    fs.writeFileSync('./result/round9.json', JSON.stringify(userRewardsArray, null, 2));
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


