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

// Example usage
const addresses = [
  "0xd4ccecc36c87d093fa6fb6ecaf012ae10adc786e70a5a16523af43229efe4a",
  "0x51a5540814ff876b49b21877743d38d6a2e43a7c06f10cf8fd46f7ae86fa5cf",
  '0x0002bd17f9e8cd03effdff04156990daf7606f6e50ce3622092c5a9baa7ee1da',
  '0xf2b4d92fa90441b03a394f00e767ff0b8d67a86fa8c02812c25e1ae10cae5',
  '0x124d00d09d9a10d95613ddbe41ecc6cba265e963f80a18b878399f65013e68c1'
];


// Read the JSON file
fs.readFile('raw_1.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }

  try {
    // Parse JSON data
    const jsonData = JSON.parse(data);

    // Update addresses
    jsonData.forEach((item: { address: string }) => {
      item.address = formatAddress(item.address);
    });

    // Write updated data to a new JSON file
    fs.writeFile('updated_data.json', JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error('Error writing updated data to JSON file:', err);
        return;
      }
      console.log('Updated data has been written to updated_data.json');
    });
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});