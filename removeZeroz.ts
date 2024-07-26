import * as fs from 'fs';

// Define interface for JSON object structure
interface Entry {
    address: string;
    amount: string;
}

// Read JSON file
fs.readFile('raw_1.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Parse JSON data
    let jsonData: Entry[];
    try {
        jsonData = JSON.parse(data);
    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return;
    }

    console.log('Number of addresses before filtering:', jsonData.length);

    // Filter out entries where amount is 0
    const filteredData = jsonData.filter(entry => parseInt(entry.amount) !== 0);

    console.log('Number of addresses after filtering:', filteredData.length);


    // Optionally, you can write the filtered data back to a file
    fs.writeFile('filtered_data.json', JSON.stringify(filteredData, null, 2), (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('Filtered data has been saved to filtered_data.json');
    });
});
