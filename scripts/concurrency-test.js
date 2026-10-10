// node scripts/concurrency-test.js  (API must be running; uses the demo user)
(async () => {
  const B = process.env.API || 'http://localhost:5000/api', H = { 'Content-Type': 'application/json' };
  const { token } = await (await fetch(B + '/auth/login', { method: 'POST', headers: H, body: JSON.stringify({ email: 'demo@veloop.in', password: 'Demo@123' }) })).json();
  const A = { ...H, Authorization: 'Bearer ' + token };
  await fetch(B + '/dev/reset', { method: 'POST', headers: A });
  const rs = await Promise.all(Array.from({ length: 6 }, () => fetch(B + '/daily-streak/claim', { method: 'POST', headers: A, body: JSON.stringify({ day: 1, reward: 99999 }) }).then((r) => r.status)));
  console.log('statuses:', rs.join(','), '| successes:', rs.filter((x) => x === 200).length, '(expected 1)');
})();
