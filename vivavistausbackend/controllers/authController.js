const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User (For Normal Signup)
const registerUser = async (req, res) => {
  const { name, email, password, country } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      country,
      role: "user",
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin-Only Route to Create Users (Including Admins)
const createUserByAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role });

    await user.save();
    res
      .status(201)
      .json({ message: `User registered as ${role} successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log("🚀 ~ loginUser ~ user:", user);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Set country from session if available
    const userCountry = req.session.country || "Canada";

    const token = jwt.sign(
      { id: user._id, role: user.role, country: userCountry }, // Store country in token
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        country: userCountry,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ Admin: Get All Users
const getUsers = async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    const users = await User.find({
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ],
    }).select("-password"); // Exclude password from response

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin: Update User (Full Update)
const updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate role if provided
    if (role && !["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Check if email is being changed and if it's already in use by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({ message: "Email already in use by another user" });
      }
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      
      try {
        // Hash the new password with a higher salt round for better security
        user.password = await bcrypt.hash(password, 12);
        console.log("Password updated successfully for user:", user._id);
      } catch (hashError) {
        console.error("Error hashing password:", hashError);
        return res.status(500).json({ message: "Error updating password" });
      }
    }
    
    // Save updated user
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.params.id).select("-password");
    
    res.json({ 
      message: "User updated successfully", 
      user: updatedUser,
      passwordUpdated: password && password.trim() !== '' ? true : false
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin: Update User Role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin: Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  createUserByAdmin,
  loginUser,
  getUserProfile,
  getUsers,
  updateUser,
  updateUserRole,
  deleteUser,
};
