const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Define valid image file extensions
const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp', '.svg'];

// Define valid document file extensions
const validDocumentExtensions = ['.pdf', '.doc', '.txt', '.docx', '.rtf', '.odt', '.ppt', '.pptx', '.xls', '.xlsx'];

// Define the storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    if (req.body.type === '2') {
      uploadPath = '../uploads/images';
    } else if (req.body.type === '3') {
      uploadPath = '../uploads/documents';
    } else {
      const err = new Error('Invalid template type');
      return cb(err);
    }

    fs.access(uploadPath, (err) => {
      if (err) {
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
          if (err) {
            return cb(err);
          }
          cb(null, uploadPath);
        });
      } else {
        cb(null, uploadPath);
      }
    });
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split('.').pop();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    try {
      cb(null, uniqueSuffix + '.' + extension);
    } catch (error) {
      cb(error);
    }
  },
});

// Define the file filter function
const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
console.log(`
----------------




---------------`,req.body.type,"-------------", typeof req.body.type)
  if (req.body.type === '2') {
    // For image type, check if the extension is valid for images
    if (validImageExtensions.includes(fileExtension)) {
      cb(null, true); // Allow valid image file uploads
    } else {
      cb(new Error('Invalid image file format'), false); // Reject invalid image file uploads
    }
  } else if (req.body.type === '3') {
    // For document type (type 3), check if the extension is valid for documents
    if (validDocumentExtensions.includes(fileExtension)) {
      cb(null, true); // Allow valid document file uploads
    } else {
      cb(new Error('Invalid document file format'), false); // Reject invalid document file uploads
    }
  } else {
    cb(new Error('Invalid template type'), false); // Reject other template types
  }
};

// Create the multer middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
