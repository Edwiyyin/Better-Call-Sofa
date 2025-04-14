const express = require('express');
const addressController = require('../controllers/addressController');

const router = express.Router();

// Get all addresses for user
router.get('/', addressController.getAddresses);

// Add new address
router.post('/', addressController.addAddress);

// Update address
router.put('/:addressId', addressController.updateAddress);

// Delete address
router.delete('/:addressId', addressController.deleteAddress);

// Set default address
router.patch('/:addressId/set-default', addressController.setDefaultAddress);

module.exports = router;
