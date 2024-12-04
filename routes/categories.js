const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');

router.get('/', categoriesController.getAll);
router.post('/', categoriesController.create);
router.put('/:idCategoria', categoriesController.update);
router.delete('/:idCategoria', categoriesController.delete);

module.exports = router;
