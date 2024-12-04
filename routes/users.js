const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.get('/', usersController.getAll);
router.post('/', usersController.create);
router.put('/:idUsuario', usersController.update);
router.delete('/:idUsuario', usersController.delete);

module.exports = router;
