import React, { useState, useEffect } from 'react';
import './ResourceSkillsManager.css';

export default function ResourceSkillsManager({ preSelectedResourceId }) {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(preSelectedResourceId || null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [assignedSkills, setAssignedSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('Intermediate');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchResources() {
    try {
      const response = await fetch('http://localhost:4000/human-resources');
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchSkills() {
    try {
      const response = await fetch('http://localhost:4000/skills');
      if (!response.ok) throw new Error('Failed to fetch skills');
      const data = await response.json();
      setAvailableSkills(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSelectResource(resourceId) {
    setSelectedResource(resourceId);
    setSelectedSkill('');
    setProficiencyLevel('Intermediate');
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:4000/resource-skills/${resourceId}`);
      if (!response.ok) throw new Error('Failed to fetch assigned skills');
      const data = await response.json();
      setAssignedSkills(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchResources();
    fetchSkills();
  }, []);

  useEffect(() => {
    if (preSelectedResourceId) {
      handleSelectResource(preSelectedResourceId);
    }
  }, [preSelectedResourceId]);

  async function handleAddSkill(e) {
    e.preventDefault();
    if (!selectedResource || !selectedSkill) {
      setError('Please select a resource and a skill');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/resource-skills/${selectedResource}/skills/${selectedSkill}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proficiencyLevel }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add skill');
      }

      setSelectedSkill('');
      setProficiencyLevel('Intermediate');
      await handleSelectResource(selectedResource);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveSkill(skillId) {
    if (!confirm('Are you sure?')) return;

    try {
      const response = await fetch(
        `http://localhost:4000/resource-skills/${selectedResource}/skills/${skillId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to remove skill');
      await handleSelectResource(selectedResource);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateProficiency(skillId, newLevel) {
    try {
      const response = await fetch(
        `http://localhost:4000/resource-skills/${selectedResource}/skills/${skillId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proficiencyLevel: newLevel }),
        }
      );

      if (!response.ok) throw new Error('Failed to update proficiency');
      await handleSelectResource(selectedResource);
    } catch (err) {
      setError(err.message);
    }
  }

  const selectedResourceObj = resources.find((r) => r.Id === selectedResource);
  const unassignedSkills = availableSkills
    .filter((skill) => !assignedSkills.find((as) => as.SkillId === skill.Id))
    .sort((a, b) => a.SkillName.localeCompare(b.SkillName));

  const sortedAssignedSkills = [...assignedSkills].sort((a, b) =>
    a.SkillName.localeCompare(b.SkillName)
  );

  return (
    <div className="container">
      <h2>Assign Skills to Resources</h2>
      {error && <div className="error">{error}</div>}

      <div className="resource-selector">
        <label htmlFor="resource-select">Select Resource:</label>
        <select
          id="resource-select"
          value={selectedResource || ''}
          onChange={(e) => handleSelectResource(e.target.value)}
        >
          <option value="">-- Choose a resource --</option>
          {resources.map((r) => (
            <option key={r.Id} value={r.Id}>
              {r.FirstName} {r.LastName}
            </option>
          ))}
        </select>
      </div>

      {selectedResource && (
        <>
          <div className="resource-info">
            <h3>
              {selectedResourceObj?.FirstName} {selectedResourceObj?.LastName}
            </h3>
            <p>
              <strong>Position:</strong> {selectedResourceObj?.Position}
            </p>
            <p>
              <strong>Email:</strong> {selectedResourceObj?.Email}
            </p>
          </div>

          <form onSubmit={handleAddSkill} className="form">
            <h4>Add Skill</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="skill-select">Skill:</label>
                <select
                  id="skill-select"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                >
                  <option value="">-- Choose a skill --</option>
                  {unassignedSkills.map((s) => (
                    <option key={s.Id} value={s.Id}>
                      {s.SkillName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="proficiency-select">Proficiency Level:</label>
                <select
                  id="proficiency-select"
                  value={proficiencyLevel}
                  onChange={(e) => setProficiencyLevel(e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <button type="submit" className="btn-add">
                Add Skill
              </button>
            </div>
          </form>

          <div className="skills-section">
            <h4>Assigned Skills</h4>
            {assignedSkills.length === 0 ? (
              <p className="empty-message">No skills assigned yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Skill Name</th>
                    <th>Description</th>
                    <th>Proficiency Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAssignedSkills.map((as) => (
                    <tr key={as.SkillId}>
                      <td>{as.SkillName}</td>
                      <td>{as.Description}</td>
                      <td>
                        <select
                          value={as.ProficiencyLevel}
                          onChange={(e) => handleUpdateProficiency(as.SkillId, e.target.value)}
                          className="proficiency-select"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => handleRemoveSkill(as.SkillId)}
                          className="btn-remove"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
