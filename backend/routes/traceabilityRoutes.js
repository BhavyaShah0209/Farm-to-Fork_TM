const express = require('express');
const router = express.Router();
const { getBatchJourney } = require('../controllers/traceabilityController');

router.get('/:batchId', getBatchJourney);

module.exports = router;
