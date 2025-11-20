const express = require('express');
const { body, validationResult } = require('express-validator');

module.exports = function createResourceSkillsRouter(repo) {
  const router = express.Router();

  // Get all skills for a specific resource
  router.get('/:resourceId', async (req, res) => {
    try {
      const skills = await repo.getSkillsForResource(req.params.resourceId);
      res.json(skills);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Add a skill to a resource
  router.post(
    '/:resourceId/skills/:skillId',
    body('proficiencyLevel').optional().isString().trim(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      try {
        const proficiencyLevel = req.body.proficiencyLevel || 'Intermediate';
        const resourceSkill = await repo.addSkillToResource(
          req.params.resourceId,
          req.params.skillId,
          proficiencyLevel
        );
        res.status(201).json(resourceSkill);
      } catch (err) {
        console.error(err);
        if (err.message.includes('not found') || err.message.includes('already assigned')) {
          res.status(400).json({ error: err.message });
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    }
  );

  // Update proficiency level for a skill on a resource
  router.put(
    '/:resourceId/skills/:skillId',
    body('proficiencyLevel').isString().trim().notEmpty(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      try {
        const updated = await repo.updateProficiencyLevel(
          req.params.resourceId,
          req.params.skillId,
          req.body.proficiencyLevel
        );
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json(updated);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  // Remove a skill from a resource
  router.delete('/:resourceId/skills/:skillId', async (req, res) => {
    try {
      const deleted = await repo.removeSkillFromResource(req.params.resourceId, req.params.skillId);
      if (!deleted) return res.status(404).json({ error: 'Not found' });
      res.json({ deletedId: deleted.Id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
