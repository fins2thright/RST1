const request = require('supertest');
const { createApp } = require('../app');

describe('Human-Resource routes', () => {
  let app;
  const sample = {
    Id: '00000000-0000-0000-0000-000000000001',
    FirstName: 'Test',
    LastName: 'User',
    Email: 'test@example.com',
    Position: 'Dev'
  };

  beforeAll(() => {
    // mock repository with jest-like methods
    const mockRepo = {
      getAll: jest.fn().mockResolvedValue([sample]),
      getById: jest.fn().mockImplementation(id => Promise.resolve(id === sample.Id ? sample : null)),
      create: jest.fn().mockImplementation(async (p) => ({ ...sample, FirstName: p.firstName, LastName: p.lastName })),
      update: jest.fn().mockImplementation(async (id, p) => (id === sample.Id ? { ...sample, FirstName: p.firstName || sample.FirstName } : null)),
      delete: jest.fn().mockImplementation(async (id) => (id === sample.Id ? { Id: id } : null))
    };
    app = createApp(mockRepo);
  });

  test('GET /human-resources returns list', async () => {
    const res = await request(app).get('/human-resources');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /human-resources/:id returns item', async () => {
    const res = await request(app).get(`/human-resources/${sample.Id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.Id).toBe(sample.Id);
  });

  test('POST /human-resources validates and creates', async () => {
    const res = await request(app).post('/human-resources').send({ firstName: 'New', lastName: 'Person' });
    expect([201,200]).toContain(res.statusCode);
    expect(res.body.FirstName || res.body.firstName).toBeDefined();
  });

  test('PUT /human-resources/:id updates', async () => {
    const res = await request(app).put(`/human-resources/${sample.Id}`).send({ firstName: 'Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.FirstName).toBe('Updated');
  });

  test('DELETE /human-resources/:id deletes', async () => {
    const res = await request(app).delete(`/human-resources/${sample.Id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.deletedId || res.body.deletedId === sample.Id).toBeTruthy();
  });
});
