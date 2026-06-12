const mongoose = require('mongoose');

const clinicSettingsSchema = new mongoose.Schema(
  {
    averageConsultationTime: { type: Number, default: 12 },
    currentToken: { type: String, default: 'T-104' },
    lastGeneratedToken: { type: String, default: 'T-104' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClinicSettings', clinicSettingsSchema);