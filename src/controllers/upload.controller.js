const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const streamifier = require("streamifier");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure Multer-Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "image",
  },
});

const upload = multer({ storage });

const uploadImage = catchAsync(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  res.status(httpStatus.OK).json({
    message: "Upload successful",
    imageUrl: req.file.path, // Cloudinary image URL
    publicId: req.file.filename,
  });
});

// files upload
// const fileStorage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     resource_type: "auto", // required for PDF and other non-image files
//     format: "pdf", // force file to have a .pdf extension in the URL
//     public_id: (req, file) => {
//       // ensures filename is readable and consistent
//       return `proposal-${Date.now()}`;
//     },
//   },
// });

// const uploadFileMulter = multer({ storage: fileStorage });

// const uploadFile = catchAsync(async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   res.status(httpStatus.OK).json({
//     message: "File upload successful",
//     fileUrl: req.file.path, // Cloudinary file URL
//     publicId: req.file.filename, // Public ID for deletion if needed
//   });
// });

const uploadFileMulter = multer({ storage: multer.memoryStorage() });

const uploadFile = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const streamUpload = () =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "proposals", // optional
          public_id: `proposal-${Date.now()}`,
          format: "pdf",
        },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

  const result = await streamUpload();

  res.status(httpStatus.OK).json({
    message: "File upload successful",
    fileUrl: result.secure_url,
    publicId: result.public_id,
  });
});

module.exports = { upload, uploadImage, uploadFile, uploadFileMulter };
