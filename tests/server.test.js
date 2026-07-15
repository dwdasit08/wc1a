const request = require('supertest');
const app = require('../server'); // we need to export app from server.js

describe('WCIA Server', () => {
  it('should serve index.html', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('WHEELCHAIR CRICKET INDIA ASSOCIATION');
  });

  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('should handle contact API', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Test', email: 'test@example.com', message: 'Hello' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});