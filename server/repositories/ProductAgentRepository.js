/**
 * ProductAgentRepository - Manages product identification workflow state
 */
class ProductAgentRepository {
  constructor() {
    // In-memory storage for sessions (in production, use a database)
    this.sessions = new Map();
  }

  /**
   * Create a new product identification session
   */
  createSession(sessionData) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      image: sessionData.image || null,
      description: sessionData.description || '',
      answers: [],
      questions: [],
      currentQuestionIndex: 0,
      candidates: [],
      status: 'initial', // initial, questioning, searching, completed
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * Update a session
   */
  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  /**
   * Add an answer to a session
   */
  addAnswer(sessionId, questionId, answer) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    session.answers.push({
      questionId,
      answer,
      timestamp: new Date(),
    });
    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId() {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
  }

  /**
   * Clean up old sessions (older than 24 hours)
   */
  cleanupOldSessions() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.createdAt < twentyFourHoursAgo) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

module.exports = ProductAgentRepository;
