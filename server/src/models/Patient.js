const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    tokenNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    phone: { type: String, required: true, trim: true },
    reasonForVisit: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'NO_SHOW', 'SKIPPED'],
      default: 'WAITING'
    },
    checkInTime: { type: Date, default: Date.now },
    consultationStartTime: { type: Date },
    consultationEndTime: { type: Date },
    estimatedWaitTime: { type: Number, default: 0 },
    actualConsultationDuration: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);