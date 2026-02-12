const express = require('express');
const ProductAgentService = require('../services/ProductAgentService');

function createProductAgentRoutes(repository) {
  const router = express.Router();
  const service = new ProductAgentService();

  /**
   * POST /product-agent/sessions
   * Create a new product identification session
   */
  router.post('/sessions', async (req, res) => {
    try {
      const { image, description } = req.body;

      // Validate input
      if (!description && !image) {
        return res.status(400).json({
          error: 'At least one of image or description is required',
        });
      }

      // Create session
      const session = repository.createSession({
        image,
        description,
      });

      // Analyze initial input and get first question
      const analysis = service.analyzeInitialInput(image, description);

      // Update session with first question
      const updatedSession = repository.updateSession(session.id, {
        questions: analysis.allQuestions,
        currentQuestionIndex: 0,
        status: 'questioning',
      });

      res.status(201).json({
        sessionId: session.id,
        status: 'questioning',
        question: analysis.nextQuestion,
        progress: {
          current: 0,
          total: analysis.allQuestions.length,
        },
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  /**
   * POST /product-agent/sessions/:sessionId/answers
   * Submit an answer to the current question
   */
  router.post('/sessions/:sessionId/answers', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { questionId, answer } = req.body;

      // Validate input
      if (!questionId || !answer) {
        return res.status(400).json({
          error: 'questionId and answer are required',
        });
      }

      // Get session
      const session = repository.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Add answer
      repository.addAnswer(sessionId, questionId, answer);
      const updatedSession = repository.getSession(sessionId);

      // Check if we should continue questioning or search
      const shouldContinue = service.shouldContinueQuestioning(updatedSession.answers);

      if (shouldContinue && updatedSession.currentQuestionIndex + 1 < updatedSession.questions.length) {
        // Get next question
        const nextIndex = updatedSession.currentQuestionIndex + 1;
        const nextQuestion = updatedSession.questions[nextIndex];

        // Check if next question is conditional and should be skipped
        let actualNextQuestion = nextQuestion;
        let actualNextIndex = nextIndex;

        while (
          actualNextQuestion &&
          actualNextQuestion.conditional &&
          !actualNextQuestion.conditional(updatedSession.answers)
        ) {
          actualNextIndex++;
          actualNextQuestion = updatedSession.questions[actualNextIndex];
        }

        if (actualNextQuestion) {
          repository.updateSession(sessionId, {
            currentQuestionIndex: actualNextIndex,
          });

          return res.json({
            status: 'questioning',
            question: actualNextQuestion,
            progress: {
              current: actualNextIndex,
              total: updatedSession.questions.length,
            },
          });
        }
      }

      // No more questions or enough info - start search
      repository.updateSession(sessionId, {
        status: 'searching',
      });

      // Perform analysis
      const results = await service.completeAnalysis(updatedSession);

      // Update session with results
      repository.updateSession(sessionId, {
        status: 'completed',
        candidates: results.candidates,
      });

      res.json({
        status: 'completed',
        results: {
          candidates: results.candidates,
          characteristics: results.characteristics,
          totalFound: results.totalFound,
          totalFiltered: results.totalFiltered,
        },
      });
    } catch (error) {
      console.error('Error processing answer:', error);
      res.status(500).json({ error: 'Failed to process answer' });
    }
  });

  /**
   * GET /product-agent/sessions/:sessionId
   * Get session details
   */
  router.get('/sessions/:sessionId', (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = repository.getSession(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({
        sessionId: session.id,
        status: session.status,
        answers: session.answers,
        candidates: session.candidates || [],
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      });
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  });

  /**
   * DELETE /product-agent/sessions/:sessionId
   * Delete a session
   */
  router.delete('/sessions/:sessionId', (req, res) => {
    try {
      const { sessionId } = req.params;
      const deleted = repository.deleteSession(sessionId);

      if (!deleted) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  });

  return router;
}

module.exports = createProductAgentRoutes;
