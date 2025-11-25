import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return res.status(500).json({ error: 'Admin password not configured' });
    }

    // Check if stored password is hashed or plain text
    const isHashed = adminPassword.startsWith('$2b$') || adminPassword.startsWith('$2a$');

    let isValid;
    if (isHashed) {
      isValid = await bcrypt.compare(password, adminPassword);
    } else {
      // For initial setup, allow plain text comparison
      isValid = password === adminPassword;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      expiresIn: 86400 // 24 hours in seconds
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ valid: false });
    }
    res.json({ valid: true, user });
  });
});

export default router;
