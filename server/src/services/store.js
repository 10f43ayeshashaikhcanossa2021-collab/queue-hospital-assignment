const bcrypt = require('bcryptjs');

const state = {
  users: [],
  patients: [],
  settings: {
    averageConsultationTime: 12,
    currentToken: 'T-104',
    lastGeneratedToken: 'T-104'
  }
};

let idCounter = 1;

function createId(prefix) {
  return `${prefix}-${idCounter++}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function seedDemoUsers() {
  if (state.users.length) {
    return;
  }

  const password = await bcrypt.hash('Password123!', 10);
  state.users.push(
    {
      _id: createId('user'),
      name: 'System Admin',
      email: 'admin@queuecure.dev',
      password,
      role: 'ADMIN'
    },
    {
      _id: createId('user'),
      name: 'Front Desk',
      email: 'reception@queuecure.dev',
      password,
      role: 'RECEPTIONIST'
    },
    {
      _id: createId('user'),
      name: 'Dr. Meera Rao',
      email: 'doctor@queuecure.dev',
      password,
      role: 'DOCTOR'
    }
  );
}

function resetStore() {
  state.users = [];
  state.patients = [];
  state.settings = {
    averageConsultationTime: 12,
    currentToken: 'T-104',
    lastGeneratedToken: 'T-104'
  };
  idCounter = 1;
}

async function createUser(data) {
  const user = { _id: createId('user'), ...data };
  state.users.push(user);
  return clone(user);
}

async function findUserByEmail(email) {
  return clone(state.users.find((user) => user.email === email) || null);
}

async function findUserById(id) {
  return clone(state.users.find((user) => user._id === id) || null);
}

async function listUsers() {
  return clone(state.users);
}

async function createPatient(data) {
  const patient = {
    _id: createId('patient'),
    status: 'WAITING',
    checkInTime: new Date().toISOString(),
    consultationStartTime: null,
    consultationEndTime: null,
    estimatedWaitTime: 0,
    actualConsultationDuration: 0,
    ...data
  };

  state.patients.push(patient);
  return clone(patient);
}

async function listPatients() {
  return clone(state.patients);
}

async function findPatientById(id) {
  return clone(state.patients.find((patient) => patient._id === id) || null);
}

async function findPatientByToken(tokenNumber) {
  return clone(state.patients.find((patient) => patient.tokenNumber === tokenNumber) || null);
}

async function updatePatient(id, updates) {
  const index = state.patients.findIndex((patient) => patient._id === id);
  if (index === -1) {
    return null;
  }

  state.patients[index] = { ...state.patients[index], ...updates };
  return clone(state.patients[index]);
}

async function deletePatient(id) {
  const index = state.patients.findIndex((patient) => patient._id === id);
  if (index === -1) {
    return false;
  }

  state.patients.splice(index, 1);
  return true;
}

async function getSettings() {
  return clone(state.settings);
}

async function updateSettings(updates) {
  state.settings = { ...state.settings, ...updates };
  return clone(state.settings);
}

async function getStateSnapshot() {
  return {
    users: await listUsers(),
    patients: await listPatients(),
    settings: await getSettings()
  };
}

module.exports = {
  seedDemoUsers,
  resetStore,
  createUser,
  findUserByEmail,
  findUserById,
  listUsers,
  createPatient,
  listPatients,
  findPatientById,
  findPatientByToken,
  updatePatient,
  deletePatient,
  getSettings,
  updateSettings,
  getStateSnapshot,
  state
};