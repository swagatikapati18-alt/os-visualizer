const mongoose = require('mongoose');

const SimulationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['scheduling', 'memory', 'deadlock', 'disk'],
      required: true,
    },
    algorithm: { type: String, required: true },
    inputData: { type: mongoose.Schema.Types.Mixed, required: true },
    results: { type: mongoose.Schema.Types.Mixed, required: true },
    name: { type: String, default: 'Unnamed Simulation' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Simulation', SimulationSchema);
