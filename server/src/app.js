const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const createPatientRouter = require('./routes/patientRoutes');
const createQueueRouter = require('./routes/queueRoutes');
const createSettingsRouter = require('./routes/settingsRoutes');
const createDoctorRouter = require('./routes/doctorRoutes');

function createApp({ io } = {}) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json());
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.use('/api/auth', rateLimit({ windowMs: 60 * 1000, limit: 20 }), authRoutes);
  app.use('/api/patients', createPatientRouter());
  app.use('/api/queue', createQueueRouter());
  app.use('/api/settings', createSettingsRouter());
  app.use('/api/doctor', createDoctorRouter());

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'queue-cure-server', socket: Boolean(io) });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };