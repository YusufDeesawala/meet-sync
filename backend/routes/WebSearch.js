const express = require('express');
const WebSearch = require('../models/WebSearch');
const router = express.Router();
const fetchuser = require('../middleware/login'); // Assuming fetchuser is the middleware for authentication

// POST Route to add a new web search result
router.post('/web_add', fetchuser, async (req, res) => {
  const { title, content, reference_link } = req.body;

  if (!title || !content || !reference_link) {
    return res.status(400).json({ error: 'Invalid input data: title, content, and reference_link are required' });
  }

  try {
    // Create a new WebSearch document with the provided data, including the authenticated user's ID
    const newSearch = new WebSearch({
      title,
      content,
      reference_link,
      user: req.user.id, // The authenticated user's ID is added here
    });

    // Save the document to MongoDB
    await newSearch.save();
    res.status(201).json(newSearch); // Send back the saved document
  } catch (error) {
    res.status(500).json({ error: 'Failed to save result' });
  }
});

// GET Route to fetch all web search results for the authenticated user
router.get('/web_fetch', fetchuser, async (req, res) => {
  try {
    // Fetch only results belonging to the authenticated user
    const results = await WebSearch.find({ user: req.user.id });
    res.json(results); // Return the results in JSON format
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// PUT Route to update an existing web search result
router.put('/web_update/:id', fetchuser, async (req, res) => {
  const { title, content, reference_link } = req.body;

  if (!title || !content || !reference_link) {
    return res.status(400).json({ error: 'Invalid input data: title, content, and reference_link are required' });
  }

  try {
    let webSearch = await WebSearch.findById(req.params.id);

    if (!webSearch) {
      return res.status(404).json({ error: 'Result not found' });
    }

    // Ensure the authenticated user is the one who created the search result
    if (webSearch.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    webSearch = await WebSearch.findByIdAndUpdate(
      req.params.id,
      { title, content, reference_link },
      { new: true }
    );

    res.json(webSearch); // Send back the updated document
  } catch (error) {
    res.status(500).json({ error: 'Failed to update result' });
  }
});

// DELETE Route to remove a web search result
router.delete('/web_delete/:id', fetchuser, async (req, res) => {
  try {
    const webSearch = await WebSearch.findById(req.params.id);

    if (!webSearch) {
      return res.status(404).json({ error: 'Result not found' });
    }

    // Ensure the authenticated user is the one who created the search result
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
