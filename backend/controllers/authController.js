const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { encrypt } = require('../utils/encryption');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, mobile, password, role, location, phone } = req.body;

  try {
    // Check if user exists by email OR mobile
    const userExists = await User.findOne({
      $or: [
        { email: email || 'null_email' },
        { mobile: mobile || 'null_mobile' }
      ]
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 1. Generate Wallet
    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;
    const encryptedPrivateKey = encrypt(wallet.privateKey);

    // 2. Create User
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      role,
      location,
      phone,
      walletAddress,
      encryptedPrivateKey // Stored securely
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        walletAddress: user.walletAddress, // Return public address
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, mobile, password } = req.body;

  try {
    // Check login by Email OR Mobile
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (mobile) {
      user = await User.findOne({ mobile });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        token: generateToken(user._id),
      });
    } else {
      res.status(500).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private (Needs middleware)
const getUserProfile = async (req, res) => {
  // Assuming middleware adds user to req
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        location: user.location
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

module.exports = { registerUser, loginUser, getUserProfile };
