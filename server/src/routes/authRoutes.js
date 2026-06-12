const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { login } = require('../services/queueService');

const router = express.Router();

router.post(
  '/login',
  [body('email').isEmail(), body('password').isLength({ min: 6 }), validateRequest],
  async (req, res, next) => {
    try {
      const result = await login(req.body);
      if (!result) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }
);

router.post('/register', async (req, res) => {
  res.status(501).json({ message: 'Registration is managed by the admin seed flow in this demo build.' });
});

module.exports = router;