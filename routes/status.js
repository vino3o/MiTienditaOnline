const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

router.get('/', statusController.getAll);
router.post('/', statusController.create);
router.put('/:idEstado', statusController.update);
router.delete('/:idEstado', statusController.delete);

module.exports = router;
