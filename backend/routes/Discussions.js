const express = require('express');
const router = express.Router();
const Discussion = require('../models/DiscussionModel');
const auth = require('../middleware/auth');

// Get all discussions for a problem
router.get('/:problemSlug', async (req, res) => {
  try {
    console.log('Fetching discussions for problem:', req.params.problemSlug);
    const discussions = await Discussion.find({ problemSlug: req.params.problemSlug })
      .populate('author', 'Username _id')
      .populate('comments.author', 'Username _id')
      .sort({ createdAt: -1 });
    console.log('Found discussions:', discussions);
    res.json(discussions);
  } catch (err) {
    console.error('Error fetching discussions:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new discussion
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new discussion:', req.body);
    const discussion = new Discussion({
      title: req.body.title,
      content: req.body.content,
      author: req.user._id,
      problemSlug: req.body.problemSlug
    });
    const savedDiscussion = await discussion.save();
    const populatedDiscussion = await Discussion.findById(savedDiscussion._id)
      .populate('author', 'Username _id');
    console.log('Created discussion:', populatedDiscussion);
    res.status(201).json(populatedDiscussion);
  } catch (err) {
    console.error('Error creating discussion:', err);
    res.status(400).json({ message: err.message });
  }
});

// Add a comment to a discussion
router.post('/:id/comments', auth, async (req, res) => {
  try {
    console.log('Adding comment to discussion:', req.params.id);
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    discussion.comments.push({
      content: req.body.content,
      author: req.user._id
    });
    
    const updatedDiscussion = await discussion.save();
    const populatedDiscussion = await Discussion.findById(updatedDiscussion._id)
      .populate('author', 'Username _id')
      .populate('comments.author', 'Username _id');
    
    console.log('Updated discussion with comment:', populatedDiscussion);
    res.json(populatedDiscussion);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(400).json({ message: err.message });
  }
});

// Vote on a discussion
router.post('/:id/vote', auth, async (req, res) => {
  try {
    console.log('Voting on discussion:', req.params.id, 'vote type:', req.body.voteType);
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    discussion.votes += req.body.voteType === 'upvote' ? 1 : -1;
    const updatedDiscussion = await discussion.save();
    
    console.log('Updated discussion votes:', updatedDiscussion);
    res.json(updatedDiscussion);
  } catch (err) {
    console.error('Error voting on discussion:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 