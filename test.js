async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@taskflow.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    console.log('Login successful:', loginData);
    const token = loginData.token;

    const res = await fetch('http://localhost:5000/api/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

test();
