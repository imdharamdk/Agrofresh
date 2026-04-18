const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');
const { signToken, setTokenCookie } = require('../utils/token');

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  location: user.location,
  businessName: user.businessName,
  avatar: user.avatar,
  isVerified: user.isVerified,
  subscriptionPlan: user.subscriptionPlan,
  createdAt: user.createdAt
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, location, businessName } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return sendResponse(res, 409, false, {}, 'User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    location,
    businessName: role === 'business' ? businessName : ''
  });

  const token = signToken(user._id);
  setTokenCookie(res, token);

  sendResponse(res, 201, true, { user: sanitizeUser(user), token }, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.comparePassword(password))) {
    return sendResponse(res, 401, false, {}, 'Invalid email or password');
  }

  const token = signToken(user._id);
  setTokenCookie(res, token);

  sendResponse(res, 200, true, { user: sanitizeUser(user), token }, 'Login successful');
});

const me = asyncHandler(async (req, res) => {
  sendResponse(res, 200, true, { user: req.user }, 'Profile fetched successfully');
});

const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  sendResponse(res, 200, true, {}, 'Logged out successfully');
});

module.exports = {
  register,
  login,
  me,
  logout,
  sanitizeUser
};
