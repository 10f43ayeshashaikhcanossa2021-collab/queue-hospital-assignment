const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const {
  callNext,
  getQueueCurrent,
  getWaitingQueue,
  getAnalytics,
  updateAverageTime
} = require('../services/queueService');

function createQueueRouter() {
  const router = express.Router();

  router.post('/call-next', authenticate, authorizeRoles('ADMIN', 'RECEPTIONIST'), async (req, res, next) => {
    try {
      const result = await callNext();
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.get('/current', async (req, res, next) => {
    try {
      return res.json(await getQueueCurrent());
    } catch (error) {
      return next(error);
    }
  });

  router.get('/waiting', authenticate, authorizeRoles('ADMIN', 'RECEPTIONIST', 'DOCTOR'), async (req, res, next) => {
    try {
      return res.json(await getWaitingQueue());
    } catch (error) {
      return next(error);
    }
  });

  router.get('/analytics', authenticate, authorizeRoles('ADMIN'), async (req, res, next) => {
    try {
      return res.json(await getAnalytics());
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

module.exports = createQueueRouter;