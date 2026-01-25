// Script to create an example Excel template for bulk job upload
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sample data with example format
const exampleJobs = [
  {
    Email: 'john.doe@example.com',
    Customer: 'Acme Corporation',
    'Job Name': 'SO-2024-001',
    Location: '123 Main St, Springfield, IL 62701',
    Description: 'Installation of electrical systems in new building wing',
    Links: 'https://example.com/manual1.pdf, https://example.com/manual2.pdf',
  },
  {
    Email: 'jane.smith@example.com',
    Customer: 'Tech Industries',
    'Job Name': 'SO-2024-002',
    Location: '456 Oak Avenue, Chicago, IL 60601',
    Description: 'Maintenance and repair of HVAC systems',
    Links: 'https://example.com/hvac-manual.pdf',
  },
  {
    Email: 'bob.jones@example.com',
    Customer: 'Manufacturing Co',
    'Job Name': 'SO-2024-003',
    Location: '789 Industrial Parkway, Aurora, IL 60505',
    Description: 'Equipment installation and testing for production line',
    Links: '',
  },
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(exampleJobs);

// Set column widths for better readability
ws['!cols'] = [
  { wch: 25 }, // Email
  { wch: 20 }, // Customer
  { wch: 15 }, // Job Name
  { wch: 35 }, // Location
  { wch: 50 }, // Description
  { wch: 40 }, // Links
];

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Jobs');

// Write the file
const outputPath = join(__dirname, '..', 'public', 'job-upload-template.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`Template created successfully at: ${outputPath}`);
console.log('\nInstructions:');
console.log('1. Fill in the Email column with existing user emails from your system');
console.log('2. Provide Customer name');
console.log('3. Provide Job Name/Sales Order number');
console.log('4. Specify the Location');
console.log('5. Add a Description of the work to be done');
console.log('6. Optionally add Links to manuals (comma-separated)');
console.log('\nNote: All fields except Links are required. Email must match an existing user in the system.');
