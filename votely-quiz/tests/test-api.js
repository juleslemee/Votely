// Test API routes locally
const baseUrl = process.argv[2] || 'http://localhost:3000';

async function testRoute(method, path) {
  console.log(`\nTesting ${method} ${path}...`);
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (method === 'POST' && path === '/api/feedback') {
      options.body = JSON.stringify({
        feedback: 'Test feedback from script',
        wantsReply: false
      });
    }
    
    const response = await fetch(`${baseUrl}${path}`, options);
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text}`);
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response is not JSON');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function runTests() {
  console.log(`Testing API routes at: ${baseUrl}`);
  
  await testRoute('GET', '/api/test');
  await testRoute('POST', '/api/test');
  await testRoute('GET', '/api/feedback');
  await testRoute('POST', '/api/feedback');
}

runTests();