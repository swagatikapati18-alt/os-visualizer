const express = require('express');
const router = express.Router();
const {
  saveSimulation,
  getSimulations,
  getSimulation,
  deleteSimulation,
} = require('../controllers/simulationController');

router.post('/', saveSimulation);
router.get('/', getSimulations);
router.get('/:id', getSimulation);
router.delete('/:id', deleteSimulation);

module.exports = router;
