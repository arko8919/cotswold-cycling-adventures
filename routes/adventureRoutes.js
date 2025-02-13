const express = require('express');
const router = express.Router();
const adventureController = require('../controllers/adventureController');

router
  .route('/')
  .get(adventureController.getAllAdventures)
  .post(adventureController.createAdventure);
router
  .route('/:id')
  .get(adventureController.getAdventure)
  .patch(adventureController.updateAdventure)
  .delete(adventureController.deleteAdventure);

module.exports = router;
