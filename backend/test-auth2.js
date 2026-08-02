const jwt = require('jsonwebtoken');
// using a dummy token since we just need it to pass JwtAuthGuard to reach ValidationPipe
const token = jwt.sign({ sub: "6a5645e732a5709374b55fe5", role: "admin", email: "admin@test.com" }, 'your-secret-key-for-jwt-keep-it-safe', { expiresIn: '1d' });
console.log(token);
