const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

router.get('/', productsController.getAll);
router.post('/', productsController.create);
router.put('/:idProducto', productsController.update);
router.delete('/:idProducto', productsController.delete);

module.exports = router;
