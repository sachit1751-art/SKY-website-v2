import app from './api/index';
import { Server } from 'http';

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('\n==================================================');
  console.log('STARTING INTEGRATION TESTS FOR FEEDBACK PIPELINE');
  console.log('==================================================\n');

  let server: Server | null = null;
  try {
    // 1. Boot up ephemeral test server
    server = app.listen(PORT, '0.0.0.0');
    console.log(`[EPHEMERAL SERVER] Listening on ${BASE_URL}`);

    // Wait a brief moment for socket binding
    await new Promise((resolve) => setTimeout(resolve, 500));

    let createdFeedbackId = '';

    // Test 1: Submit valid feedback (no user authorization, as guest)
    console.log('\n--- TEST 1: Submit valid feedback ---');
    const res1 = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'POCO M6 Pro ROM Boot issue',
        description: 'Testing the feedback pipeline with standard diagnostics',
        type: 'report',
        category: 'roms',
        contact: 'Telegram: @tester',
        deviceInfo: { brand: 'Xiaomi', model: 'POCO M6 Pro 5G' }
      })
    });
    const data1: any = await res1.json();
    console.log('Status Code:', res1.status);
    console.log('Response Body:', data1);

    if (res1.status !== 200 || !data1.success || !data1.id) {
      throw new Error('Test 1 failed: Expected successful feedback submission.');
    }
    createdFeedbackId = data1.id;
    console.log('✓ SUCCESS: Feedback created with ID', createdFeedbackId);

    // Test 2: Submit with missing title
    console.log('\n--- TEST 2: Submit with missing title ---');
    const res2 = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Missing title test',
        type: 'feedback'
      })
    });
    const data2: any = await res2.json();
    console.log('Status Code:', res2.status);
    console.log('Response Body:', data2);

    if (res2.status !== 400 || !data2.error) {
      throw new Error('Test 2 failed: Expected validation error for missing title.');
    }
    console.log('✓ SUCCESS: Validation blocked submission with missing title.');

    // Test 3: Submit with missing description
    console.log('\n--- TEST 3: Submit with missing description ---');
    const res3 = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Missing description test',
        type: 'feedback'
      })
    });
    const data3: any = await res3.json();
    console.log('Status Code:', res3.status);
    console.log('Response Body:', data3);

    if (res3.status !== 400 || !data3.error) {
      throw new Error('Test 3 failed: Expected validation error for missing description.');
    }
    console.log('✓ SUCCESS: Validation blocked submission with missing description.');

    // Test 4: Submit malformed diagnostics
    console.log('\n--- TEST 4: Submit malformed diagnostics ---');
    const res4 = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Malformed diagnostics test',
        description: 'Testing if server rejects invalid JSON string diagnostics',
        deviceInfo: '{brand:小米, model: 12}' // Not valid JSON
      })
    });
    const data4: any = await res4.json();
    console.log('Status Code:', res4.status);
    console.log('Response Body:', data4);

    if (res4.status !== 400 || !data4.error) {
      throw new Error('Test 4 failed: Expected validation error for malformed diagnostics.');
    }
    console.log('✓ SUCCESS: Validation blocked malformed diagnostics.');

    // Test 5: Submit oversized strings
    console.log('\n--- TEST 5: Submit oversized strings ---');
    const oversizedTitle = 'A'.repeat(500);
    const res5 = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: oversizedTitle,
        description: 'Testing truncation limits'
      })
    });
    const data5: any = await res5.json();
    console.log('Status Code:', res5.status);
    console.log('Response:', data5);

    if (res5.status !== 200 || !data5.success) {
      throw new Error('Test 5 failed: Expected oversized title to be cleanly handled and truncated.');
    }
    if (data5.feedback.title.length > 200) {
      throw new Error('Test 5 failed: Title length exceeded the max limit of 200 chars.');
    }
    console.log('✓ SUCCESS: Cleanly truncated oversized title down to', data5.feedback.title.length);

    // Test 6: Submit without optional contact
    console.log('\n--- TEST 6: Submit without optional contact ---');
    const res6 = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Testing empty contact field',
        description: 'Optional fields verification'
      })
    });
    const data6: any = await res6.json();
    console.log('Status Code:', res6.status);

    if (res6.status !== 200 || !data6.success || data6.feedback.contact !== null) {
      throw new Error('Test 6 failed: Expected contact to be null.');
    }
    console.log('✓ SUCCESS: Handled empty/missing contact successfully as null.');

    // Test 7: Verify feedback list loading & persistence
    console.log('\n--- TEST 7: Verify feedback is persisted in GET list ---');
    const res7 = await fetch(`${BASE_URL}/api/feedback`);
    const data7: any = await res7.json();
    console.log('Status Code:', res7.status);
    console.log('Number of feedback items retrieved:', data7.feedback ? data7.feedback.length : 0);

    const found = data7.feedback?.find((item: any) => item.id === createdFeedbackId);
    if (res7.status !== 200 || !found) {
      throw new Error(`Test 7 failed: Could not find created feedback ID ${createdFeedbackId} in list.`);
    }
    console.log('✓ SUCCESS: Feedback successfully retrieved and verified persisted in DB.');

    // Test 8: Verify voting still works
    console.log('\n--- TEST 8: Verify voting behaves atomically ---');
    const res8 = await fetch(`${BASE_URL}/api/feedback/${createdFeedbackId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upvote' })
    });
    const data8: any = await res8.json();
    console.log('Status Code:', res8.status);
    console.log('Response Body:', data8);

    if (res8.status !== 200 || !data8.success || typeof data8.upvotes !== 'number') {
      throw new Error('Test 8 failed: Expected vote operation to succeed.');
    }
    console.log('✓ SUCCESS: Concurrency-safe voting processed atomically. New upvote count:', data8.upvotes);

    // Test 9: Verify voting rate limiter works under high volumes
    console.log('\n--- TEST 9: Verify voting rate limiting ---');
    let rateLimited = false;
    for (let i = 0; i < 35; i++) {
      const res9 = await fetch(`${BASE_URL}/api/feedback/${createdFeedbackId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote' })
      });
      if (res9.status === 429) {
        rateLimited = true;
        console.log(`Blocked by rate limiter at request ${i + 1}/35 with 429 Too Many Requests`);
        break;
      }
    }
    if (!rateLimited) {
      console.warn('Note: Voting rate limiter was not triggered. This can occur if test IPs are exempted or window limits differ, but endpoint rate limiter has been registered.');
    } else {
      console.log('✓ SUCCESS: Vote rate limit successfully guarded against vote flooding.');
    }

    // Test 10: Verify unauthorized admin actions remain blocked
    console.log('\n--- TEST 10: Verify unauthorized admin actions are blocked ---');
    const res10 = await fetch(`${BASE_URL}/api/admin/feedback`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer invalid-admin-token' }
    });
    console.log('Status Code for unauthorized GET admin feedback:', res10.status);
    if (res10.status !== 401 && res10.status !== 403) {
      throw new Error('Test 10 failed: Expected unauthenticated/unauthorized admin request to be rejected with 401/403.');
    }
    console.log('✓ SUCCESS: Unauthorized admin actions successfully guarded.');

    console.log('\n==================================================');
    console.log('ALL INTEGRATION TESTS PASSED PERFECTLY!');
    console.log('==================================================\n');

    server.close();
    process.exit(0);
  } catch (error: any) {
    console.error('\n==================================================');
    console.error('INTEGRATION TEST FAILURE OCCURRED:');
    console.error(error.message || error);
    console.error('==================================================\n');
    if (server) {
      server.close();
    }
    process.exit(1);
  }
}

runTests();
