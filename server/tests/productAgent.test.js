const request = require('supertest');
const { createApp } = require('../app');
const ProductAgentRepository = require('../repositories/ProductAgentRepository');

describe('Product Agent API', () => {
  let app;
  let repository;

  beforeEach(() => {
    repository = new ProductAgentRepository();
    app = createApp(null, null, null, null, null, repository);
  });

  describe('POST /product-agent/sessions', () => {
    it('should create a new session with description', async () => {
      const response = await request(app)
        .post('/product-agent/sessions')
        .send({
          description: 'Blue wireless headphones',
        })
        .expect(201);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body.status).toBe('questioning');
      expect(response.body).toHaveProperty('question');
      expect(response.body.question).toHaveProperty('id');
      expect(response.body.question).toHaveProperty('text');
      expect(response.body.progress.total).toBeGreaterThan(0);
    });

    it('should create a new session with image', async () => {
      const response = await request(app)
        .post('/product-agent/sessions')
        .send({
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          description: 'A product',
        })
        .expect(201);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body.status).toBe('questioning');
    });

    it('should return 400 if no description or image provided', async () => {
      const response = await request(app)
        .post('/product-agent/sessions')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /product-agent/sessions/:sessionId/answers', () => {
    it('should accept an answer and return next question', async () => {
      // Create session first
      const createResponse = await request(app)
        .post('/product-agent/sessions')
        .send({
          description: 'Blue wireless headphones',
        });

      const sessionId = createResponse.body.sessionId;
      const questionId = createResponse.body.question.id;

      // Submit answer
      const response = await request(app)
        .post(`/product-agent/sessions/${sessionId}/answers`)
        .send({
          questionId: questionId,
          answer: 'Electronics',
        })
        .expect(200);

      expect(response.body.status).toBeDefined();
      // Should either continue questioning or complete
      if (response.body.status === 'questioning') {
        expect(response.body).toHaveProperty('question');
      } else if (response.body.status === 'completed') {
        expect(response.body).toHaveProperty('results');
      }
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .post('/product-agent/sessions/non-existent-id/answers')
        .send({
          questionId: 'category',
          answer: 'Electronics',
        })
        .expect(404);
    });

    it('should return 400 if answer is missing', async () => {
      const createResponse = await request(app)
        .post('/product-agent/sessions')
        .send({
          description: 'Test product',
        });

      const sessionId = createResponse.body.sessionId;

      await request(app)
        .post(`/product-agent/sessions/${sessionId}/answers`)
        .send({
          questionId: 'category',
        })
        .expect(400);
    });
  });

  describe('GET /product-agent/sessions/:sessionId', () => {
    it('should return session details', async () => {
      // Create session
      const createResponse = await request(app)
        .post('/product-agent/sessions')
        .send({
          description: 'Test product',
        });

      const sessionId = createResponse.body.sessionId;

      // Get session
      const response = await request(app)
        .get(`/product-agent/sessions/${sessionId}`)
        .expect(200);

      expect(response.body.sessionId).toBe(sessionId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('answers');
      expect(response.body).toHaveProperty('candidates');
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .get('/product-agent/sessions/non-existent-id')
        .expect(404);
    });
  });

  describe('DELETE /product-agent/sessions/:sessionId', () => {
    it('should delete a session', async () => {
      // Create session
      const createResponse = await request(app)
        .post('/product-agent/sessions')
        .send({
          description: 'Test product',
        });

      const sessionId = createResponse.body.sessionId;

      // Delete session
      await request(app)
        .delete(`/product-agent/sessions/${sessionId}`)
        .expect(204);

      // Verify it's deleted
      await request(app)
        .get(`/product-agent/sessions/${sessionId}`)
        .expect(404);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .delete('/product-agent/sessions/non-existent-id')
        .expect(404);
    });
  });

  describe('Complete workflow', () => {
    it('should complete full question and answer flow', async () => {
      // Create session
      const createResponse = await request(app)
        .post('/product-agent/sessions')
        .send({
          description: 'Blue wireless Sony headphones model WH-1000XM4',
        });

      let sessionId = createResponse.body.sessionId;
      let status = createResponse.body.status;
      let question = createResponse.body.question;

      // Answer questions until completed
      let maxIterations = 10;
      let iteration = 0;

      while (status === 'questioning' && iteration < maxIterations) {
        const answerResponse = await request(app)
          .post(`/product-agent/sessions/${sessionId}/answers`)
          .send({
            questionId: question.id,
            answer: 'Test answer ' + iteration,
          })
          .expect(200);

        status = answerResponse.body.status;
        question = answerResponse.body.question;
        iteration++;

        if (status === 'completed') {
          expect(answerResponse.body.results).toBeDefined();
          expect(answerResponse.body.results.candidates).toBeInstanceOf(Array);
          expect(answerResponse.body.results.candidates.length).toBeGreaterThan(0);

          // Verify candidate structure
          const candidate = answerResponse.body.results.candidates[0];
          expect(candidate).toHaveProperty('name');
          expect(candidate).toHaveProperty('manufacturer');
          expect(candidate).toHaveProperty('model');
          expect(candidate).toHaveProperty('sku');
          expect(candidate).toHaveProperty('confidence');
          expect(candidate.confidence).toBeGreaterThan(0);
          expect(candidate.confidence).toBeLessThanOrEqual(1);
          break;
        }
      }

      expect(status).toBe('completed');
    }, 15000);
  });
});
