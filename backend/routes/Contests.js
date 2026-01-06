const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get LeetCode contest list
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://leetcode.com/contest/api/list');
    // Always return { contests: [...] }
    if (response.data && Array.isArray(response.data.contests)) {
      res.json({ contests: response.data.contests });
    } else {
      res.status(500).json({ message: 'Unexpected LeetCode API format' });
    }
  } catch (error) {
    console.error('Error fetching LeetCode contest list:', error);
    res.status(500).json({ message: 'Failed to fetch contest list', error: error.message });
  }
});

// Get CodeChef contest list
router.get('/codechef', async (req, res) => {
  try {
    const response = await axios.get('https://www.codechef.com/api/list/contests/all');
    // CodeChef returns { future_contests: [...] }
    if (response.data && Array.isArray(response.data.future_contests)) {
      res.json({ contests: response.data.future_contests });
    } else {
      res.status(500).json({ message: 'Unexpected CodeChef API format' });
    }
  } catch (error) {
    console.error('Error fetching CodeChef contest list:', error);
    res.status(500).json({ message: 'Failed to fetch CodeChef contest list', error: error.message });
  }
});

module.exports = router; 