const express = require('express');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getCommunityComplaints,
  getComplaintById,
  updateComplaintStatus,
  addComment,
  likeComplaint,
  voteComplaint,
  getComplaintStats
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Validation rules
const complaintValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('location.address').notEmpty().withMessage('Address is required')
];

// All routes require authentication
router.use(protect);

// Complaint routes
router.post('/', upload.array('images', 5), complaintValidation, createComplaint);
router.get('/', getComplaints);
router.get('/community/all', getCommunityComplaints);
router.get('/stats', authorize('admin', 'department'), getComplaintStats);
router.get('/:id', getComplaintById);
router.put('/:id/status', authorize('admin', 'department'), updateComplaintStatus);
router.post('/:id/comments', body('text').notEmpty(), addComment);
router.post('/:id/like', likeComplaint);
router.post('/:id/vote', voteComplaint);

module.exports = router;
