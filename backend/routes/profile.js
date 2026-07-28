const express = require('express');
const router = express.Router();
const db = require('../database');

// Promisified DB helper queries
const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) {
      reject(err);
    } else {
      resolve(this);
    }
  });
});

// GET /api/profile - Fetch the single owner profile
router.get('/', async (req, res) => {
  try {
    const owner = await get(
      'SELECT id, full_name, shop_name, email, phone, profile_image, created_at, updated_at FROM owner LIMIT 1'
    );

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      owner
    });
  } catch (error) {
    console.error('Failed to get profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile info',
      error: error.message
    });
  }
});

// PUT /api/profile - Update the single owner profile
router.put('/', async (req, res) => {
  const { full_name, shop_name, email, phone, profile_image } = req.body;

  if (!full_name || !shop_name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Full Name, Shop Name, Email, and Phone are required'
    });
  }

  try {
    // Get the first owner ID
    const firstOwner = await get('SELECT id FROM owner LIMIT 1');
    if (!firstOwner) {
      return res.status(404).json({
        success: false,
        message: 'Owner profile not found'
      });
    }

    await run(
      `UPDATE owner
       SET full_name = ?, shop_name = ?, email = ?, phone = ?, profile_image = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [full_name, shop_name, email, phone, profile_image !== undefined ? profile_image : null, firstOwner.id]
    );

    const updatedOwner = await get(
      'SELECT id, full_name, shop_name, email, phone, profile_image FROM owner WHERE id = ?',
      [firstOwner.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      owner: updatedOwner
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      if (error.message.includes('email')) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
      if (error.message.includes('phone')) {
        return res.status(409).json({
          success: false,
          message: 'Phone number already exists'
        });
      }
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile details',
      error: error.message
    });
  }
});

module.exports = router;
