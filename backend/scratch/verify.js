const http = require('http');

const API_BASE = 'http://localhost:3001/api/v1';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAudit() {
  console.log('=== STARTING AUDIT VERIFICATION ===\n');

  // 1. Health check & MongoDB Live
  console.log('[1] Checking MongoDB Health & Connection...');
  const healthRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/v1/health/db/live',
    method: 'GET',
  });
  console.log('MongoDB Live Status Code:', healthRes.statusCode);
  console.log('Database Connection State:', healthRes.body.data?.connection?.state);
  console.log('Database Name:', healthRes.body.data?.connection?.database);
  console.log('Ping Time (ms):', healthRes.body.data?.connection?.pingMs);

  // 2. Authentication Test
  console.log('\n[2] Checking Authentication Endpoints...');
  const loginRes = await request(
    {
      host: 'localhost',
      port: 3001,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'student@kredl.com', password: 'Student@123' },
  );
  console.log('Student Login Response Status Code:', loginRes.statusCode);
  const studentToken = loginRes.body.data?.accessToken;
  console.log('Student JWT Generation Check:', studentToken ? 'SUCCESS' : 'FAILED');

  const adminLoginRes = await request(
    {
      host: 'localhost',
      port: 3001,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@kredl.com', password: 'Admin@123' },
  );
  console.log('Admin Login Response Status Code:', adminLoginRes.statusCode);
  const adminToken = adminLoginRes.body.data?.accessToken;

  // 3. Authorization Verification
  console.log('\n[3] Checking Protected & Role-Based Routes...');
  const unauthorizedRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/v1/admin/analytics/quizzes',
    method: 'GET',
  });
  console.log('Access without Token (should be 401):', unauthorizedRes.statusCode);

  const forbiddenRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/v1/admin/analytics/quizzes',
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  console.log('Student Accessing Admin Route (should be 403):', forbiddenRes.statusCode);

  const authorizedRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/v1/admin/analytics/quizzes',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('Admin Accessing Admin Route (should be 200):', authorizedRes.statusCode);

  // 4. API Endpoints Check
  console.log('\n[4] Performing Endpoint Audits...');
  const endpoints = [
    { name: 'Courses', path: '/api/v1/courses', method: 'GET', auth: studentToken },
    { name: 'Companies', path: '/api/v1/companies', method: 'GET', auth: studentToken },
    { name: 'Job Roles', path: '/api/v1/job-roles', method: 'GET', auth: studentToken },
    { name: 'Jobs', path: '/api/v1/jobs', method: 'GET', auth: studentToken },
  ];

  for (const ep of endpoints) {
    const start = Date.now();
    const res = await request({
      host: 'localhost',
      port: 3001,
      path: ep.path,
      method: ep.method,
      headers: { Authorization: `Bearer ${ep.auth}` },
    });
    const duration = Date.now() - start;
    console.log(`- Endpoint [${ep.name}] ${ep.method} ${ep.path} -> Status: ${res.statusCode} in ${duration}ms (${res.body.success ? 'SUCCESS' : 'FAILURE'})`);
  }

  // Fetch Course details to verify Course modules, lessons, and progress
  const coursesRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/v1/courses',
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const firstCourseId = coursesRes.body.data?.[0]?._id;

  if (firstCourseId) {
    // Modules check
    const mStart = Date.now();
    const modulesRes = await request({
      host: 'localhost',
      port: 3001,
      path: `/api/v1/courses/${firstCourseId}/modules`,
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(`- Endpoint [Modules] GET /api/v1/courses/${firstCourseId}/modules -> Status: ${modulesRes.statusCode} in ${Date.now() - mStart}ms`);
    
    // Progress check
    const pStart = Date.now();
    const progressRes = await request({
      host: 'localhost',
      port: 3001,
      path: `/api/v1/progress/course/${firstCourseId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(`- Endpoint [Progress] GET /api/v1/progress/course/${firstCourseId} -> Status: ${progressRes.statusCode} in ${Date.now() - pStart}ms`);
  }

  // 5. CRUD Database Operation Verification
  console.log('\n[5] Verifying Mongoose CRUD Operations via Projects API...');
  
  // CREATE
  const createRes = await request(
    {
      host: 'localhost',
      port: 3001,
      path: '/api/v1/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      courseId: new Types.ObjectId().toString(), // Generates random ID for test
      title: 'Audit Test Project ' + Date.now(),
      description: 'Temporary project created during audit verification.',
      technologies: ['Node.js', 'Express'],
      difficulty: 'Beginner',
      learningOutcomes: ['Understand REST CRUD flows'],
    },
  );
  console.log('CRUD - Create Project Status Code:', createRes.statusCode);
  const projectId = createRes.body.data?._id;
  console.log('CRUD - Created Project ID:', projectId);

  // READ
  const readRes = await request({
    host: 'localhost',
    port: 3001,
    path: `/api/v1/projects/${projectId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  console.log('CRUD - Read Project Status Code:', readRes.statusCode);
  console.log('CRUD - Read Project Name Matching:', readRes.body.data?._id === projectId ? 'MATCHED' : 'MISMATCHED');

  // UPDATE
  const updateRes = await request(
    {
      host: 'localhost',
      port: 3001,
      path: `/api/v1/projects/${projectId}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { description: 'Updated during audit execution.' },
  );
  console.log('CRUD - Update Project Status Code:', updateRes.statusCode);
  console.log('CRUD - Updated Description Matching:', updateRes.body.data?.description === 'Updated during audit execution.' ? 'MATCHED' : 'MISMATCHED');

  // DELETE
  const deleteRes = await request({
    host: 'localhost',
    port: 3001,
    path: `/api/v1/projects/${projectId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('CRUD - Delete Project Status Code:', deleteRes.statusCode);

  // VERIFY DELETED
  const verifyRes = await request({
    host: 'localhost',
    port: 3001,
    path: `/api/v1/projects/${projectId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  console.log('CRUD - Read Deleted Project (should be 404):', verifyRes.statusCode);

  console.log('\n=== AUDIT VERIFICATION COMPLETED ===');
}

// Add mock/temp Types definition for Node script
const Types = {
  ObjectId: function() {
    this.toString = () => Math.random().toString(16).substring(2, 10).padStart(24, '0');
  }
};

runAudit().catch(console.error);
