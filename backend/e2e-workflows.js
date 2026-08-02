const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3001/api/v1';

async function runE2E() {
  console.log('Starting E2E Workflow Simulations...');
  
  const results = {
    admin: [],
    student: [],
    tpo: []
  };

  const users = [
    { role: 'admin', email: 'admin@kredl.dev', password: 'Admin@123' },
    { role: 'student', email: 'student@kredl.dev', password: 'Student@123' },
    { role: 'tpo', email: 'tpo@kredl.dev', password: 'TPO@123' }
  ];

  for (const user of users) {
    try {
      console.log(`\nLogging in as ${user.email}...`);
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: user.email,
        password: user.password
      }, { validateStatus: () => true });

      if (loginRes.status !== 200 && loginRes.status !== 201) {
        console.log(`Failed to login as ${user.role}: ${loginRes.status}`);
        continue;
      }

      // Extract access token
      const accessToken = loginRes.data.accessToken;

      const api = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${accessToken}` },
        validateStatus: () => true
      });

      // Simulate endpoints based on role
      const endpoints = {
        admin: [
          { method: 'GET', url: '/auth/me' },
          { method: 'GET', url: '/admin/courses' },
          { method: 'GET', url: '/admin/courses/stats' },
          { method: 'GET', url: '/admin/quizzes' },
          { method: 'GET', url: '/admin/analytics/quizzes' },
          { method: 'GET', url: '/companies' }
        ],
        student: [
          { method: 'GET', url: '/auth/me' },
          { method: 'GET', url: '/courses' },
          { method: 'GET', url: '/dashboard' },
          { method: 'GET', url: '/dashboard/continue-learning' },
          { method: 'GET', url: '/dashboard/progress' },
          { method: 'GET', url: '/jobs' }
        ],
        tpo: [
          { method: 'GET', url: '/auth/me' },
          { method: 'GET', url: '/companies' },
          { method: 'GET', url: '/jobs' }
        ]
      };

      for (const req of endpoints[user.role]) {
        const start = Date.now();
        const res = await api({ method: req.method, url: req.url });
        const latency = Date.now() - start;
        console.log(`[${user.role.toUpperCase()}] ${req.method} ${req.url} -> ${res.status} (${latency}ms)`);
        results[user.role].push({
          method: req.method,
          url: req.url,
          status: res.status,
          latency
        });
      }

    } catch (e) {
      console.error(`Error simulating ${user.role}:`, e.message);
    }
  }

  fs.writeFileSync('e2e_workflow_results.json', JSON.stringify(results, null, 2));
  console.log('\nE2E Workflows complete. Written to e2e_workflow_results.json');
}

runE2E();
