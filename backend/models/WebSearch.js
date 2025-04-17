const mongoose = require('mongoose');
const { Schema } = mongoose;

const WebSearchSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true, // optional, but good for strictness
  },
  agent: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  results: [
    {
      title: {
        type: String,
        required: true,
      },
      snippet: {
        type: String,
        required: true,
      },
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WebSearch', WebSearchSchema);
