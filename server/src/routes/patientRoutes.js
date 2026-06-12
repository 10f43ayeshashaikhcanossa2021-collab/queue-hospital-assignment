const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const {
  registerPatient,
  getPatients,
  getPatientByToken,
  editPatient,
  removePatient,
  updatePatientStatus
} = require('../services/queueService');

function createPatientRouter() {
  const router = express.Router();

  router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    [
      body('name').notEmpty(),
      body('age').isInt({ min: 0 }),
      body('phone').notEmpty(),
      body('reasonForVisit').notEmpty(),
      validateRequest
    ],
    async (req, res, next) => {
      try {
        const patient = await registerPatient(req.body, { addedBy: req.user.sub });
        return res.status(201).json(patient);
      } catch (error) {
        return next(error);
      }
    }
  );

  router.get('/', authenticate, authorizeRoles('ADMIN', 'RECEPTIONIST', 'DOCTOR'), async (req, res, next) => {
    try {
      return res.json(await getPatients());
    } catch (error) {
      return next(error);
    }
  });

  router.get('/:token', [param('token').notEmpty(), validateRequest], async (req, res, next) => {
    try {
      const patient = await getPatientByToken(req.params.token);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      return res.json(patient);
    } catch (error) {
      return next(error);
    }
  });

  router.patch(
    '/:id/status',
    authenticate,
    authorizeRoles('ADMIN', 'RECEPTIONIST', 'DOCTOR'),
    [body('status').notEmpty(), validateRequest],
    async (req, res, next) => {
      try {
        const updated = await updatePatientStatus(req.params.id, req.body.status);
        return res.json(updated);
      } catch (error) {
        return next(error);
      }
    }
  );

  router.patch('/:id', authenticate, authorizeRoles('ADMIN', 'RECEPTIONIST'), async (req, res, next) => {
    try {
      const updated = await editPatient(req.params.id, req.body);
      return res.json(updated);
    } catch (error) {
      return next(error);
    }
  });

  router.delete('/:id', authenticate, authorizeRoles('ADMIN', 'RECEPTIONIST'), async (req, res, next) => {
    try {
      await removePatient(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = createPatientRouter;