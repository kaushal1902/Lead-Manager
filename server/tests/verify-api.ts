import app from '../src/app.js';
import http from 'http';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];
let server: http.Server;
let baseUrl: string;

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function request(path: string, options: RequestInit = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({ name, passed: false, error: errorMsg });
    console.error(`  ✗ ${name}: ${errorMsg}`);
  }
}

async function start() {
  console.log('\n🚀 Starting Lead Manager API Integration Test Suite...\n');

  // Start on an ephemeral test port
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 5001;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  let createdLeadId = '';
  let demoUserToken = '';
  let priyaUserToken = '';

  // 1. Health check
  await runTest('GET /api/health returns 200 and ok status', async () => {
    const { status, data } = await request('/api/health');
    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.status === 'ok', `Expected status "ok", got ${data.status}`);
  });

  // 2. Auth: Login demo user
  await runTest('POST /api/auth/login logs in demo user and returns JWT', async () => {
    const { status, data } = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'demo@leadmanager.io',
        password: 'password123',
      }),
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Expected success === true');
    assert(typeof data.data.token === 'string', 'Expected token string');
    demoUserToken = data.data.token;
  });

  // 3. Auth: Login secondary user (Priya Nair)
  await runTest('POST /api/auth/login logs in secondary user (Priya Nair)', async () => {
    const { status, data } = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'priya.nair@tatadigital.com',
        password: 'password123',
      }),
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(typeof data.data.token === 'string', 'Expected token string');
    priyaUserToken = data.data.token;
  });

  // 4. Auth: Profile lookup
  await runTest('GET /api/auth/me returns current user profile with token', async () => {
    const { status, data } = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${demoUserToken}` },
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.email === 'demo@leadmanager.io', 'Email mismatch');
  });

  // 5. Multi-tenant Isolation: Priya only sees her own 2 leads
  await runTest('GET /api/leads multi-tenant test: Priya sees only her own 2 leads', async () => {
    const { status, data } = await request('/api/leads', {
      headers: { Authorization: `Bearer ${priyaUserToken}` },
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.length === 2, `Expected 2 leads for Priya, got ${data.data.length}`);
    assert(data.data.every((l: { userId: string }) => l.userId !== undefined), 'All leads must belong to Priya');
  });

  // 6. Pagination test
  await runTest('GET /api/leads?page=1&limit=5 returns paginated subset and meta', async () => {
    const { status, data } = await request('/api/leads?page=1&limit=5', {
      headers: { Authorization: `Bearer ${demoUserToken}` },
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.length === 5, `Expected 5 leads, got ${data.data.length}`);
    assert(data.pagination.page === 1, 'Expected page === 1');
    assert(data.pagination.limit === 5, 'Expected limit === 5');
    assert(data.pagination.total >= 15, 'Expected total >= 15');
    assert(data.pagination.totalPages >= 3, 'Expected totalPages >= 3');
  });

  // 7. Metrics Stats
  await runTest('GET /api/leads/stats returns status count aggregates', async () => {
    const { status, data } = await request('/api/leads/stats', {
      headers: { Authorization: `Bearer ${demoUserToken}` },
    });
    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.success === true, 'Expected success === true');
    assert(typeof data.data.total === 'number', 'Expected total to be number');
    assert(typeof data.data.new === 'number', 'Expected new to be number');
    assert(typeof data.data.qualified === 'number', 'Expected qualified to be number');
  });

  // 8. Search filter
  await runTest('GET /api/leads?search=Tata filters by company/name', async () => {
    const { status, data } = await request('/api/leads?search=Tata', {
      headers: { Authorization: `Bearer ${demoUserToken}` },
    });
    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.data.length > 0, 'Expected at least 1 match for Tata');
    assert(data.data.some((l: { company: string }) => l.company.includes('Tata')), 'Expected company match');
  });

  // 9. Status filter
  await runTest('GET /api/leads?status=Qualified returns only qualified leads', async () => {
    const { status, data } = await request('/api/leads?status=Qualified', {
      headers: { Authorization: `Bearer ${demoUserToken}` },
    });
    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.data.every((l: { status: string }) => l.status === 'Qualified'), 'All leads must have status Qualified');
  });

  // 10. Validation error check
  await runTest('POST /api/leads returns 400 VALIDATION_ERROR on invalid email', async () => {
    const { status, data } = await request('/api/leads', {
      method: 'POST',
      headers: { Authorization: `Bearer ${demoUserToken}` },
      body: JSON.stringify({
        name: 'Test Lead',
        email: 'not-an-email',
      }),
    });
    assert(status === 400, `Expected status 400, got ${status}`);
    assert(data.success === false, 'Expected success === false');
    assert(data.error.code === 'VALIDATION_ERROR', `Expected code VALIDATION_ERROR, got ${data.error.code}`);
    assert(data.error.details.some((d: { field: string }) => d.field === 'email'), 'Expected email validation detail');
  });

  // 11. Successful creation
  await runTest('POST /api/leads creates lead successfully and returns 201', async () => {
    const newLead = {
      name: 'Integration Test Lead',
      email: 'integration.test@pipeline.com',
      phone: '+91 98200 11223',
      company: 'TestCorp Global',
      source: 'Website',
      status: 'New',
      notes: 'Generated via integration test runner.',
    };

    const { status, data } = await request('/api/leads', {
      method: 'POST',
      headers: { Authorization: `Bearer ${demoUserToken}` },
      body: JSON.stringify(newLead),
    });

    assert(status === 201, `Expected status 201, got ${status}`);
    assert(data.success === true, 'Expected success === true');
    assert(data.data.name === newLead.name, 'Name mismatch');
    assert(data.data.id !== undefined, 'Expected lead id to be defined');
    createdLeadId = data.data.id;
  });

  // 12. Fetch by ID
  await runTest('GET /api/leads/:id returns single lead', async () => {
    const { status, data } = await request(`/api/leads/${createdLeadId}`, {
      headers: { Authorization: `Bearer ${demoUserToken}` },
    });
    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.data.id === createdLeadId, 'ID mismatch');
  });

  // 13. Update lead
  await runTest('PUT /api/leads/:id updates lead details', async () => {
    const { status, data } = await request(`/api/leads/${createdLeadId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${demoUserToken}` },
      body: JSON.stringify({
        company: 'Updated TestCorp Enterprise',
        notes: 'Updated via test suite',
      }),
    });

    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.data.company === 'Updated TestCorp Enterprise', 'Company was not updated');
  });

  // 14. Quick status update
  await runTest('PATCH /api/leads/:id/status updates status directly', async () => {
    const { status, data } = await request(`/api/leads/${createdLeadId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${demoUserToken}` },
      body: JSON.stringify({
        status: 'Contacted',
      }),
    });

    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.data.status === 'Contacted', 'Status was not updated');
  });

  // 15. Delete lead
  await runTest('DELETE /api/leads/:id deletes lead successfully', async () => {
    const { status, data } = await request(`/api/leads/${createdLeadId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${demoUserToken}` },
    });

    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.success === true, 'Expected success === true');
  });

  // 16. 404 after delete
  await runTest('GET /api/leads/:id returns 404 for deleted lead', async () => {
    const { status, data } = await request(`/api/leads/${createdLeadId}`, {
      headers: { Authorization: `Bearer ${demoUserToken}` },
    });
    assert(status === 404, `Expected status 404, got ${status}`);
    assert(data.error.code === 'NOT_FOUND', `Expected code NOT_FOUND, got ${data.error.code}`);
  });

  // Teardown
  server.close();

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log(`\n===========================================`);
  console.log(`Results: ${passedCount} passed, ${failedCount} failed (${results.length} total)`);
  console.log(`===========================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

start().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
