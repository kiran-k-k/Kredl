const axios = require('axios');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ sub: '6a509779cd28700a6a29daf0', role: 'admin' }, 'super_secret_jwt_key_123', { expiresIn: '1h' });

async function run() {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/jobs', {
      title: "Software Engineer",
      companyId: "6a509779cd28700a6a29daf0",
      roleId: "6a509779cd28700a6a29daf0",
      location: "Bangalore",
      employmentType: "Full-time",
      workMode: "On-site",
      experienceRequired: "0-2 years",
      jobSummary: "Test job",
      requiredSkills: ["Java", "Spring Boot"],
      status: "ACTIVE",
      deadline: "2026-12-31T00:00:00.000Z",
      salary: {
        min: 10,
        currency: "INR",
        period: "LPA"
      },
      eligibilityCriteria: {
        allowedBranches: ["CSE"],
        batchYears: [2024]
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success:", res.data);
  } catch(e) {
    console.log("Validation Failed:", JSON.stringify(e.response ? e.response.data : e.message, null, 2));
  }
}
run();
