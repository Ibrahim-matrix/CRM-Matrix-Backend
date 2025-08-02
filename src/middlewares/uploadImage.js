const multer = require('multer');

// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname+'../../../images'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); // Rename the file with a timestamp
    },
  });
  
  const upload = multer({ storage: storage });
  

 // Set up Multer storage
const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname+'../../../images/templates'); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Rename the file with a timestamp
  },
});

const templateUpload = multer({ storage: templateStorage }); 

module.exports = {
  upload,
  templateUpload
}