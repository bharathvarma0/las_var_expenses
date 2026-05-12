const express = require('express');
const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');
const { pool } = require('../database');

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate with PIN and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin || pin.length !== 4) {
      return res.status(400).json({ error: 'PIN must be 4 digits' });
    }

    // Fetch all access groups
    const { rows: groups } = await pool.query(
      'SELECT id, pin_hash, user_ids, name FROM access_groups'
    );

    // Find matching group by comparing hashed PIN
    let matchedGroup = null;
    for (const group of groups) {
      const isMatch = await bcrypt.compare(pin, group.pin_hash);
      if (isMatch) {
        matchedGroup = group;
        break;
      }
    }

    if (!matchedGroup) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    // Fetch user details for this group
    const { rows: users } = await pool.query(
      'SELECT id, name, avatar_color FROM users WHERE id = ANY($1) ORDER BY id',
      [matchedGroup.user_ids]
    );

    // Generate JWT token
    const token = generateToken(matchedGroup.user_ids, matchedGroup.name);

    res.json({
      token,
      users,
      groupName: matchedGroup.name
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/verify
 * Verify if a token is still valid
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ valid: false });
      }

      // Fetch user details
      const { rows: users } = await pool.query(
        'SELECT id, name, avatar_color FROM users WHERE id = ANY($1) ORDER BY id',
        [decoded.userIds]
      );

      res.json({
        valid: true,
        users,
        groupName: decoded.groupName
      });
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ valid: false });
  }
});

module.exports = router;
