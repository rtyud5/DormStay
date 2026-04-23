const express = require('express');
const BedController = require('../controllers/bed.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.put('/:ma_giuong/rent', authMiddleware, BedController.updateBedStatusToRented); 
module.exports = router;
