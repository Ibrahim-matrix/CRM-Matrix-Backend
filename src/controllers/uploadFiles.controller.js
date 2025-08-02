const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const catchAsync = require("../utils/catchAsync");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dyvp4cxgd",
  api_key: "187773988639531",
  api_secret: "wCLxh3LFJ0E391e4cwEacxXjWDc",
});

// 📁 Storage setup for PDFs (raw files)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: "auto", // IMPORTANT for PDF
    format: async () => "pdf",
    public_id: (req, file) => "proposal-" + Date.now(),
  },
});

const upload = multer({ storage });

const uploadFiles = catchAsync(async (req, res) => {
  res.json({
    message: "File upload successful",
    fileUrl: req.file.path, // secure Cloudinary URL
    publicId: req.file.filename, // public_id stored in Cloudinary
  });
});

module.exports = { upload, uploadFiles };
