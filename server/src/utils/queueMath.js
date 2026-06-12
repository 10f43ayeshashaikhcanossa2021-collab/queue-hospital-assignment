function calculateEstimatedWait(positionAhead, averageConsultationTime) {
  return Math.max(0, positionAhead) * Math.max(0, averageConsultationTime);
}

function calculateAverageDuration(completedPatients) {
  if (!completedPatients.length) {
    return 0;
  }

  const total = completedPatients.reduce((sum, patient) => sum + (patient.actualConsultationDuration || 0), 0);
  return Math.round((total / completedPatients.length) * 10) / 10;
}

function getPeakHourAnalytics(patients) {
  const hours = new Map();

  patients.forEach((patient) => {
    if (!patient.checkInTime) {
      return;
    }

    const hour = new Date(patient.checkInTime).getHours();
    hours.set(hour, (hours.get(hour) || 0) + 1);
  });

  return Array.from(hours.entries())
    .sort((left, right) => left[0] - right[0])
    .map(([hour, count]) => ({ hour, count }));
}

module.exports = {
  calculateEstimatedWait,
  calculateAverageDuration,
  getPeakHourAnalytics
};