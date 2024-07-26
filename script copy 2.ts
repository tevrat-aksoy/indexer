import csvParser from 'csv-parser';
import fs from 'fs';
import jsonfile from 'jsonfile';

interface Transaction {
  PAIR: string;
  VOLUME: string;
  HASH: string;
  USERADDRESS: string;
  TIME: string;
}

interface VolumeByUser {
  [userAddress: string]: string;
}

function formatAddress(address: string): string {
  // Check if "0x" prefix is present, if not add it
  if (!address.startsWith("0x")) {
    address = "0x" + address;
  }
  // Pad the address with zeros to make it 42 characters long (including "0x" prefix)
  while (address.length < 66) {
    address = address.slice(0, 2) + "0" + address.slice(2);
  }

  return address;
}

interface JsonData {
  [key: string]: string;
}


async function main(): Promise<void> {



  const fee = JSON.parse(
    fs.readFileSync('./airdropData/feesMaxFiltered.json', 'utf-8')
  );

  const volume = JSON.parse(
    fs.readFileSync('./volumes/volumesWithMax.json', 'utf-8')
  );
  const filteredValues: VolumeByUser = {};
  const filteredMaxValues: VolumeByUser = {};

  let numberOf = 0; // Counter for users with volume > 1000
  let totalVolumes1 = '0';
  let totalVolumes2 = '0';
  let totalVolumes3 = '0';

  // Extract addresses from the dictionaries
  const addresses1: string[] = Object.keys(fee);
  const addresses2: string[] = Object.keys(volume);


  // Function to check if addresses are the same or if last 15 characters are the same
  function checkAddresses(address1: string, address2: string): boolean {
    return address1.slice(-10) === address2.slice(-10);
  }

  // Check for common addresses or addresses with the same last 15 characters
  const commonAddresses: [string, string][] = [];
  addresses1.forEach(address1 => {
    addresses2.forEach(address2 => {
      if (checkAddresses(address1, address2)) {
        commonAddresses.push([address1, address2]);
      }
    });
  });

  // Output the results
  if (commonAddresses.length > 0) {
    console.log("Common addresses or addresses with the same last 15 characters:");
    commonAddresses.forEach(([address1, address2]) => {
      console.log(address1, address2);
    });
  } else {
    console.log("No common addresses or addresses with the same last 15 characters found.");
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('An unhandled error occurred:', error);
    process.exit(1);
  });
