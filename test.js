// Function to fetch and print contents and headers from localhost:4200
async function fetchAndPrintLocalhost() {
  try {
    console.log('Fetching from localhost:4200...');
    
    const response = await fetch('http://localhost:4200');
    
    // Print response status
    console.log('Status:', response.status, response.statusText);
    
    // Print headers
    console.log('Headers:');
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    // Get and print content
    const content = await response.text();
    console.log('Content:');
    console.log(content);
    
    return { status: response.status, headers: Object.fromEntries(response.headers), content };
  } catch (error) {
    console.error('Error fetching from localhost:4200:', error);
    return { error: error.message };
  }
}

// Execute the function
fetchAndPrintLocalhost();
