const adminEmail = "admin@kredl.dev";
const studentEmail = "student@kredl.dev";
const baseUrl = "http://localhost:3001/api/v1";

async function test() {
  console.log("1. Login Admin & Student");
  const adminRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: "Admin@123" })
  });
  const adminToken = (await adminRes.json()).data.accessToken;
  const adminHeaders = { "Authorization": `Bearer ${adminToken}`, "Content-Type": "application/json" };

  const studentRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: studentEmail, password: "Student@123" })
  });
  const studentToken = (await studentRes.json()).data.accessToken;
  const studentHeaders = { "Authorization": `Bearer ${studentToken}`, "Content-Type": "application/json" };

  console.log("2. Create UNPUBLISHED Course");
  const createRes = await fetch(`${baseUrl}/admin/courses`, {
    method: "POST", headers: adminHeaders,
    body: JSON.stringify({
      title: "Secret Audit Course", shortDescription: "Short", description: "Long",
      category: "Software Development", difficulty: "Beginner", thumbnail: "thumb.jpg",
      estimatedDuration: "10h", isPublished: false
    })
  });
  const courseId = (await createRes.json()).data.id;

  console.log("3. Student Tries to Enroll in UNPUBLISHED Course");
  const enrollRes = await fetch(`${baseUrl}/progress/courses/${courseId}/enroll`, {
    method: "POST", headers: studentHeaders
  });
  const enrollData = await enrollRes.json();
  console.log("Enroll Result (should be error):", enrollData);
}

test().catch(console.error);
