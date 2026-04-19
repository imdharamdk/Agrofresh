const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['farmer', 'customer', 'business', 'delivery', 'admin'],
      required: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    businessName: {
      type: String,
      default: '',
      trim: true
    },
    avatar: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'growth', 'enterprise'],
      default: 'free'
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (BCRYPT_HASH_PATTERN.test(this.password)) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordHashed = function isPasswordHashed() {
  return BCRYPT_HASH_PATTERN.test(this.password || '');
};

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  if (!this.password) {
    return false;
  }

  if (!this.isPasswordHashed()) {
    return candidatePassword === this.password;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
