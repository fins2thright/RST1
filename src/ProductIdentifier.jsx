import React, { useState } from 'react';
import './ProductIdentifier.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function ProductIdentifier() {
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState('initial'); // initial, questioning, searching, completed
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    setError(null);
    if (!description && !imageFile) {
      setError('Please provide either a description or an image');
      return;
    }

    try {
      // Convert image to base64 if present
      let imageData = null;
      if (imageFile) {
        imageData = await fileToBase64(imageFile);
      }

      const response = await fetch(`${API_BASE}/product-agent/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          image: imageData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start analysis');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setStatus(data.status);
      setCurrentQuestion(data.question);
      setProgress(data.progress);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitAnswer = async () => {
    setError(null);
    if (!currentAnswer.trim()) {
      setError('Please provide an answer');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/product-agent/sessions/${sessionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: currentAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();

      // Store the answered question
      setAnswers([...answers, { question: currentQuestion.text, answer: currentAnswer }]);
      setCurrentAnswer('');

      if (data.status === 'questioning') {
        setCurrentQuestion(data.question);
        setProgress(data.progress);
      } else if (data.status === 'completed') {
        setStatus('completed');
        setResults(data.results);
        setCurrentQuestion(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    setSessionId(null);
    setStatus('initial');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setCurrentQuestion(null);
    setCurrentAnswer('');
    setProgress({ current: 0, total: 0 });
    setResults(null);
    setError(null);
    setAnswers([]);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="product-identifier">
      <h1>Product Identifier</h1>
      <p className="subtitle">
        Upload a photo and/or provide a description to identify your product
      </p>

      {error && <div className="error-message">{error}</div>}

      {status === 'initial' && (
        <div className="input-section">
          <div className="form-group">
            <label htmlFor="description">Product Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product (e.g., 'Blue wireless headphones with noise cancellation')"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Product Photo:</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Product preview" />
              </div>
            )}
          </div>

          <button onClick={handleStartAnalysis} className="btn-primary">
            Start Analysis
          </button>
        </div>
      )}

      {status === 'questioning' && currentQuestion && (
        <div className="questioning-section">
          <div className="progress-bar">
            <div className="progress-text">
              Question {progress.current + 1} of {progress.total}
            </div>
            <div className="progress-bar-fill">
              <div
                className="progress-bar-inner"
                style={{ width: `${((progress.current + 1) / progress.total) * 100}%` }}
              />
            </div>
          </div>

          {answers.length > 0 && (
            <div className="previous-answers">
              <h3>Previous Answers:</h3>
              {answers.map((qa, index) => (
                <div key={index} className="answer-item">
                  <strong>Q:</strong> {qa.question}
                  <br />
                  <strong>A:</strong> {qa.answer}
                </div>
              ))}
            </div>
          )}

          <div className="question-box">
            <h2>Question:</h2>
            <p className="question-text">{currentQuestion.text}</p>

            <div className="form-group">
              <label htmlFor="answer">Your Answer:</label>
              <input
                type="text"
                id="answer"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                placeholder="Type your answer here..."
              />
            </div>

            <button onClick={handleSubmitAnswer} className="btn-primary">
              Submit Answer
            </button>
          </div>
        </div>
      )}

      {status === 'completed' && results && (
        <div className="results-section">
          <h2>Product Candidates</h2>
          <p className="results-summary">
            Found {results.totalFound} products, showing {results.totalFiltered} best matches
          </p>

          {results.characteristics && (
            <div className="characteristics-box">
              <h3>Identified Characteristics:</h3>
              <ul>
                {Object.entries(results.characteristics).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace('_', ' ')}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="candidates-list">
            {results.candidates.map((candidate) => (
              <div key={candidate.id} className="candidate-card">
                <div className="candidate-header">
                  <h3>{candidate.name}</h3>
                  <span className="confidence-badge">
                    {Math.round(candidate.confidence * 100)}% match
                  </span>
                </div>

                <div className="candidate-details">
                  <div className="detail-row">
                    <span className="detail-label">Manufacturer:</span>
                    <span className="detail-value">{candidate.manufacturer}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Model:</span>
                    <span className="detail-value">{candidate.model}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">SKU:</span>
                    <span className="detail-value">{candidate.sku}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{candidate.category}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Color:</span>
                    <span className="detail-value">{candidate.color}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">{candidate.price}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Source:</span>
                    <span className="detail-value">{candidate.source}</span>
                  </div>
                </div>

                <div className="matched-characteristics">
                  <strong>Matched characteristics:</strong>{' '}
                  {candidate.matchedCharacteristics.join(', ')}
                </div>

                {candidate.url && (
                  <a
                    href={candidate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-link"
                  >
                    View Product
                  </a>
                )}
              </div>
            ))}
          </div>

          <button onClick={handleReset} className="btn-secondary">
            Start New Analysis
          </button>
        </div>
      )}
    </div>
  );
}
