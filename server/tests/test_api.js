// Sharadha Stores - API Integration Test Suite
// Verifies entire business flow: categories check, admin auth, bulk order submission, quotation setup, payments, and timeline transitions.

process.env.PORT = 5050;
process.env.DB_TYPE = 'sqlite';
process.env.NODE_ENV = 'test';

const http = require('http');
const db = require('../config/db');

// Start the server
require('../server');

// Helper to make promise-based HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        } catch (err) {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n==================================================');
  console.log('   STARTING SHARADHA PORTAL INTEGRATION TESTS     ');
  console.log('==================================================\n');

  // Wait 1.5 seconds for server and DB setup to complete
  await new Promise(r => setTimeout(r, 1500));

  let jwtToken = '';
  let testOrderId = null;
  let testRequestId = '';

  try {
    // Test 1: Fetch Categories
    console.log('Test 1: Read categories catalog...');
    const catRes = await makeRequest({
      hostname: 'localhost',
      port: 5050,
      path: '/api/categories',
      method: 'GET'
    });
    if (catRes.status === 200 && catRes.body.length > 0) {
      console.log('✔️  Success: Categories list retrieved. Found:', catRes.body.map(c => c.name).join(', '));
    } else {
      throw new Error(`Failed to retrieve categories: ${JSON.stringify(catRes.body)}`);
    }

    // Test 2: Admin Authentication (admin / admin123)
    console.log('\nTest 2: Admin Login...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5050,
      path: '/api/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'admin123' });

    if (loginRes.status === 200 && loginRes.body.token) {
      jwtToken = loginRes.body.token;
      console.log('✔️  Success: Admin authenticated. Token received.');
    } else {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }

    // Test 3: Submit Customer Bulk Order Enquiry
    console.log('\nTest 3: Submit Customer Bulk Order Enquiry...');
    const orderRes = await makeRequest({
      hostname: 'localhost',
      port: 5050,
      path: '/api/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customer_name: 'Test Customer Corporate',
      company_name: 'Test Co Ltd',
      phone: '9876543210',
      email: 'testcustomer@corporate.com',
      event_type: 'Corporate Gift',
      event_date: '2026-10-25',
      delivery_address: '123 Test Corporate Plaza, OMR Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600096',
      category_id: 1,
      quantity: 100,
      budget: 50000,
      message: 'Add custom client logo sticker',
      preferred_contact: 'Email',
      items: [
        { product_id: 1, quantity: 50, unit_price: 520.00 }, // Mysurpa
        { product_id: 4, quantity: 50, unit_price: 280.00 }  // Murukku
      ]
    });

    if (orderRes.status === 201 && orderRes.body.id) {
      testOrderId = orderRes.body.id;
      testRequestId = orderRes.body.request_id;
      console.log(`✔️  Success: Bulk order logged. ID: ${testOrderId}, Request ID: ${testRequestId}`);
    } else {
      throw new Error(`Order placement failed: ${JSON.stringify(orderRes.body)}`);
    }

    // Test 4: Verify Request Tracking (Public Timeline Search)
    console.log('\nTest 4: Customer checks Request Tracking timeline...');
    const trackRes = await makeRequest({
      hostname: 'localhost',
      port: 5050,
      path: `/api/orders/${testRequestId}`,
      method: 'GET'
    });

    if (trackRes.status === 200 && trackRes.body.order.status === 'Pending') {
      console.log(`✔️  Success: Enquiry found. Initial status is 'Pending'.`);
    } else {
      throw new Error(`Tracking query failed: ${JSON.stringify(trackRes.body)}`);
    }

    // Test 5: Admin Configures and Dispatches Quotation
    console.log('\nTest 5: Admin builds & emails Quotation...');
    const quoteRes = await makeRequest({
      hostname: 'localhost',
      port: 5050,
      path: `/api/orders/${testOrderId}/quote`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    }, {
      discount: 1000,
      tax_rate: 18,
      delivery_charge: 500,
      items: [
        { product_id: 1, quantity: 50, unit_price: 520.00 },
        { product_id: 4, quantity: 50, unit_price: 280.00 }
      ]
    });

    if (quoteRes.status === 200 && quoteRes.body.pdfUrl) {
      console.log(`✔️  Success: Quote generated. PDF generated at: ${quoteRes.body.pdfUrl}. Grand Total: Rs. ${quoteRes.body.quote.grand_total}`);
    } else {
      throw new Error(`Quotation calculation failed: ${JSON.stringify(quoteRes.body)}`);
    }

    // Test 6: Verify Quote Sent status on timeline
    console.log('\nTest 6: Verify Quote Sent status on customer tracking timeline...');
    const track2Res = await makeRequest({
      hostname: 'localhost',
      port: 5050,
      path: `/api/orders/${testRequestId}`,
      method: 'GET'
    });

    if (track2Res.status === 200 && track2Res.body.order.status === 'Quotation Sent') {
      console.log(`✔️  Success: Timeline transition updated to 'Quotation Sent'.`);
    } else {
      throw new Error(`Timeline verification failed: ${JSON.stringify(track2Res.body)}`);
    }

    // Test 7: Client Payments Logging
    console.log('\nTest 7: Client logs Payment reference...');
    const payRes = await makeRequest({
      hostname: 'localhost',
      port: 5050,
      path: `/api/orders/${testOrderId}/payment`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      amount: 46620, // (40000 - 1000) * 1.18 + 500
      payment_method: 'UPI',
      transaction_id: 'TXN-987654321-UPI',
      status: 'Completed'
    });

    if (payRes.status === 201) {
      console.log('✔️  Success: Payment processed. Order moved to processing.');
    } else {
      throw new Error(`Payment processing failed: ${JSON.stringify(payRes.body)}`);
    }

    // Test 8: Verify timeline has updated to 'Processing' after payment
    console.log('\nTest 8: Verify timeline transition to Processing...');
    const track3Res = await makeRequest({
      hostname: 'localhost',
      port: 5050,
      path: `/api/orders/${testRequestId}`,
      method: 'GET'
    });

    if (track3Res.status === 200 && track3Res.body.order.status === 'Processing') {
      console.log(`✔️  Success: Order timeline reads: 'Processing'.`);
    } else {
      throw new Error(`Processing check failed: ${JSON.stringify(track3Res.body)}`);
    }

    console.log('\n==================================================');
    console.log('        ALL TESTS COMPLETED SUCCESSFULLY!         ');
    console.log('==================================================\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌  TEST ERROR:', error.message);
    console.log('==================================================');
    console.log('              INTEGRATION TESTS FAILED            ');
    console.log('==================================================\n');
    process.exit(1);
  }
}

runTests();
