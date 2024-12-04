const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clientsController');

router.get('/', clientsController.getAll);
router.post('/', clientsController.create);
router.put('/:idUsuario', clientsController.update);
router.delete('/:idUsuario', clientsController.delete);

module.exports = router;
