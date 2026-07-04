// const fs = require('fs');
// const { writeFile, readFile } = require('fs');

// readFile('myfile.txt', 'utf8', (err, data) => {
//     if (err) {
//         console.error('Error reading file:', err);
//         return;
//     }
//     console.log('File content:', data);
//     // if (err) {
//     //     console.error('Error reading file:', err);
//     // } else {
//     //     console.log('File content:', data);
//     // }
// });

// const { readFile } = require('fs').promises;

// async function readFileExample() {
//     try {
//         const data = await readFile('myfile.txt', 'utf8');
//         console.log('File content:', data);
//     } catch (err) {
//         console.error('Error reading file:', err);
//     }
// }

// // readFileExample();
// // Using fs.promises (Node.js 10.0.0+)
// const fs = require('fs').promises;

// async function readFileExample() {
//     try {
//         const data = await fs.readFile('myfile.txt', 'utf8');
//         console.log('File content:', data);
//     } catch (err) {
//         console.error('Error reading file:', err);
//     }
// }

// readFileExample();

// // Or with util.promisify (Node.js 8.0.0+)
// const { promisify } = require('util');
// const readFileAsync = promisify(require('fs').readFile);

// async function readWithPromisify() {
//     try {
//         const data = await readFileAsync('myfile.txt', 'utf8');
//         console.log(data);
//     } catch (err) {
//         console.error(err);
//     }
// }

// readWithPromisify();


// const fs = require('fs');

// try {
//     // Read file synchronously
//     const data = fs.readFileSync('myfile.txt', 'utf8');
//     console.log('File content:', data);
// } catch (err) {
//     console.error('Error reading file:', err);
// }


// const fs = require('fs').promises;

// async function writeFileExample() {
//   try {
//     // Write text to a file
//     await fs.writeFile('myfile.txt', 'Hello, World!', 'utf8');

//     // Write JSON data
//     const data = { name: 'John', age: 30, city: 'New York' };
//     await fs.writeFile('data.json', JSON.stringify(data, null, 2), 'utf8');

//     console.log('Files created successfully');
//   } catch (err) {
//     console.error('Error writing files:', err);
//   }
// }

// writeFileExample();
const fs = require('fs').promises;

async function appendToFile() {
  try {
    // Append a timestamped log entry
    const logEntry = `${new Date().toISOString()}: Application Started\n`;
    await fs.appendFile('app.log', logEntry, 'utf8');

    console.log('Log entry added');
  } catch (err) {
    console.error('Error appending to file:', err);
  }
}

appendToFile();