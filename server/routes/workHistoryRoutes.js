const express = require('express');
const { body, validationResult } = require('express-validator');

module.exports = function createWorkHistoryRouter(repo) {
  const router = express.Router();

  // Get all work history for a specific resource
  router.get('/:resourceId', async (req, res) => {
    try {
      const history = await repo.getWorkHistoryForResource(req.params.resourceId);
      res.json(history);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get a specific work history entry
  router.get('/:resourceId/:id', async (req, res) => {
    try {
      const entry = await repo.getById(req.params.id);
      if (!entry || entry.ResourceId !== req.params.resourceId) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json(entry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Add work history entry
  router.post(
    '/:resourceId',
    body('companyId').isUUID(),
    body('startDate').isISO8601(),
    body('endDate').optional({ checkFalsy: true }).isISO8601(),
    body('isCurrentAssignment').optional().isBoolean(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      try {
        const payload = {
          resourceId: req.params.resourceId,
          companyId: req.body.companyId,
          startDate: req.body.startDate,
          endDate: req.body.endDate || null,
          isCurrentAssignment: req.body.isCurrentAssignment || false,
        };
        const created = await repo.create(payload);
        res.status(201).json(created);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  // Update work history entry
  router.put(
    '/:resourceId/:id',
    body('companyId').optional().isUUID(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional({ checkFalsy: true }).isISO8601(),
    body('isCurrentAssignment').optional().isBoolean(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      try {
        // Get existing entry to preserve values not being updated
        const existing = await repo.getById(req.params.id);
        if (!existing || existing.ResourceId !== req.params.resourceId) {
          return res.status(404).json({ error: 'Not found' });
        }
        const payload = {
          companyId: req.body.companyId !== undefined ? req.body.companyId : existing.CompanyId,
          startDate: req.body.startDate !== undefined ? req.body.startDate : existing.StartDate,
          endDate: req.body.endDate !== undefined ? req.body.endDate : existing.EndDate,
          isCurrentAssignment:
            req.body.isCurrentAssignment !== undefined
              ? req.body.isCurrentAssignment
              : existing.IsCurrentAssignment,
        };
        const updated = await repo.update(req.params.id, payload);
        res.json(updated);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  // Delete work history entry
  router.delete('/:resourceId/:id', async (req, res) => {
    try {
      // Verify the entry belongs to the resource
      const existing = await repo.getById(req.params.id);
      if (!existing || existing.ResourceId !== req.params.resourceId) {
        return res.status(404).json({ error: 'Not found' });
      }
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
