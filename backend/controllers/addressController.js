const fs = require('fs');
const path = require('path');
const NodeGeocoder = require('node-geocoder');

// Path to save user addresses
const addressesFilePath = path.join(__dirname, '../data/addresses.json');

// Initialize geocoder
const geocoder = NodeGeocoder({
  provider: 'openstreetmap'
});

// Load addresses from file
const loadAddresses = () => {
  try {
    const data = fs.readFileSync(addressesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty object
    if (error.code === 'ENOENT') {
      return {};
    }
    console.error('Error reading addresses file:', error);
    return {};
  }
};

// Save addresses to file
const saveAddresses = (addresses) => {
  try {
    fs.writeFileSync(addressesFilePath, JSON.stringify(addresses, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing addresses file:', error);
  }
};

// Get user addresses
exports.getAddresses = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const addresses = loadAddresses();
    
    // If user doesn't have addresses yet, return empty array
    const userAddresses = addresses[userId] || [];
    
    res.status(200).json({
      success: true,
      data: userAddresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const addressData = req.body;
    
    // Validate required fields
    if (!addressData.addressLine1 || !addressData.city || !addressData.postalCode || !addressData.country) {
      return res.status(400).json({
        success: false,
        message: 'Missing required address fields'
      });
    }
    
    // Try to geocode the address
    try {
      const fullAddress = `${addressData.addressLine1}, ${addressData.city}, ${addressData.postalCode}, ${addressData.country}`;
      const geoResults = await geocoder.geocode(fullAddress);
      
      if (geoResults && geoResults.length > 0) {
        // Add geocoding data to address
        addressData.latitude = geoResults[0].latitude;
        addressData.longitude = geoResults[0].longitude;
        addressData.formattedAddress = geoResults[0].formattedAddress;
      }
    } catch (geoError) {
      console.error('Geocoding error:', geoError);
      // Continue without geocoding data if there's an error
    }
    
    // Load existing addresses
    const addresses = loadAddresses();
    
    // If user doesn't have addresses yet, create array
    if (!addresses[userId]) {
      addresses[userId] = [];
    }
    
    // Check if this is the first address and set as default
    if (addresses[userId].length === 0) {
      addressData.isDefault = true;
    } else if (addressData.isDefault) {
      // If new address is default, remove default from other addresses
      addresses[userId] = addresses[userId].map(addr => ({
        ...addr,
        isDefault: false
      }));
    }
    
    // Add new address with ID and timestamp
    const newAddress = {
      id: Date.now().toString(),
      ...addressData,
      createdAt: new Date().toISOString()
    };
    
    addresses[userId].push(newAddress);
    
    // Save to file
    saveAddresses(addresses);
    
    res.status(201).json({
      success: true,
      data: newAddress
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const { addressId } = req.params;
    const updates = req.body;
    
    // Load existing addresses
    const addresses = loadAddresses();
    
    // Check if user has addresses
    if (!addresses[userId] || addresses[userId].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No addresses found for user'
      });
    }
    
    // Find address index
    const addressIndex = addresses[userId].findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // If making this address default, remove default from others
    if (updates.isDefault) {
      addresses[userId] = addresses[userId].map(addr => ({
        ...addr,
        isDefault: false
      }));
    }
    
    // Update address
    addresses[userId][addressIndex] = {
      ...addresses[userId][addressIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // If address details changed, try to geocode again
    if (updates.addressLine1 || updates.city || updates.postalCode || updates.country) {
      try {
        const addr = addresses[userId][addressIndex];
        const fullAddress = `${addr.addressLine1}, ${addr.city}, ${addr.postalCode}, ${addr.country}`;
        const geoResults = await geocoder.geocode(fullAddress);
        
        if (geoResults && geoResults.length > 0) {
          // Update geocoding data
          addresses[userId][addressIndex].latitude = geoResults[0].latitude;
          addresses[userId][addressIndex].longitude = geoResults[0].longitude;
          addresses[userId][addressIndex].formattedAddress = geoResults[0].formattedAddress;
        }
      } catch (geoError) {
        console.error('Geocoding error:', geoError);
        // Continue without geocoding data if there's an error
      }
    }
    
    // Save to file
    saveAddresses(addresses);
    
    res.status(200).json({
      success: true,
      data: addresses[userId][addressIndex]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete address
exports.deleteAddress = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const { addressId } = req.params;
    
    // Load existing addresses
    const addresses = loadAddresses();
    
    // Check if user has addresses
    if (!addresses[userId] || addresses[userId].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No addresses found for user'
      });
    }
    
    // Find address index
    const addressIndex = addresses[userId].findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Check if this is the default address
    const isDefault = addresses[userId][addressIndex].isDefault;
    
    // Remove address
    addresses[userId].splice(addressIndex, 1);
    
    // If we removed the default address and there are other addresses left, make the first one default
    if (isDefault && addresses[userId].length > 0) {
      addresses[userId][0].isDefault = true;
    }
    
    // Save to file
    saveAddresses(addresses);
    
    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Set default address
exports.setDefaultAddress = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const { addressId } = req.params;
    
    // Load existing addresses
    const addresses = loadAddresses();
    
    // Check if user has addresses
    if (!addresses[userId] || addresses[userId].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No addresses found for user'
      });
    }
    
    // Find address index
    const addressIndex = addresses[userId].findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Remove default from all addresses
    addresses[userId] = addresses[userId].map(addr => ({
      ...addr,
      isDefault: false
    }));
    
    // Set the selected address as default
    addresses[userId][addressIndex].isDefault = true;
    
    // Save to file
    saveAddresses(addresses);
    
    res.status(200).json({
      success: true,
      data: addresses[userId][addressIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};