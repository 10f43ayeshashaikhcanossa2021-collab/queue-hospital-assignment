const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AsyncLock = require('../utils/asyncLock');
const { calculateEstimatedWait, calculateAverageDuration, getPeakHourAnalytics } = require('../utils/queueMath');
const { nextToken, getTokenNumber } = require('../utils/token');
const store = require('./store');

const queueLock = new AsyncLock();

function sortPatients(patients) {
  return [...patients].sort((left, right) => {
    const leftToken = getTokenNumber(left.tokenNumber);
    const rightToken = getTokenNumber(right.tokenNumber);
    if (leftToken !== rightToken) {
      return leftToken - rightToken;
    }
    return new Date(left.checkInTime).getTime() - new Date(right.checkInTime).getTime();
  });
}

function calculateQueueState(patients, settings) {
  const sorted = sortPatients(patients);
  const activePatient = sorted.find((patient) => ['CALLED', 'IN_CONSULTATION'].includes(patient.status)) || null;
  const waitingPatients = sorted.filter((patient) => patient.status === 'WAITING');
  const activeAhead = activePatient ? 1 : 0;
  const average = settings.averageConsultationTime || 12;

  const waitingWithEstimates = waitingPatients.map((patient, index) => ({
    ...patient,
    estimatedWaitTime: calculateEstimatedWait(index + activeAhead, average)
  }));

  return { sorted, activePatient, waitingPatients: waitingWithEstimates };
}

async function recalculateWaitingTimes() {
  const patients = await store.listPatients();
  const settings = await store.getSettings();
  const { waitingPatients } = calculateQueueState(patients, settings);

  for (const patient of waitingPatients) {
    await store.updatePatient(patient._id, { estimatedWaitTime: patient.estimatedWaitTime });
  }

  return waitingPatients;
}

async function seedSystem() {
  await store.seedDemoUsers();
}

async function login({ email, password }) {
  const user = await store.findUserByEmail(email);
  if (!user) {
    return null;
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    return null;
  }

  const token = jwt.sign(
    { sub: user._id, role: user.role, name: user.name, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  };
}

async function registerPatient(payload, meta = {}) {
  return queueLock.runExclusive(async () => {
    const settings = await store.getSettings();
    const tokenNumber = nextToken(settings.lastGeneratedToken);
    const allPatients = await store.listPatients();
    const patient = await store.createPatient({
      tokenNumber,
      estimatedWaitTime: calculateEstimatedWait(
        allPatients.filter((item) => item.status === 'WAITING').length + (allPatients.some((item) => ['CALLED', 'IN_CONSULTATION'].includes(item.status)) ? 1 : 0),
        settings.averageConsultationTime
      ),
      ...payload,
      addedBy: meta.addedBy || null
    });

    await store.updateSettings({
      lastGeneratedToken: tokenNumber,
      currentToken: settings.currentToken || tokenNumber
    });

    await recalculateWaitingTimes();
    return patient;
  });
}

async function updatePatientStatus(id, status) {
  const now = new Date().toISOString();
  const updates = { status };

  if (status === 'IN_CONSULTATION') {
    updates.consultationStartTime = now;
  }

  if (status === 'COMPLETED') {
    updates.consultationEndTime = now;
  }

  return store.updatePatient(id, updates);
}

async function markNoShow(id) {
  return queueLock.runExclusive(async () => {
    const updated = await store.updatePatient(id, { status: 'NO_SHOW' });
    await recalculateWaitingTimes();
    return updated;
  });
}

async function skipPatient(id) {
  return queueLock.runExclusive(async () => {
    const updated = await store.updatePatient(id, { status: 'SKIPPED' });
    await recalculateWaitingTimes();
    return updated;
  });
}

async function callNext() {
  return queueLock.runExclusive(async () => {
    const patients = sortPatients(await store.listPatients());
    const currentActive = patients.find((patient) => ['CALLED', 'IN_CONSULTATION'].includes(patient.status));
    if (currentActive) {
      return { patient: currentActive, message: 'Patient already being served' };
    }

    const nextWaiting = patients.find((patient) => patient.status === 'WAITING');
    if (!nextWaiting) {
      return { patient: null, message: 'No patients waiting' };
    }

    const updated = await store.updatePatient(nextWaiting._id, { status: 'CALLED' });
    await store.updateSettings({ currentToken: updated.tokenNumber });
    await recalculateWaitingTimes();
    return { patient: updated, message: 'Next patient called' };
  });
}

async function startConsultation(id) {
  const now = new Date().toISOString();
  const updated = await store.updatePatient(id, { status: 'IN_CONSULTATION', consultationStartTime: now });
  return updated;
}

async function endConsultation(id) {
  const now = new Date().toISOString();
  const patient = await store.findPatientById(id);
  if (!patient) {
    return null;
  }

  const consultationStartTime = patient.consultationStartTime || now;
  const durationMinutes = Math.max(
    0,
    Math.round((new Date(now).getTime() - new Date(consultationStartTime).getTime()) / 60000)
  );

  const updated = await store.updatePatient(id, {
    status: 'COMPLETED',
    consultationEndTime: now,
    actualConsultationDuration: durationMinutes
  });

  const completedPatients = (await store.listPatients()).filter((item) => item.status === 'COMPLETED');
  const averageConsultationTime = calculateAverageDuration(completedPatients) || (await store.getSettings()).averageConsultationTime;
  await store.updateSettings({ averageConsultationTime });
  await recalculateWaitingTimes();
  return updated;
}

async function updateAverageTime(averageConsultationTime) {
  const updatedSettings = await store.updateSettings({ averageConsultationTime });
  await recalculateWaitingTimes();
  return updatedSettings;
}

async function getQueueCurrent() {
  const patients = sortPatients(await store.listPatients());
  const settings = await store.getSettings();
  const { activePatient, waitingPatients } = calculateQueueState(patients, settings);
  return {
    current: activePatient || waitingPatients[0] || null,
    upcoming: waitingPatients.slice(0, 5),
    settings
  };
}

async function getWaitingQueue() {
  const patients = sortPatients(await store.listPatients());
  return patients.filter((patient) => patient.status === 'WAITING');
}

async function getAnalytics() {
  const patients = await store.listPatients();
  const completed = patients.filter((patient) => patient.status === 'COMPLETED');
  const waiting = patients.filter((patient) => patient.status === 'WAITING');
  const totalWait = patients.reduce((sum, patient) => sum + (patient.estimatedWaitTime || 0), 0);
  return {
    totalPatients: patients.length,
    totalServed: completed.length,
    averageWaitTime: patients.length ? Math.round(totalWait / patients.length) : 0,
    averageConsultationTime: (await store.getSettings()).averageConsultationTime,
    peakHours: getPeakHourAnalytics(patients),
    waitingCount: waiting.length,
    completedCount: completed.length,
    completedPatients: completed
  };
}

async function getPatientByToken(tokenNumber) {
  return store.findPatientByToken(tokenNumber);
}

async function getPatients() {
  return store.listPatients();
}

async function editPatient(id, payload) {
  return store.updatePatient(id, payload);
}

async function removePatient(id) {
  return store.deletePatient(id);
}

async function getSettings() {
  return store.getSettings();
}

module.exports = {
  seedSystem,
  login,
  registerPatient,
  updatePatientStatus,
  markNoShow,
  skipPatient,
  callNext,
  startConsultation,
  endConsultation,
  updateAverageTime,
  getQueueCurrent,
  getWaitingQueue,
  getAnalytics,
  getPatientByToken,
  getPatients,
  editPatient,
  removePatient,
  getSettings,
  recalculateWaitingTimes
};