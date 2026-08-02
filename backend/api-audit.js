const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';

async function runApiAudit() {
  console.log('Fetching OpenAPI Spec...');
  let spec;
  try {
    const res = await axios.get(`${BASE_URL}/api/docs-json`);
    spec = res.data;
  } catch (err) {
    console.error('Failed to fetch OpenAPI spec', err.message);
    process.exit(1);
  }

  const paths = spec.paths;
  const report = [];

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(methods)) {
      if (path.includes('{')) continue; // skip parameterized routes for automated testing simplicity

      const url = `${BASE_URL}${path}`;
      const startTime = Date.now();
      let status;
      try {
        const res = await axios({ method, url, validateStatus: () => true });
        status = res.status;
      } catch (err) {
        status = err.response ? err.response.status : 'ERROR';
      }
      const duration = Date.now() - startTime;

      report.push({
        method: method.toUpperCase(),
        path,
        status,
        durationMs: duration
      });
      console.log(`[${method.toUpperCase()}] ${path} - ${status} (${duration}ms)`);
    }
  }

  fs.writeFileSync('api_audit_results.json', JSON.stringify(report, null, 2));
  console.log('API Audit complete. Wrote to api_audit_results.json');
}

runApiAudit();
