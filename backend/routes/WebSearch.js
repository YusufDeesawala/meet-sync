const express = require('express');
const WebSearch = require('../models/WebSearch');
const router = express.Router();
const fetchuser = require('../middleware/login');

router.post('/web_add', fetchuser, async (req, res) => {
  const { agent, status, results } = req.body;

  if (!agent || !status || !Array.isArray(results)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    const newSearch = new WebSearch({
      agent,
      status,
      results,
      user: req.user.id,
    });

    await newSearch.save();
    res.status(201).json(newSearch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save result' });
  }
});

router.get('/web_fetch', fetchuser, async (req, res) => {
  try {
    const results = await WebSearch.find({ user: req.user.id });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

router.put('/web_update/:id', fetchuser, async (req, res) => {
  const { agent, status, results } = req.body;

  if (!agent || !status || !Array.isArray(results)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    let webSearch = await WebSearch.findById(req.params.id);

    if (!webSearch) {
      return res.status(404).json({ error: 'Result not found' });
    }

    if (webSearch.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    webSearch = await WebSearch.findByIdAndUpdate(
      req.params.id,
      { agent, status, results },
      { new: true }
    );

    res.json(webSearch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update result' });
  }
});

router.delete('/web_delete/:id', fetchuser, async (req, res) => {
  try {
    const webSearch = await WebSearch.findById(req.params.id);

    if (!webSearch) {
      return res.status(404).json({ error: 'Result not found' });
    }

    if (webSearch.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await WebSearch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete result' });
  }
});

module.exports = router;
