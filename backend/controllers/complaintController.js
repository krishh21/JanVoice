const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');
const { validationResult } = require('express-validator');

const categoryAliases = {
  road: 'Road & Infrastructure',
  water: 'Water Supply',
  electricity: 'Electricity',
  sanitation: 'Sanitation & Waste',
  safety: 'Public Safety',
  healthcare: 'Healthcare',
  education: 'Education',
  park: 'Parks & Recreation',
  traffic: 'Traffic & Transportation',
  other: 'Others'
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private



const createComplaint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { title, description, category, location } = req.body;

    const submittedCategory = String(category || '').trim();
    const normalizedCategory = categoryAliases[submittedCategory.toLowerCase()] || submittedCategory;

    // --- FIX: case-insensitive category matching ---
    const validCategories = Complaint.schema.path('category').enumValues;
    const matchedCategory = validCategories.find(
      cat => cat.toLowerCase() === normalizedCategory.toLowerCase()
    );

    if (!matchedCategory) {
      return res.status(400).json({
        message: `Invalid category. Allowed values: ${validCategories.join(', ')}`
      });
    }
    category = matchedCategory; // use the correctly cased value
    // ------------------------------------------------

    // Determine priority based on category
    let priority = 'Medium';
    const criticalCategories = ['Public Safety', 'Electricity', 'Healthcare'];
    if (criticalCategories.includes(category)) {
      priority = 'High';
    }

    // Find appropriate department based on category
    const department = await Department.findOne({ 
      categories: category,
      isActive: true 
    });

    const complaint = await Complaint.create({
      title,
      description,
      category,
      location,
      citizen: req.user._id,
      department: department ? department._id : null,
      priority,
      images: req.files ? req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        public_id: file.filename
      })) : []
    });

    // Update department stats
    if (department) {
      department.totalComplaints += 1;
      await department.save();
    }

    // Populate complaint with citizen details
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('citizen', 'name email phone')
      .populate('department', 'name');

    res.status(201).json(populatedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    const { status, category, department, priority, sort } = req.query;
    
    let query = {};
    
    // Citizen can only see their own complaints
    if (req.user.role === 'citizen') {
      query.citizen = req.user._id;
    }
    
    // Department staff can see complaints assigned to their department
    if (req.user.role === 'department') {
      query.department = req.user.department;
    }
    
    // Admin can see all complaints
    if (req.user.role === 'admin') {
      // No additional filter for admin
    }

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (department) query.department = department;
    if (priority) query.priority = priority;

    let sortOptions = { createdAt: -1 }; // Default sort by newest
    
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'priority') {
      sortOptions = { 
        priority: -1,
        createdAt: -1 
      };
    }

    const complaints = await Complaint.find(query)
      .sort(sortOptions)
      .populate('citizen', 'name email phone')
      .populate('department', 'name')
      .populate('assignedTo', 'name email')
      .populate('resolutionDetails.resolvedBy', 'name');

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email phone address')
      .populate('department', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .populate('resolutionDetails.resolvedBy', 'name')
      .populate('comments.user', 'name role');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Citizens can view their own complaints and public community complaints.
    // Rejected complaints are kept private to the owner and staff.
    if (req.user.role === 'citizen') {
      const isOwner = complaint.citizen._id.toString() === req.user._id.toString();
      const isCommunityVisible = complaint.status !== 'Rejected';

      if (!isOwner && !isCommunityVisible) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    if (req.user.role === 'department' && 
        complaint.department && complaint.department._id.toString() !== req.user.department.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private/Department/Admin
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolutionNotes, beforeImage, afterImage } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check authorization
    if (req.user.role === 'citizen') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'department' && 
        complaint.department.toString() !== req.user.department.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    complaint.status = status;
    complaint.updatedAt = Date.now();

    if (status === 'Resolved') {
      complaint.resolutionDetails = {
        resolvedBy: req.user._id,
        resolutionNotes,
        resolvedAt: Date.now(),
        beforeImage,
        afterImage
      };

      // Update department stats
      const department = await Department.findById(complaint.department);
      if (department) {
        department.resolvedComplaints += 1;
        
        // Calculate resolution time in hours
        const resolutionTime = (Date.now() - complaint.createdAt) / (1000 * 60 * 60);
        department.avgResolutionTime = 
          (department.avgResolutionTime * (department.resolvedComplaints - 1) + resolutionTime) / 
          department.resolvedComplaints;
        
        await department.save();
      }
    }

    const updatedComplaint = await complaint.save();
    
    res.json(updatedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const comment = {
      user: req.user._id,
      text,
      isOfficial: req.user.role !== 'citizen'
    };

    complaint.comments.push(comment);
    await complaint.save();

    // Populate user details in the new comment
    const populatedComplaint = await Complaint.findById(req.params.id)
      .populate('comments.user', 'name role');

    res.json(populatedComplaint.comments[populatedComplaint.comments.length - 1]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all complaints (for citizens to view community complaints)
// @route   GET /api/complaints/community/all
// @access  Private/Citizen
const getCommunityComplaints = async (req, res) => {
  try {
    const { status, category, sort, page = 1, limit = 10 } = req.query;

    let query = { status: { $ne: 'Rejected' } }; // Don't show rejected complaints

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;

    let sortOptions = { createdAt: -1 }; // Default sort by newest

    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'popular') {
      sortOptions = { 'likes': -1, createdAt: -1 };
    } else if (sort === 'most-commented') {
      sortOptions = { 'comments': -1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('citizen', 'name')
      .populate('department', 'name')
      .populate('likes.user', 'name')
      .populate('comments.user', 'name role')
      .select('title description category location status priority createdAt likes comments citizen department images');

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/Unlike complaint
// @route   POST /api/complaints/:id/like
// @access  Private
const likeComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user already liked
    const existingLike = complaint.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike: remove the like
      complaint.likes = complaint.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like: add the like
      complaint.likes.push({
        user: req.user._id,
        createdAt: Date.now()
      });
    }

    await complaint.save();

    res.json({
      likesCount: complaint.likes.length,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upvote/downvote complaint
// @route   POST /api/complaints/:id/vote
// @access  Private
const voteComplaint = async (req, res) => {
  try {
    const { voteType } = req.body;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const userId = req.user._id.toString();
    const upvotes = Array.isArray(complaint.upvotes) ? complaint.upvotes : [];
    const downvotes = Array.isArray(complaint.downvotes) ? complaint.downvotes : [];

    complaint.upvotes = upvotes.filter(id => id && id.toString() !== userId);
    complaint.downvotes = downvotes.filter(id => id && id.toString() !== userId);

    if (voteType === 'upvote') {
      complaint.upvotes.push(req.user._id);
    } else {
      complaint.downvotes.push(req.user._id);
    }

    await complaint.save();

    res.json({
      upvotes: complaint.upvotes,
      downvotes: complaint.downvotes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats
// @access  Private/Admin/Department
const getComplaintStats = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'department') {
      query.department = req.user.department;
    }

    const totalComplaints = await Complaint.countDocuments(query);
    
    const complaintsByStatus = await Complaint.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const complaintsByCategory = await Complaint.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const complaintsByMonth = await Complaint.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const avgResolutionTime = await Complaint.aggregate([
      { 
        $match: { 
          ...query,
          status: 'Resolved'
        } 
      },
      {
        $group: {
          _id: null,
          avgTime: { 
            $avg: { 
              $divide: [
                { $subtract: ['$resolutionDetails.resolvedAt', '$createdAt'] },
                1000 * 60 * 60 // Convert to hours
              ]
            }
          }
        }
      }
    ]);

    res.json({
      totalComplaints,
      complaintsByStatus,
      complaintsByCategory,
      complaintsByMonth,
      avgResolutionTime: avgResolutionTime[0]?.avgTime || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getCommunityComplaints,
  getComplaintById,
  updateComplaintStatus,
  addComment,
  likeComplaint,
  voteComplaint,
  getComplaintStats
};
