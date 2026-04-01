const Simulation = require('../models/Simulation');

// Save a simulation
exports.saveSimulation = async (req, res) => {
  try {
    const sim = new Simulation(req.body);
    await sim.save();
    res.status(201).json({ success: true, data: sim });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all simulations (with optional type filter)
exports.getSimulations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    const sims = await Simulation.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: sims });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single simulation
exports.getSimulation = async (req, res) => {
  try {
    const sim = await Simulation.findById(req.params.id);
    if (!sim) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: sim });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete simulation
exports.deleteSimulation = async (req, res) => {
  try {
    await Simulation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
