#!/usr/bin/env node
/**
 * INDEPENDENT ADMIN CMS AUDIT
 * Tests every HTTP status code for every endpoint.
 * Does NOT assume anything works. Reports PASS/FAIL/NOT_VERIFIED only.
 */

const http = require('http');

const BASE = 'http://127.0.0.1:3001/api/v1';
const results = [];
let passed = 0, failed = 0, notVerified = 0;

let ADMIN_TOKEN = '';
let STUDENT_TOKEN = '';
let companyId = '', roleId = '', jobId = '';

function req(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const r = http.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(raw); } catch { parsed = raw; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    r.on('error', (e) => resolve({ status: 0, error: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

function assert(label, condition, context) {
  if (condition === true) {
    passed++;
    results.push({ verdict: 'PASS', label });
  } else if (condition === 'NOT_VERIFIED') {
    notVerified++;
    results.push({ verdict: 'NOT_VERIFIED', label, context });
  } else {
    failed++;
    results.push({ verdict: 'FAIL', label, context: typeof context === 'object' ? JSON.stringify(context).slice(0, 300) : context });
  }
}

async function run() {

  // =====================
  // PHASE 1: SERVER LIVENESS
  // =====================
  const health = await req('GET', '/health/db/live', null, null);
  assert('Server responds to /health/db/live', health.status !== 0, health);

  // =====================
  // PHASE 2: ADMIN LOGIN
  // =====================
  const adminLogin = await req('POST', '/auth/login', { email: 'admin@kredl.com', password: 'Admin@123' });
  assert('POST /auth/login admin → 200', adminLogin.status === 200, adminLogin.body);
  ADMIN_TOKEN = adminLogin.body?.data?.accessToken || '';
  assert('Admin JWT token present', !!ADMIN_TOKEN, `body: ${JSON.stringify(adminLogin.body).slice(0,200)}`);

  // Student login
  const studentLogin = await req('POST', '/auth/login', { email: 'student@kredl.com', password: 'Student@123' });
  assert('POST /auth/login student → 200', studentLogin.status === 200, studentLogin.body);
  STUDENT_TOKEN = studentLogin.body?.data?.accessToken || '';
  assert('Student JWT token present', !!STUDENT_TOKEN, `body: ${JSON.stringify(studentLogin.body).slice(0,200)}`);

  if (!ADMIN_TOKEN) {
    console.log('\nFATAL: Cannot proceed without admin token. All remaining tests FAIL.\n');
    process.exit(1);
  }

  // =====================
  // PHASE 3: AUTHENTICATION WALL (401 checks)
  // =====================
  for (const [method, path] of [
    ['GET', '/companies'], ['POST', '/companies'], ['GET', '/companies/fake'],
    ['GET', '/job-roles'], ['POST', '/job-roles'], ['GET', '/job-roles/fake'],
    ['GET', '/jobs'], ['POST', '/jobs'], ['GET', '/jobs/fake'],
  ]) {
    const r = await req(method, path, { name: 'x' }, null); // no token
    assert(`${method} ${path} without token → 401`, r.status === 401, r.body);
  }

  // =====================
  // PHASE 4: AUTHORIZATION (403 checks — student on mutating endpoints)
  // =====================
  if (STUDENT_TOKEN) {
    const mut = [
      ['POST', '/companies', { name: 'X Corp', logo: 'x', description: 'x', hiringProcess: [], salaryRange: { min: 1, max: 2, currency: 'LPA' }, eligibilityCriteria: { minimumCgpa: 6, allowedBranches: [], requiredSkills: [] } }],
      ['POST', '/job-roles', { title: 'X Role', description: 'x', requiredSkills: [], roadmap: [] }],
      ['POST', '/jobs', { companyId: '000000000000000000000001', roleId: '000000000000000000000001', title: 'x', location: 'x', jobType: 'Full-time', experienceRequired: 'x', deadline: new Date().toISOString(), salaryPackage: { base: 1, currency: 'LPA' } }],
    ];
    for (const [method, path, body] of mut) {
      const r = await req(method, path, body, STUDENT_TOKEN);
      assert(`STUDENT ${method} ${path} → 403`, r.status === 403, r.body);
    }

    // Student CAN read
    for (const path of ['/companies', '/job-roles', '/jobs']) {
      const r = await req('GET', path, null, STUDENT_TOKEN);
      assert(`STUDENT GET ${path} → 200`, r.status === 200, r.body);
    }
  }

  // =====================
  // PHASE 5: DTO VALIDATION (400 checks)
  // =====================

  // Companies — missing name
  let r400 = await req('POST', '/companies', {}, ADMIN_TOKEN);
  assert('POST /companies empty body → 400', r400.status === 400, r400.body);

  // Companies — empty name string
  r400 = await req('POST', '/companies', { name: '' }, ADMIN_TOKEN);
  assert('POST /companies name="" → 400', r400.status === 400, r400.body);

  // Companies — name is number instead of string
  r400 = await req('POST', '/companies', { name: 123, logo: 'x', description: 'x', hiringProcess: [], salaryRange: { min: 1, max: 2, currency: 'LPA' }, eligibilityCriteria: { minimumCgpa: 6, allowedBranches: [], requiredSkills: [] } }, ADMIN_TOKEN);
  assert('POST /companies name=123 (number) → 400', r400.status === 400, r400.body);

  // Jobs — invalid jobType
  r400 = await req('POST', '/jobs', {
    companyId: '000000000000000000000001',
    roleId: '000000000000000000000001',
    title: 'x', location: 'x', jobType: 'INVALID',
    experienceRequired: 'x',
    deadline: new Date().toISOString(),
    salaryPackage: { base: 1, currency: 'LPA' }
  }, ADMIN_TOKEN);
  assert('POST /jobs invalid jobType → 400', r400.status === 400, r400.body);

  // Jobs — non-MongoId companyId
  r400 = await req('POST', '/jobs', {
    companyId: 'not-a-mongo-id',
    roleId: '000000000000000000000001',
    title: 'x', location: 'x', jobType: 'Full-time',
    experienceRequired: 'x',
    deadline: new Date().toISOString(),
    salaryPackage: { base: 1, currency: 'LPA' }
  }, ADMIN_TOKEN);
  assert('POST /jobs non-ObjectId companyId → 400', r400.status === 400, r400.body);

  // =====================
  // PHASE 6: COMPANIES CRUD — Full lifecycle
  // =====================
  const companyPayload = {
    name: `AuditCorp_${Date.now()}`,
    logo: 'https://via.placeholder.com/100',
    description: 'Audit test company',
    hiringProcess: ['Test Round', 'Tech Interview'],
    salaryRange: { min: 8, max: 18, currency: 'LPA' },
    eligibilityCriteria: { minimumCgpa: 7.0, allowedBranches: ['CSE'], requiredSkills: ['Java'] },
  };

  const createComp = await req('POST', '/companies', companyPayload, ADMIN_TOKEN);
  assert('POST /companies → 201', createComp.status === 201, createComp.body);
  const createdCompRaw = createComp.body?.data || createComp.body;
  companyId = createdCompRaw?._id || '';
  assert('POST /companies._id present', !!companyId, createdCompRaw);
  assert('POST /companies.name matches', createdCompRaw?.name === companyPayload.name, createdCompRaw);

  // 409 — duplicate name
  const dupComp = await req('POST', '/companies', companyPayload, ADMIN_TOKEN);
  assert('POST /companies duplicate name → 409', dupComp.status === 409, dupComp.body);

  // GET list
  const listComp = await req('GET', '/companies?page=1&limit=5', null, ADMIN_TOKEN);
  assert('GET /companies → 200', listComp.status === 200, listComp.body);
  const listCompData = listComp.body?.data;
  assert('GET /companies.data is array', Array.isArray(listCompData?.data), listCompData);
  assert('GET /companies.total is number', typeof listCompData?.total === 'number', listCompData);
  assert('GET /companies.page === 1', listCompData?.page === 1, listCompData);
  assert('GET /companies.limit === 5', listCompData?.limit === 5, listCompData);

  // GET with search
  const searchComp = await req('GET', `/companies?search=AuditCorp`, null, ADMIN_TOKEN);
  assert('GET /companies?search= → 200', searchComp.status === 200, searchComp.body);
  assert('GET /companies?search= returns match', searchComp.body?.data?.data?.length >= 1, searchComp.body?.data);

  // GET by ID
  if (companyId) {
    const getComp = await req('GET', `/companies/${companyId}`, null, ADMIN_TOKEN);
    assert('GET /companies/:id → 200', getComp.status === 200, getComp.body);
    const gotComp = getComp.body?.data || getComp.body;
    assert('GET /companies/:id.name correct', gotComp?.name === companyPayload.name, gotComp);

    // PATCH
    const patchComp = await req('PATCH', `/companies/${companyId}`, { description: 'Updated in audit' }, ADMIN_TOKEN);
    assert('PATCH /companies/:id → 200', patchComp.status === 200, patchComp.body);
    const patchedComp = patchComp.body?.data || patchComp.body;
    assert('PATCH /companies/:id description updated', patchedComp?.description === 'Updated in audit', patchedComp);
  }

  // GET invalid ObjectId → must be 400 or 500 (not 200)
  const invalidIdComp = await req('GET', '/companies/not-valid-id', null, ADMIN_TOKEN);
  assert('GET /companies/invalid-id → 400+', invalidIdComp.status >= 400, invalidIdComp.body);

  // GET non-existent valid ObjectId → 404
  const ghostComp = await req('GET', '/companies/000000000000000000000099', null, ADMIN_TOKEN);
  assert('GET /companies/non-existent-objectId → 404', ghostComp.status === 404, ghostComp.body);

  // =====================
  // PHASE 7: JOB ROLES CRUD
  // =====================
  const rolePayload = {
    title: `AuditRole_${Date.now()}`,
    description: 'Audit test job role',
    requiredSkills: ['Java', 'SQL'],
    roadmap: [{ title: 'Basics', description: 'Java basics', durationWeeks: 4 }],
  };

  const createRole = await req('POST', '/job-roles', rolePayload, ADMIN_TOKEN);
  assert('POST /job-roles → 201', createRole.status === 201, createRole.body);
  const createdRoleRaw = createRole.body?.data || createRole.body;
  roleId = createdRoleRaw?._id || '';
  assert('POST /job-roles._id present', !!roleId, createdRoleRaw);
  assert('POST /job-roles roadmap stored', Array.isArray(createdRoleRaw?.roadmap) && createdRoleRaw.roadmap.length === 1, createdRoleRaw);

  // 409 — duplicate title
  const dupRole = await req('POST', '/job-roles', rolePayload, ADMIN_TOKEN);
  assert('POST /job-roles duplicate → 409', dupRole.status === 409, dupRole.body);

  // GET list
  const listRoles = await req('GET', '/job-roles?page=1&limit=5', null, ADMIN_TOKEN);
  assert('GET /job-roles → 200', listRoles.status === 200, listRoles.body);
  const listRolesData = listRoles.body?.data;
  assert('GET /job-roles.data is array', Array.isArray(listRolesData?.data), listRolesData);
  assert('GET /job-roles.page === 1', listRolesData?.page === 1, listRolesData);

  if (roleId) {
    const getRole = await req('GET', `/job-roles/${roleId}`, null, ADMIN_TOKEN);
    assert('GET /job-roles/:id → 200', getRole.status === 200, getRole.body);
    const gotRole = getRole.body?.data || getRole.body;
    assert('GET /job-roles/:id.roadmap populated', Array.isArray(gotRole?.roadmap), gotRole);

    const patchRole = await req('PATCH', `/job-roles/${roleId}`, { description: 'Role updated in audit' }, ADMIN_TOKEN);
    assert('PATCH /job-roles/:id → 200', patchRole.status === 200, patchRole.body);
    const patchedRole = patchRole.body?.data || patchRole.body;
    assert('PATCH /job-roles/:id description updated', patchedRole?.description === 'Role updated in audit', patchedRole);
  }

  // GET non-existent ObjectId → 404
  const ghostRole = await req('GET', '/job-roles/000000000000000000000099', null, ADMIN_TOKEN);
  assert('GET /job-roles/non-existent → 404', ghostRole.status === 404, ghostRole.body);

  // =====================
  // PHASE 8: JOBS CRUD (requires companyId + roleId)
  // =====================
  if (companyId && roleId) {
    const jobPayload = {
      companyId,
      roleId,
      title: `SDE Audit ${Date.now()}`,
      location: 'Bangalore',
      jobType: 'Full-time',
      experienceRequired: 'Fresher',
      deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
      salaryPackage: { base: 10, variable: 2, currency: 'LPA' },
      eligibilityCriteria: { minimumCgpa: 7.0, allowedBranches: ['CSE'], batchYears: [2025, 2026] },
    };

    const createJob = await req('POST', '/jobs', jobPayload, ADMIN_TOKEN);
    assert('POST /jobs → 201', createJob.status === 201, createJob.body);
    const createdJobRaw = createJob.body?.data || createJob.body;
    jobId = createdJobRaw?._id || '';
    assert('POST /jobs._id present', !!jobId, createdJobRaw);

    // GET list with filter
    const listJobs = await req('GET', '/jobs?page=1&limit=5', null, ADMIN_TOKEN);
    assert('GET /jobs → 200', listJobs.status === 200, listJobs.body);
    const listJobsData = listJobs.body?.data;
    assert('GET /jobs.data is array', Array.isArray(listJobsData?.data), listJobsData);

    const filteredJobs = await req('GET', '/jobs?jobType=Full-time&page=1&limit=5', null, ADMIN_TOKEN);
    assert('GET /jobs?jobType=Full-time → 200', filteredJobs.status === 200, filteredJobs.body);

    if (jobId) {
      const getJob = await req('GET', `/jobs/${jobId}`, null, ADMIN_TOKEN);
      assert('GET /jobs/:id → 200', getJob.status === 200, getJob.body);
      const gotJob = getJob.body?.data || getJob.body;
      assert('GET /jobs/:id companyId populated (has name or _id)', !!(gotJob?.companyId?._id || gotJob?.companyId?.name), gotJob);
      assert('GET /jobs/:id roleId populated (has _id or title)', !!(gotJob?.roleId?._id || gotJob?.roleId?.title), gotJob);

      const patchJob = await req('PATCH', `/jobs/${jobId}`, { location: 'Mumbai' }, ADMIN_TOKEN);
      assert('PATCH /jobs/:id → 200', patchJob.status === 200, patchJob.body);
      const patchedJob = patchJob.body?.data || patchJob.body;
      assert('PATCH /jobs/:id location updated', patchedJob?.location === 'Mumbai', patchedJob);
    }
  } else {
    assert('POST /jobs (dependency missing)', 'NOT_VERIFIED', 'companyId or roleId missing from previous steps');
  }

  // =====================
  // PHASE 9: DELETE & POST-DELETE 404
  // =====================
  if (jobId) {
    const delJob = await req('DELETE', `/jobs/${jobId}`, null, ADMIN_TOKEN);
    assert('DELETE /jobs/:id → 200/204', delJob.status === 200 || delJob.status === 204, delJob.body);
    const afterDel = await req('GET', `/jobs/${jobId}`, null, ADMIN_TOKEN);
    assert('GET /jobs/:id after delete → 404', afterDel.status === 404, afterDel.body);
  }

  if (roleId) {
    const delRole = await req('DELETE', `/job-roles/${roleId}`, null, ADMIN_TOKEN);
    assert('DELETE /job-roles/:id → 200/204', delRole.status === 200 || delRole.status === 204, delRole.body);
    const afterDel = await req('GET', `/job-roles/${roleId}`, null, ADMIN_TOKEN);
    assert('GET /job-roles/:id after delete → 404', afterDel.status === 404, afterDel.body);
  }

  if (companyId) {
    const delComp = await req('DELETE', `/companies/${companyId}`, null, ADMIN_TOKEN);
    assert('DELETE /companies/:id → 200/204', delComp.status === 200 || delComp.status === 204, delComp.body);
    const afterDel = await req('GET', `/companies/${companyId}`, null, ADMIN_TOKEN);
    assert('GET /companies/:id after delete → 404', afterDel.status === 404, afterDel.body);
  }

  // DELETE non-existent → 404
  const delGhost = await req('DELETE', '/companies/000000000000000000000099', null, ADMIN_TOKEN);
  assert('DELETE /companies/non-existent → 404', delGhost.status === 404, delGhost.body);

  // =====================
  // PHASE 10: PAGINATION EDGE CASES
  // =====================
  const p0 = await req('GET', '/companies?page=0&limit=5', null, ADMIN_TOKEN);
  assert('GET /companies?page=0 → 200 (does not crash)', p0.status === 200, p0.body);

  const pNaN = await req('GET', '/companies?page=abc&limit=xyz', null, ADMIN_TOKEN);
  assert('GET /companies?page=abc → 200 (falls back to default)', pNaN.status === 200, pNaN.body);

  const pLarge = await req('GET', '/companies?page=999999&limit=5', null, ADMIN_TOKEN);
  assert('GET /companies?page=999999 → 200 with empty data', pLarge.status === 200, pLarge.body);

  // =====================
  // FINAL REPORT
  // =====================
  console.log('\n' + '='.repeat(60));
  console.log('INDEPENDENT ADMIN CMS AUDIT — FINAL RESULTS');
  console.log('='.repeat(60));

  const passes = results.filter(r => r.verdict === 'PASS');
  const fails = results.filter(r => r.verdict === 'FAIL');
  const notv = results.filter(r => r.verdict === 'NOT_VERIFIED');

  if (passes.length) {
    console.log(`\n✔ PASS (${passes.length})`);
    passes.forEach(r => console.log(`  ✔  ${r.label}`));
  }

  if (notv.length) {
    console.log(`\n⚠ NOT VERIFIED (${notv.length})`);
    notv.forEach(r => console.log(`  ⚠  ${r.label}: ${r.context}`));
  }

  if (fails.length) {
    console.log(`\n✖ FAIL (${fails.length})`);
    fails.forEach(r => console.log(`  ✖  ${r.label}\n     Evidence: ${r.context}`));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Total: ${results.length} | PASS: ${passed} | FAIL: ${failed} | NOT_VERIFIED: ${notVerified}`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
