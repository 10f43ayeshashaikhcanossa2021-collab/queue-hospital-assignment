const { registerPatient, callNext, startConsultation, endConsultation, updateAverageTime, getQueueCurrent, getAnalytics } = require('./queueService');

function attachSocketHandlers(io) {
  io.on('connection', async (socket) => {
    socket.emit('queue-updated', await getQueueCurrent());

    socket.on('add-patient', async (payload, acknowledgement) => {
      const patient = await registerPatient(payload, { addedBy: payload.addedBy || null });
      const queue = await getQueueCurrent();
      io.emit('queue-updated', queue);
      io.emit('wait-time-recalculated', queue);
      if (acknowledgement) {
        acknowledgement(patient);
      }
    });

    socket.on('call-next', async (_, acknowledgement) => {
      const result = await callNext();
      io.emit('token-called', result);
      io.emit('queue-updated', await getQueueCurrent());
      if (acknowledgement) {
        acknowledgement(result);
      }
    });

    socket.on('consultation-started', async ({ patientId }, acknowledgement) => {
      const patient = await startConsultation(patientId);
      io.emit('consultation-update', patient);
      io.emit('queue-updated', await getQueueCurrent());
      if (acknowledgement) {
        acknowledgement(patient);
      }
    });

    socket.on('consultation-ended', async ({ patientId }, acknowledgement) => {
      const patient = await endConsultation(patientId);
      io.emit('consultation-update', patient);
      io.emit('queue-updated', await getQueueCurrent());
      if (acknowledgement) {
        acknowledgement(patient);
      }
    });

    socket.on('average-time-updated', async ({ averageConsultationTime }, acknowledgement) => {
      const settings = await updateAverageTime(Number(averageConsultationTime));
      io.emit('wait-time-recalculated', settings);
      io.emit('queue-updated', await getQueueCurrent());
      io.emit('analytics-updated', await getAnalytics());
      if (acknowledgement) {
        acknowledgement(settings);
      }
    });

    socket.on('queue-refresh', async () => {
      socket.emit('queue-updated', await getQueueCurrent());
    });
  });
}

module.exports = { attachSocketHandlers };