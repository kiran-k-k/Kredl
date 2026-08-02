const email = "admin@kredl.dev";
const password = "Admin@123";
const baseUrl = "http://localhost:3001/api/v1";

async function test() {
  console.log("1. Login");
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error("Login failed: " + JSON.stringify(loginData));
  
  const token = loginData.data.accessToken;
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  console.log("2. Create Course");
  const createRes = await fetch(`${baseUrl}/admin/courses`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: "Test Audit Course",
      shortDescription: "Short desc",
      description: "Long desc",
      category: "Software Development",
      difficulty: "Beginner",
      thumbnail: "http://example.com/thumb.jpg",
      estimatedDuration: "10h",
      isPublished: true
    })
  });
  const createData = await createRes.json();
  console.log("Create Response:", createData);
  if (!createRes.ok) throw new Error("Create failed");
  const courseId = createData.data ? createData.data.id : createData.id;

  console.log("3. Read Courses");
  const readRes = await fetch(`${baseUrl}/admin/courses?search=Test`, { headers });
  const readData = await readRes.json();
  console.log("Found:", readData.data ? readData.data.length : readData.length, "courses matching 'Test'");

  console.log("4. Update Course");
  const updateRes = await fetch(`${baseUrl}/admin/courses/${courseId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ title: "Test Audit Course Updated" })
  });
  const updateData = await updateRes.json();
  console.log("Updated title:", updateData.data ? updateData.data.title : updateData.title);

  console.log("5. Delete Course");
  const deleteRes = await fetch(`${baseUrl}/admin/courses/${courseId}`, {
    method: "DELETE",
    headers
  });
  console.log("Delete status:", deleteRes.status);
  
  console.log("6. Verify Read after Delete");
  const readRes2 = await fetch(`${baseUrl}/admin/courses?search=Test`, { headers });
  const readData2 = await readRes2.json();
  console.log("Found after delete:", readData2.data ? readData2.data.length : readData2.length, "courses matching 'Test'");
}

test().catch(console.error);
