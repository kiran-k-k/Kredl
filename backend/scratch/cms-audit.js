#!/usr/bin/env node
/**
 * Kredl Admin CMS — End-to-End API Verification Script
 * Tests: Companies, Job Roles, Jobs — full CRUD + auth + pagination
 */

const http = require('http');
const https = require('https');

const BASE = 'http://127.0.0.1:3001/api/v1';
let ADMIN_TOKEN = '';
let companyId = '';
let roleId = '';
let jobId = '';

let passed = 0;
let failed = 0;
const results = [];

function req(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
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

function check(label, condition, detail) {
  if (condition) {
    passed++;
    results.push(`  ✅  ${label}`);
  } else {
    failed++;
    results.push(`  ❌  ${label}: ${JSON.stringify(detail)}`);
  }
}

async function run() {
  console.log('\n=== PHASE 1: AUTHENTICATION ===');

  // 401 — no token on protected endpoint
  const unauth = await req('GET', '/companies');
  check('GET /companies without token → 401', unauth.status === 401, unauth);

  // Login as admin
  const login = await req('POST', '/auth/login', {
    email: 'admin@kredl.com',
    password: 'Admin@123',
  });
  check('POST /auth/login → 200', login.status === 200, login.body);
  ADMIN_TOKEN = login.body?.data?.accessToken || login.body?.data?.tokens?.accessToken || login.body?.accessToken || '';
  check('Admin token received', !!ADMIN_TOKEN, 'token missing — body: ' + JSON.stringify(login.body));

  if (!ADMIN_TOKEN) {
    console.log('\nCannot proceed without admin token. Aborting.');
    process.exit(1);
  }

  console.log('\n=== PHASE 2: COMPANIES CRUD ===');

  // GET /companies — paginated list
  const listEmpty = await req('GET', '/companies?page=1&limit=5', null, ADMIN_TOKEN);
  check('GET /companies → 200', listEmpty.status === 200, listEmpty.body);
  check('GET /companies response has data array', Array.isArray(listEmpty.body?.data?.data), listEmpty.body?.data);
  check('GET /companies has total field', typeof listEmpty.body?.data?.total === 'number', listEmpty.body?.data);
  check('GET /companies pagination correct (page=1)', listEmpty.body?.data?.page === 1, listEmpty.body?.data);

  // POST /companies — valid creation
  const createCompany = await req('POST', '/companies', {
    name: 'Test Corp ' + Date.now(),
    logo: 'https://via.placeholder.com/100',
    description: 'A test company for audit verification',
    hiringProcess: ['Online Test', 'Technical Interview', 'HR Round'],
    salaryRange: { min: 8, max: 18, currency: 'LPA' },
    eligibilityCriteria: {
      minimumCgpa: 7.0,
      allowedBranches: ['CSE', 'IT'],
      requiredSkills: ['Java', 'Spring Boot'],
    },
  }, ADMIN_TOKEN);
  check('POST /companies → 201', createCompany.status === 201, createCompany.body);
  // company may be in body.data or directly in body (NestJS returns the created doc)
  const createdComp = createCompany.body?.data || createCompany.body;
  companyId = createdComp?._id || '';
  check('POST /companies returns _id', !!companyId, createdComp);

  // POST /companies — duplicate name → 400/409/500
  const dupCompany = await req('POST', '/companies', {
    name: createdComp?.name, // same name
    logo: 'https://via.placeholder.com/100',
    description: 'Duplicate test',
    hiringProcess: [],
    salaryRange: { min: 1, max: 2, currency: 'LPA' },
    eligibilityCriteria: { minimumCgpa: 5, allowedBranches: [], requiredSkills: [] },
  }, ADMIN_TOKEN);
  check('POST /companies duplicate → non-201 error', dupCompany.status !== 201, dupCompany);

  // POST /companies — missing required fields → 400
  const badCompany = await req('POST', '/companies', { name: '' }, ADMIN_TOKEN);
  check('POST /companies missing fields → 400', badCompany.status === 400, badCompany.body);

  // GET /companies/:id
  if (companyId) {
    const getOne = await req('GET', `/companies/${companyId}`, null, ADMIN_TOKEN);
    check('GET /companies/:id → 200', getOne.status === 200, getOne.body);
    const gotComp = getOne.body?.data || getOne.body;
    check('GET /companies/:id returns correct name', gotComp?.name === createdComp?.name, gotComp);

    // GET /companies/:id — invalid ObjectId
    const badId = await req('GET', '/companies/not-a-valid-id', null, ADMIN_TOKEN);
    check('GET /companies/invalid-id → 400 or 500', badId.status >= 400, badId);

    // PATCH /companies/:id
    const patch = await req('PATCH', `/companies/${companyId}`, {
      description: 'Updated description for audit',
      salaryRange: { min: 10, max: 20, currency: 'LPA' },
    }, ADMIN_TOKEN);
    check('PATCH /companies/:id → 200', patch.status === 200, patch.body);
    const patchedComp = patch.body?.data || patch.body;
    check('PATCH /companies/:id description updated', patchedComp?.description === 'Updated description for audit', patchedComp);
  }

  // GET /companies with search
  const searchResult = await req('GET', '/companies?search=Test+Corp&page=1&limit=5', null, ADMIN_TOKEN);
  check('GET /companies?search= → 200', searchResult.status === 200, searchResult.body);

  console.log('\n=== PHASE 3: JOB ROLES CRUD ===');

  const createRole = await req('POST', '/job-roles', {
    title: 'Java Backend Dev ' + Date.now(),
    description: 'Backend development with Java and Spring Boot',
    requiredSkills: ['Java', 'Spring Boot', 'MySQL'],
    roadmap: [
      { title: 'Core Java', description: 'Learn Java fundamentals', durationWeeks: 4 },
      { title: 'Spring Boot', description: 'REST APIs', durationWeeks: 6 },
    ],
  }, ADMIN_TOKEN);
  check('POST /job-roles → 201', createRole.status === 201, createRole.body);
  const createdRole = createRole.body?.data || createRole.body;
  roleId = createdRole?._id || '';
  check('POST /job-roles returns _id', !!roleId, createdRole);

  const listRoles = await req('GET', '/job-roles?page=1&limit=5', null, ADMIN_TOKEN);
  check('GET /job-roles → 200', listRoles.status === 200, listRoles.body);
  check('GET /job-roles has data array', Array.isArray(listRoles.body?.data?.data), listRoles.body?.data);
  check('GET /job-roles pagination', listRoles.body?.data?.page === 1, listRoles.body?.data);

  if (roleId) {
    const getRole = await req('GET', `/job-roles/${roleId}`, null, ADMIN_TOKEN);
    check('GET /job-roles/:id → 200', getRole.status === 200, getRole.body);
    const gotRole = getRole.body?.data || getRole.body;
    check('GET /job-roles/:id roadmap populated', Array.isArray(gotRole?.roadmap), gotRole);

    const patchRole = await req('PATCH', `/job-roles/${roleId}`, {
      description: 'Updated role description',
    }, ADMIN_TOKEN);
    check('PATCH /job-roles/:id → 200', patchRole.status === 200, patchRole.body);
  }

  console.log('\n=== PHASE 4: JOBS CRUD ===');

  if (companyId && roleId) {
    const createJob = await req('POST', '/jobs', {
      companyId,
      roleId,
      title: 'SDE-1 Java ' + Date.now(),
      location: 'Bangalore, India',
      jobType: 'Full-time',
      experienceRequired: '0-1 years',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      salaryPackage: { base: 10, variable: 2, currency: 'LPA' },
      eligibilityCriteria: {
        minimumCgpa: 7.0,
        allowedBranches: ['CSE', 'IT'],
        batchYears: [2025, 2026],
      },
    }, ADMIN_TOKEN);
    check('POST /jobs → 201', createJob.status === 201, createJob.body);
    const createdJob = createJob.body?.data || createJob.body;
    jobId = createdJob?._id || '';
    check('POST /jobs returns _id', !!jobId, createdJob);

    const listJobs = await req('GET', '/jobs?page=1&limit=5', null, ADMIN_TOKEN);
    check('GET /jobs → 200', listJobs.status === 200, listJobs.body);
    check('GET /jobs has data array', Array.isArray(listJobs.body?.data?.data), listJobs.body?.data);

    // Job type filter
    const typeFilter = await req('GET', '/jobs?jobType=Full-time&page=1&limit=5', null, ADMIN_TOKEN);
    check('GET /jobs?jobType=Full-time → 200', typeFilter.status === 200, typeFilter.body);

    // Invalid job type in POST
    const badJob = await req('POST', '/jobs', {
      companyId,
      roleId,
      title: 'Bad Job',
      location: 'Remote',
      jobType: 'INVALID_TYPE',
      experienceRequired: '0 years',
      deadline: new Date().toISOString(),
      salaryPackage: { base: 5, currency: 'LPA' },
    }, ADMIN_TOKEN);
    check('POST /jobs invalid jobType → 400', badJob.status === 400, badJob.body);

    if (jobId) {
      const getJob = await req('GET', `/jobs/${jobId}`, null, ADMIN_TOKEN);
      check('GET /jobs/:id → 200', getJob.status === 200, getJob.body);
      const gotJob = getJob.body?.data || getJob.body;
      check('GET /jobs/:id company populated', !!(gotJob?.companyId?.name || gotJob?.companyId?._id), gotJob);
      check('GET /jobs/:id role populated', !!(gotJob?.roleId?.title || gotJob?.roleId?._id), gotJob);

      const patchJob = await req('PATCH', `/jobs/${jobId}`, { location: 'Mumbai, India' }, ADMIN_TOKEN);
      check('PATCH /jobs/:id → 200', patchJob.status === 200, patchJob.body);
      const patchedJob = patchJob.body?.data || patchJob.body;
      check('PATCH /jobs/:id location updated', patchedJob?.location === 'Mumbai, India', patchedJob);
    }
  } else {
    check('POST /jobs skipped — no companyId or roleId', false, 'dependency missing');
  }

  console.log('\n=== PHASE 5: DELETE & 404 ===');

  if (jobId) {
    const delJob = await req('DELETE', `/jobs/${jobId}`, null, ADMIN_TOKEN);
    check('DELETE /jobs/:id → 200 or 204', delJob.status === 200 || delJob.status === 204, delJob);
    const afterDel = await req('GET', `/jobs/${jobId}`, null, ADMIN_TOKEN);
    check('GET /jobs/:id after delete → 404', afterDel.status === 404, afterDel);
  }

  if (roleId) {
    const delRole = await req('DELETE', `/job-roles/${roleId}`, null, ADMIN_TOKEN);
    check('DELETE /job-roles/:id → 200 or 204', delRole.status === 200 || delRole.status === 204, delRole);
  }

  if (companyId) {
    const delComp = await req('DELETE', `/companies/${companyId}`, null, ADMIN_TOKEN);
    check('DELETE /companies/:id → 200 or 204', delComp.status === 200 || delComp.status === 204, delComp);
    const afterDel = await req('GET', `/companies/${companyId}`, null, ADMIN_TOKEN);
    check('GET /companies/:id after delete → 404', afterDel.status === 404, afterDel);
  }

  console.log('\n=== RESULTS ===');
  results.forEach((r) => console.log(r));
  console.log(`\nTotal: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
