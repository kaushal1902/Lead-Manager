import app from '../src/index.js';
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

  // 1. Health check
  await runTest('GET /api/health returns 200 and ok status', async () => {
    const { status, data } = await request('/api/health');
    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.status === 'ok', `Expected status "ok", got ${data.status}`);
  });

  // 2. Metrics Stats
  await runTest('GET /api/leads/stats returns status count aggregates', async () => {
    const { status, data } = await request('/api/leads/stats');
    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.success === true, 'Expected success === true');
    assert(typeof data.data.total === 'number', 'Expected total to be number');
    assert(typeof data.data.new === 'number', 'Expected new to be number');
    assert(typeof data.data.qualified === 'number', 'Expected qualified to be number');
  });

  // 3. List leads
  await runTest('GET /api/leads returns list of leads', async () => {
    const { status, data } = await request('/api/leads');
    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.success === true, 'Expected success === true');
    assert(Array.isArray(data.data), 'Expected data to be an array');
    assert(data.data.length > 0, 'Expected seeded leads to be returned');
  });

  // 4. Search filter
  await runTest('GET /api/leads?search=Apex filters by company/name', async () => {
    const { status, data } = await request('/api/leads?search=Apex');
    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.data.length > 0, 'Expected at least 1 match for Apex');
    assert(data.data.some((l: { company: string }) => l.company.includes('Apex')), 'Expected company match');
  });

  // 5. Status filter
  await runTest('GET /api/leads?status=Qualified returns only qualified leads', async () => {
    const { status, data } = await request('/api/leads?status=Qualified');
    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.data.every((l: { status: string }) => l.status === 'Qualified'), 'All leads must have status Qualified');
  });

  // 6. Validation error check
  await runTest('POST /api/leads returns 400 VALIDATION_ERROR on invalid email', async () => {
    const { status, data } = await request('/api/leads', {
      method: 'POST',
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

  // 7. Successful creation
  await runTest('POST /api/leads creates lead successfully and returns 201', async () => {
    const newLead = {
      name: 'Integration Test Lead',
      email: 'integration.test@pipeline.com',
      phone: '+1 (555) 000-1111',
      company: 'TestCorp Global',
      source: 'Website',
      status: 'New',
      notes: 'Generated via integration test runner.',
    };

    const { status, data } = await request('/api/leads', {
      method: 'POST',
      body: JSON.stringify(newLead),
    });

    assert(status === 201, `Expected status 201, got ${status}`);
    assert(data.success === true, 'Expected success === true');
    assert(data.data.name === newLead.name, 'Name mismatch');
    assert(data.data.id !== undefined, 'Expected lead id to be defined');
    createdLeadId = data.data.id;
  });

  // 8. Fetch by ID
  await runTest('GET /api/leads/:id returns single lead', async () => {
    const { status, data } = await request(`/api/leads/${createdLeadId}`);
    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.data.id === createdLeadId, 'ID mismatch');
  });

  // 9. Update lead
  await runTest('PUT /api/leads/:id updates lead details', async () => {
    const { status, data } = await request(`/api/leads/${createdLeadId}`, {
      method: 'PUT',
      body: JSON.stringify({
        company: 'Updated TestCorp Enterprise',
        notes: 'Updated via test suite',
      }),
    });

    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.data.company === 'Updated TestCorp Enterprise', 'Company was not updated');
  });

  // 10. Quick status update
  await runTest('PATCH /api/leads/:id/status updates status directly', async () => {
    const { status, data } = await request(`/api/leads/${createdLeadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'Contacted',
      }),
    });

    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.data.status === 'Contacted', 'Status was not updated');
  });

  // 11. Delete lead
  await runTest('DELETE /api/leads/:id deletes lead successfully', async () => {
    const { status, data } = await request(`/api/leads/${createdLeadId}`, {
      method: 'DELETE',
    });

    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.success === true, 'Expected success === true');
  });

  // 12. 404 after delete
  await runTest('GET /api/leads/:id returns 404 for deleted lead', async () => {
    const { status, data } = await request(`/api/leads/${createdLeadId}`);
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
