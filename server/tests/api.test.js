const request = require('supertest');
const { createApp } = require('../src/app');
const { resetStore, seedDemoUsers } = require('../src/services/store');

describe('API', () => {
  let app;

  beforeEach(async () => {
    resetStore();
    await seedDemoUsers();
    app = createApp();
  });

  test('health route works', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  test('login route returns a jwt', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@queuecure.dev', password: 'Password123!' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
  });

  test('patient creation requires auth', async () => {
    const response = await request(app).post('/api/patients').send({});
    expect(response.status).toBe(401);
  });
});