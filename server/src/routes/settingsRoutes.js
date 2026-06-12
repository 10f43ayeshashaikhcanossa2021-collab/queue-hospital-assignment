const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { getSettings, updateAverageTime } = require('../services/queueService');

function createSettingsRouter() {
  const router = express.Router();

  router.get('/', authenticate, authorizeRoles('ADMIN', 'RECEPTIONIST', 'DOCTOR'), async (req, res, next) => {
    try {
      return res.json(await getSettings());
    } catch (error) {
      return next(error);
    }
  });

  router.patch(
    '/average-time',
    authenticate,
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    [body('averageConsultationTime').isFloat({ min: 1 }), validateRequest],
    async (req, res, next) => {
      try {
        return res.json(await updateAverageTime(Number(req.body.averageConsultationTime)));
      } catch (error) {
        return next(error);
      }
    }
  );

  return router;
}

module.exports = createSettingsRouter;