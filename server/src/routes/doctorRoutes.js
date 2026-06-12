const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { startConsultation, endConsultation, getQueueCurrent } = require('../services/queueService');

function createDoctorRouter() {
  const router = express.Router();

  router.post('/start/:id', authenticate, authorizeRoles('ADMIN', 'DOCTOR'), async (req, res, next) => {
    try {
      return res.json(await startConsultation(req.params.id));
    } catch (error) {
      return next(error);
    }
  });

  router.post('/end/:id', authenticate, authorizeRoles('ADMIN', 'DOCTOR'), async (req, res, next) => {
    try {
      return res.json(await endConsultation(req.params.id));
    } catch (error) {
      return next(error);
    }
  });

  router.get('/current', authenticate, authorizeRoles('ADMIN', 'DOCTOR'), async (req, res, next) => {
    try {
      return res.json(await getQueueCurrent());
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = createDoctorRouter;