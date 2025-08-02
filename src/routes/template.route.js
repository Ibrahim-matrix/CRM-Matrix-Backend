const express = require("express");
const {templateUpload} = require("../middlewares/uploadImage")
const auth = require("../middlewares/auth");
const {isAdmin} = require("../middlewares/admin");
const templateController = require("../controllers/template.controller");

const router = express.Router();
const upload = require("../middlewares/uploadTemplate")


router.route('/')
.post(auth, isAdmin, upload.single('file'), templateController.createTemplate)
.get(auth, templateController.getTemplates)

router.route('/:id')
.get(auth, templateController.getTemplateById)
.put(auth, templateController.updateTemplateById)
.delete(auth, templateController.deleteTemplateById);


module.exports = router;
