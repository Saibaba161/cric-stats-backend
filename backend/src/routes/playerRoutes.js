const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

router.get('/search', playerController.searchPlayers);
router.get('/:id/stats', playerController.getPlayerStats);
router.get('/compare', playerController.comparePlayerStats);

module.exports = router;