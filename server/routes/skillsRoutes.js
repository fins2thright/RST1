const express = require('express');
const { body, validationResult } = require('express-validator');

module.exports = function createSkillsRouter(repo) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const items = await repo.getAll();
      res.json(items);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const item = await repo.getById(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post(
    '/',
    body('skillName').isString().trim().notEmpty(),
    body('description').optional().isString().trim(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      try {
        const payload = req.body;
        const created = await repo.create(payload);
        res.status(201).json(created);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  router.put(
    '/:id',
    body('skillName').optional().isString().trim().notEmpty(),
    body('description').optional().isString().trim(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      try {
        const payload = req.body;
        const updated = await repo.update(req.params.id, payload);
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json(updated);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  router.delete('/:id', async (req, res) => {
    try {
      const deleted = await repo.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Not found' });
      res.json({ deletedId: deleted.Id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
