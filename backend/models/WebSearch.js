const mongoose = require('mongoose');
const { Schema } = mongoose;

const WebSearchSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true, // This ensures that every document is associated with a user
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  reference_link: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WebSearch', WebSearchSchema);
