const mongoose = require('mongoose');
const { CATEGORY_OPTIONS, UNIT_OPTIONS, FRESHNESS_OPTIONS, getStockTag } = require('../utils/productCatalog');

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: CATEGORY_OPTIONS,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    bulkPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    minBulkQty: {
      type: Number,
      default: 0,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: UNIT_OPTIONS,
      required: true
    },
    isOrganic: {
      type: Boolean,
      default: false
    },
    harvestDate: {
      type: Date,
      default: null
    },
    freshnessTag: {
      type: String,
      enum: FRESHNESS_OPTIONS,
      default: 'Regular'
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    images: {
      type: [productImageSchema],
      default: []
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    aiMeta: {
      priceRecommendation: {
        type: Number,
        default: 0
      },
      demandScore: {
        type: Number,
        default: 0
      },
      smartTags: {
        type: [String],
        default: []
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.virtual('stockTag').get(function stockTag() {
  return getStockTag(this.quantity);
});

productSchema.virtual('bulkAvailable').get(function bulkAvailable() {
  return this.minBulkQty > 0 && this.quantity >= this.minBulkQty;
});

module.exports = mongoose.model('Product', productSchema);
