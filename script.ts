function formatAddress(address: string): string {
  // Check if "0x" prefix is present, if not add it
  if (!address.startsWith("0x")) {
    address = "0x" + address;
  }

  console.log(address.length)
  // Pad the address with zeros to make it 42 characters long (including "0x" prefix)
  while (address.length < 66) {
    address = address.slice(0, 2) + "0" + address.slice(2);
  }

  return address;
}
import * as fs from 'fs';


interface AddressData {
  address: string;
  amount: string;
}

// Read JSON file and parse its content
function readJSONFile(filename: string): AddressData[] {
  const rawData = fs.readFileSync(filename);
  return JSON.parse(rawData.toString());
}
// Write JSON data to a file
function writeJSONFile(filename: string, data: any) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}
// Combine and sum the amounts for each address
function combineAddresses(...datasets: AddressData[][]): AddressData[] {
  const addressMap: { [address: string]: bigint } = {};

  // Iterate through each dataset
  for (const dataset of datasets) {
    // Iterate through each data item
    for (const { address, amount } of dataset) {
      // Parse amount as BigInt to handle large numbers
      const parsedAmount = BigInt(amount);

      // Update the sum for the address
      addressMap[address] = (addressMap[address] || 0n) + parsedAmount;
    }
  }

  // Convert addressMap back into an array of objects
  return Object.entries(addressMap).map(([address, amount]) => ({ address, amount: amount.toString() }));
}

// Main function to combine and write data
function combineAndWriteData(outputFilename: string, ...inputFilenames: string[]) {
  const datasets = inputFilenames.map(readJSONFile);
  const combinedData = combineAddresses(...datasets);
  writeJSONFile(outputFilename, combinedData);

  // Output total unique addresses for each JSON file
  for (let i = 0; i < inputFilenames.length; i++) {
    const uniqueAddresses = new Set(datasets[i].map(data => data.address));
    console.log(`Total unique addresses in ${inputFilenames[i]}: ${uniqueAddresses.size}`);
  }

  // Output total combined unique addresses
  const allAddresses = combinedData.map(data => data.address);
  const totalUniqueAddresses = new Set(allAddresses);
  console.log(`Total unique addresses in combined data: ${totalUniqueAddresses.size}`);
}

// Usage: combineAndWriteData('combined.json', 'file1.json', 'file2.json');
combineAndWriteData('combined.json', 'round12.json', 'round3.json');