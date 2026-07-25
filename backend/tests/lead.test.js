import request from 'supertest';
import app from '../server.js';
import { sequelize } from '../src/database/models/index.js';

describe('Leads API', () => {
  let adminToken = '';
  let memberToken = '';
  let adminUser, memberUser;
  let capturedLeadId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@leadflow.com',
        password: 'password123',
        role: 'admin'
      });
    adminToken = adminRes.body.data.accessToken;
    adminUser = adminRes.body.data.user;

    const memberRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Member User',
        email: 'member@leadflow.com',
        password: 'password123',
        role: 'member'
      });
    memberToken = memberRes.body.data.accessToken;
    memberUser = memberRes.body.data.user;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('POST /api/leads/capture - Should capture lead publicly', async () => {
    const res = await request(app)
      .post('/api/leads/capture')
      .send({
        name: 'John Doe',
        email: 'john@acme.com',
        company: 'ACME Corp',
        phone: '1234567890',
        message: 'Interested in LeadFlow CRM!'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('John Doe');
    expect(res.body.data.status).toBe('new');

    capturedLeadId = res.body.data.id;
  });

  test('GET /api/leads - Admin should see all leads', async () => {
    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.leads.length).toBeGreaterThan(0);
  });

  test('GET /api/leads - Member should see no leads (since none assigned)', async () => {
    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.leads.length).toBe(0);
  });

  test('PUT /api/leads/:id/assign - Admin should assign lead to member', async () => {
    const res = await request(app)
      .put(`/api/leads/${capturedLeadId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assignedTo: memberUser.id
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assignedTo).toBe(memberUser.id);
  });

  test('GET /api/leads - Member should now see 1 assigned lead', async () => {
    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.leads.length).toBe(1);
    expect(res.body.data.leads[0].id).toBe(capturedLeadId);
  });

  test('PUT /api/leads/:id/status - Member should update assigned lead status', async () => {
    const res = await request(app)
      .put(`/api/leads/${capturedLeadId}/status`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        status: 'contacted'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('contacted');
  });

  test('POST /api/leads/:id/notes - Member should add note to assigned lead', async () => {
    const res = await request(app)
      .post(`/api/leads/${capturedLeadId}/notes`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        note: 'Spoke with John. Very interested.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.note).toBe('Spoke with John. Very interested.');
  });
});
