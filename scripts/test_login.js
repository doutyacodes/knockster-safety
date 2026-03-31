async function testLogin() {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'moderator@sandbox.test', password: 'MasterPwd123!' })
  });
  const text = await res.text();
  console.log('Status:', res.status, 'Body:', text);
}

testLogin();
