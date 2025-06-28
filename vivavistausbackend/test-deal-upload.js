const fs = require('fs-extra');
const path = require('path');

// Define the test file path
const testFilePath = path.join(process.cwd(), 'uploads', 'deal', 'test-image.webp');

// Create a simple test file
async function testWriteAccess() {
  try {
    // Ensure the directory exists
    await fs.ensureDir(path.join(process.cwd(), 'uploads', 'deal'));
    console.log('✅ Deal directory exists or was created');
    
    // Try to write a test file
    await fs.writeFile(testFilePath, 'Test content');
    console.log(`✅ Successfully wrote test file: ${testFilePath}`);
    
    // Read the file to verify
    const content = await fs.readFile(testFilePath, 'utf8');
    console.log(`✅ Successfully read test file. Content: ${content}`);
    
    // Delete the test file
    await fs.unlink(testFilePath);
    console.log(`✅ Successfully deleted test file`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

// Run the test
testWriteAccess()
  .then(success => {
    console.log(`Test ${success ? 'passed' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 