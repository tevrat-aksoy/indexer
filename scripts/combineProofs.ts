

const directory = './proofs';
import * as jsonfile from 'jsonfile';

const BLOCK22 = 566389 // February 21, 2024 at 11:59:54 PM GMT+3
const lastblock = 602407


async function main() {
  await combineJsonFiles();

}
import { readdir, stat } from 'fs/promises';


// Function to combine JSON files
async function combineJsonFiles() {
  let combinedData: any[] = [];

  try {
    // Read files in the directory
    const files = await readdir(directory);

    // Process each file
    for (const file of files) {
      const filePath = `${directory}/${file}`;

      // Check if it's a file
      const fileStat = await stat(filePath);
      if (fileStat.isFile()) {
        // Read JSON content
        const data = await jsonfile.readFile(filePath);
        combinedData.push(...data);
      }
    }

    // Variable to store the total number of proof entries
    let totalProofs = 0;

    // Iterate over each entry in the combined data
    for (const entry of combinedData) {
      // Check if the entry has a 'proof' property
      if (entry[1] && entry[1].proof && Array.isArray(entry[1].proof)) {
        // Increment the total number of proofs by the length of the 'proof' array
        totalProofs += 1;
      }
    }
    console.log(`Total number of proof entries: ${totalProofs}`);


    // Write combined data to a new JSON file
    const outputFile = 'combinedProofs.json';
    await jsonfile.writeFile(outputFile, combinedData, { spaces: 2 });
    console.log(`Combined data has been written to ${outputFile}`);
  } catch (err) {
    console.error('Error:', err);
  }
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


