const mongoose = require('mongoose');

const negotiationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedQty: {
      type: Number,
      required: true,
      min: 1
    },
    requestedPrice: {
      type: Number,
      required: true,
      min: 0
    },
    latestOfferPrice: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['open', 'accepted', 'rejected', 'closed'],
      default: 'open'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Negotiation', negotiationSchema);
