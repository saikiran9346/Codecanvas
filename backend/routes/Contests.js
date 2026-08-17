const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get LeetCode contest list
router.get('/', async (req, res) => {
  try {
    const response = await axios.post(
      'https://leetcode.com/graphql',
      {
        query: `
          query {
            upcomingContests {
              title
              titleSlug
              startTime
              duration
            }
          }
        `,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        timeout: 10000,
      }
    );

    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data.upcomingContests)
    ) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const contests = response.data.data.upcomingContests
        .filter((c) => c.startTime && (c.startTime + (c.duration || 0)) >= nowSeconds)
        .map((c) => ({
          name: c.title,
          title_slug: c.titleSlug,
          site: 'LeetCode',
          start_time: new Date(c.startTime * 1000).toISOString(),
          duration: c.duration,
          url: `https://leetcode.com/contest/${c.titleSlug}/`,
        }));
      res.json({ contests });
    } else {
      res.status(500).json({ message: 'Unexpected LeetCode API format' });
    }
  } catch (error) {
    console.error('Error fetching LeetCode contest list:', error);
    res.status(500).json({ message: 'Failed to fetch contest list', error: error.message });
  }
});

// Get Codeforces contest list
router.get('/codeforces', async (req, res) => {
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list?gym=false', {
      timeout: 10000,
    });
    if (response.data && Array.isArray(response.data.result)) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const contests = response.data.result
        .filter((c) => c.phase === 'BEFORE' && c.startTimeSeconds > nowSeconds)
        .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
        .map((c) => ({
          name: c.name,
          site: 'Codeforces',
          start_time: new Date(c.startTimeSeconds * 1000).toISOString(),
          duration: c.durationSeconds,
          url: `https://codeforces.com/contest/${c.id}`,
        }));
      res.json({ contests });
    } else {
      res.status(500).json({ message: 'Unexpected Codeforces API format' });
    }
  } catch (error) {
    console.error('Error fetching Codeforces contest list:', error);
    res.status(500).json({ message: 'Failed to fetch Codeforces contest list', error: error.message });
  }
});

// Get CodeChef contest list
router.get('/codechef', async (req, res) => {
  try {
    const response = await axios.get('https://www.codechef.com/api/list/contests/all', {
      timeout: 10000,
    });
    const future = Array.isArray(response.data?.future_contests) ? response.data.future_contests : [];
    const present = Array.isArray(response.data?.present_contests) ? response.data.present_contests : [];
    const all = [...present, ...future];

    const now = Date.now();
    const contests = all
      .filter((c) => {
        const startTime = c.contest_start_date_iso ? new Date(c.contest_start_date_iso).getTime() : 0;
        const endTime = c.contest_end_date_iso
          ? new Date(c.contest_end_date_iso).getTime()
          : (startTime + (parseInt(c.contest_duration, 10) * 60000 || 0));
        return endTime >= now;
      })
      .sort((a, b) => {
        const tA = a.contest_start_date_iso ? new Date(a.contest_start_date_iso).getTime() : 0;
        const tB = b.contest_start_date_iso ? new Date(b.contest_start_date_iso).getTime() : 0;
        return tA - tB;
      })
      .map((c) => ({
        name: c.contest_name || c.name,
        site: 'CodeChef',
        contest_code: c.contest_code,
        start_time: c.contest_start_date_iso,
        end_time: c.contest_end_date_iso,
        start_date_iso: c.contest_start_date_iso,
        duration: c.contest_duration ? parseInt(c.contest_duration, 10) * 60 : 10800,
        url: c.contest_code ? `https://www.codechef.com/${c.contest_code}` : 'https://www.codechef.com',
      }));

    res.json({ contests });
  } catch (error) {
    console.error('Error fetching CodeChef contest list:', error);
    res.status(500).json({ message: 'Failed to fetch CodeChef contest list', error: error.message });
  }
});

module.exports = router;