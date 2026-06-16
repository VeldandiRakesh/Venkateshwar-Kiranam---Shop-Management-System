const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database');

// Promisified DB helpers
const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) { err ? reject(err) : resolve(this); });
});

// Check if owner setup is required (no owner exists in database)
exports.getSetupStatus = async (req, res) => {
  try {
    const row = await get('SELECT COUNT(*) as count FROM owner');
    const setupRequired = (row?.count || 0) === 0;
    return res.status(200).json({
      success: true,
      setupRequired
    });
  } catch (error) {
    console.error('Error checking setup status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check setup status',
      error: error.message
    });
  }
};

// Register the single Owner
exports.register = async (req, res) => {
  const { full_name, shop_name, username, email, phone, password } = req.body;

  // Basic Validation
  if (!full_name || !shop_name || !username || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  if (username.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Username must be at least 3 characters long'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  try {
    // Prevent multiple owners (only one owner allowed!)
    const countRow = await get('SELECT COUNT(*) as count FROM owner');
    if (countRow && countRow.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Owner account is already configured. Only one owner is allowed.'
      });
    }

    // Hash the password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Insert owner into database
    await run(
      `INSERT INTO owner (full_name, shop_name, username, email, phone, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, shop_name, username, email, phone, passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: 'Owner account created successfully. Please login.'
    });
  } catch (error) {
    console.error('Owner registration failed:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Owner registration failed',
      error: error.message
    });
  }
};

// Owner Login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  try {
    // Find owner in database
    const owner = await get('SELECT * FROM owner WHERE username = ?', [username]);
    if (!owner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Compare password hash
    const passwordValid = bcrypt.compareSync(password, owner.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: owner.id, username: owner.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      owner: {
        id: owner.id,
        full_name: owner.full_name,
        shop_name: owner.shop_name,
        username: owner.username,
        email: owner.email,
        phone: owner.phone,
        profile_image: owner.profile_image
      }
    });
  } catch (error) {
    console.error('Owner login failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get Owner Profile
exports.getProfile = async (req, res) => {
  try {
    const owner = await get(
      'SELECT id, full_name, shop_name, username, email, phone, profile_image, created_at FROM owner WHERE id = ?',
      [req.user.id]
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
    console.error('Error fetching owner profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Update Owner Profile
exports.updateProfile = async (req, res) => {
  const { full_name, shop_name, email, phone, profile_image } = req.body;

  if (!full_name || !shop_name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Full Name, Shop Name, Email, and Phone are required'
    });
  }

  try {
    // Perform SQLite Update
    // COALESCE is not used for profile_image if they specifically upload a blank or keep it.
    // We will save whatever profile_image is passed (null or base64 text)
    await run(
      `UPDATE owner
       SET full_name = ?, shop_name = ?, email = ?, phone = ?, profile_image = ?
       WHERE id = ?`,
      [full_name, shop_name, email, phone, profile_image !== undefined ? profile_image : null, req.user.id]
    );

    // Retrieve updated owner
    const updatedOwner = await get('SELECT id, full_name, shop_name, username, email, phone, profile_image FROM owner WHERE id = ?', [req.user.id]);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      owner: updatedOwner
    });
  } catch (error) {
    console.error('Error updating owner profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Change Owner Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters'
    });
  }

  try {
    const owner = await get('SELECT password_hash FROM owner WHERE id = ?', [req.user.id]);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    const passwordValid = bcrypt.compareSync(currentPassword, owner.password_hash);
    if (!passwordValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    const newPasswordHash = bcrypt.hashSync(newPassword, 10);
    await run('UPDATE owner SET password_hash = ? WHERE id = ?', [newPasswordHash, req.user.id]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing owner password:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};
