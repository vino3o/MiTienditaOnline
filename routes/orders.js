const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

router.get('/', ordersController.getAll);
router.post('/', ordersController.create);
router.put('/:idPedido', ordersController.update);
router.delete('/:idPedido', ordersController.delete);

module.exports = router;
