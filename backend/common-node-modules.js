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
// const fs = require('fs').promises;

// async function appendToFile() {
//   try {
//     // Append a timestamped log entry
//     const logEntry = `${new Date().toISOString()}: Application Started\n`;
//     await fs.appendFile('app.log', logEntry, 'utf8');

//     console.log('Log entry added');
//   } catch (err) {
//     console.error('Error appending to file:', err);
//   }
// }

// appendToFile();


// const { access, unlink } = require('fs').promises;

// async function deleteFile() {
//   const filePath = 'data.json'; // Replace with the path to the file you want to delete

//   try {
//     // Check if file exists before deleting
//     await access(filePath);

//     // Delete the file
//     await unlink(filePath);
//     console.log('File deleted successfully');
//   } catch (err) {
//     if (err.code === 'ENOENT') {
//       console.log('File does not exist');
//     } else {
//       console.error('Error deleting file:', err);
//     }
//   }
// }

// deleteFile();


// const fs = require('fs').promises;
// const path = require('path');

// async function deleteDirectory(dirPath) {
//   try {
//     // Check if the directory exists
//     const stats = await fs.stat(dirPath);
// console.log('Directory exists:', stats);  
//     if (!stats.isDirectory()) {
//       console.log('Path is not a directory');
//       return;
//     }

//     // For Node.js 14.14.0+ (recommended)
//     await fs.rm(dirPath, { recursive: true, force: true });

//     // For older Node.js versions (deprecated but still works)
//     // await fs.rmdir(dirPath, { recursive: true });

//     console.log('Directory deleted successfully');
//   } catch (err) {
//     if (err.code === 'ENOENT') {
//       console.log('Directory does not exist');
//     } else {
//       console.error('Error deleting directory:', err);
//     }
//   }
// }


// // Usage
// deleteDirectory('directory-to-delete');



// const fs = require('fs').promises;

// async function renameFile() {
//   const oldPath = 'old-name.txt';
//   const newPath = 'new-name.txt';

//   try {
//     // Check if source file exists
//     await fs.access(oldPath);

//     // Check if destination file already exists
//     try {
//       await fs.access(newPath);
//       console.log('Destination file already exists');
//       return;
//     } catch (err) {
//       // Destination doesn't exist, safe to proceed
//     }

//     // Perform the rename
//     await fs.rename(oldPath, newPath);
//     console.log('File renamed successfully');
//   } catch (err) {
//     if (err.code === 'ENOENT') {
//       console.log('Source file does not exist');
//     } else {
//       console.error('Error renaming file:', err);
//     }
//   }
// }

// // Usage
// renameFile();

// const path = require('path');

// // Get the directory name of the current module
// console.log('Directory name:', __dirname);

// // Get the file name of the current module
// console.log('File name:', __filename);

// // Building paths relative to the current module
// const configPath = path.join(__dirname, 'config', 'app-config.json');
// console.log('Config file path:', configPath);


// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// // Get the current module's URL
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// console.log('ES Module file path:', __filename);
// console.log('ES Module directory:', __dirname);

// const path = require('path');

// const extension = path.extname('file.txt');
// console.log(extension);

// console.log(path.extname('index.html'));
// console.log(path.extname('index.coffee.md'));
// console.log(path.extname('index.'));
// console.log(path.extname('index'));
// console.log(path.extname('.index'));

const os = require('os');

// Basic system information
console.log(`OS Platform: ${os.platform()}`);
console.log(`OS Type: ${os.type()}`);
console.log(`OS Release: ${os.release()}`);
console.log(`CPU Architecture: ${os.arch()}`);
console.log(`Hostname: ${os.hostname()}`);

// Memory information
const totalMemGB = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
const freeMemGB = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
console.log(`Memory: ${freeMemGB}GB free of ${totalMemGB}GB`);

// User information
const userInfo = os.userInfo();
console.log(`Current User: ${userInfo.username}`);
console.log(`Home Directory: ${os.homedir()}`);