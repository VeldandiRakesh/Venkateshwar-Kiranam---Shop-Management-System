const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database');

// Register
exports.register = (req, res) => {
  const { username, password } = req.body;

  // Validation
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
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
      message: 'Password must be at least 6 characters long'
    });
  }

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert user into database
  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    (err) => {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({
            success: false,
            message: 'Username already exists'
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Registration failed'
        });
      }

      return res.status(201).json({
        success: true,
        message: 'User registered successfully. Please login with your credentials.'
      });
    }
  );
};

// Login
exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  // Find user in database
  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, user) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Login failed'
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Compare password
      const passwordValid = bcrypt.compareSync(password, user.password);

      if (!passwordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username }
      });
    }
  );
};

// Register
