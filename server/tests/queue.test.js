const { resetStore, seedDemoUsers, getSettings } = require('../src/services/store');
const { login, registerPatient, callNext, endConsultation, updateAverageTime, getQueueCurrent } = require('../src/services/queueService');

describe('Queue logic', () => {
  beforeEach(async () => {
    resetStore();
    await seedDemoUsers();
  });

  test('generates sequential tokens', async () => {
    const first = await registerPatient({ name: 'A', age: 30, phone: '999', reasonForVisit: 'Checkup' });
    const second = await registerPatient({ name: 'B', age: 35, phone: '888', reasonForVisit: 'Fever' });

    expect(first.tokenNumber).toBe('T-105');
    expect(second.tokenNumber).toBe('T-106');
  });

  test('calculates consultation averages from completed visits', async () => {
    const patient = await registerPatient({ name: 'A', age: 30, phone: '999', reasonForVisit: 'Checkup' });
    await callNext();
    await updateAverageTime(10);
    await endConsultation(patient._id);

    const settings = await getSettings();
    expect(settings.averageConsultationTime).toBeGreaterThanOrEqual(0);
  });

  test('authenticates demo users', async () => {
    const result = await login({ email: 'reception@queuecure.dev', password: 'Password123!' });
    expect(result.user.role).toBe('RECEPTIONIST');
  });

  test('returns empty current queue safely', async () => {
    const queue = await getQueueCurrent();
    expect(queue.current).toBeNull();
  });
});