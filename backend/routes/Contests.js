const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get LeetCode contest list
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://leetcode.com/contest/api/list');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching LeetCode contest list:', error);
    res.status(500).json({ message: 'Failed to fetch contest list', error: error.message });
  }
});

module.exports = router; 