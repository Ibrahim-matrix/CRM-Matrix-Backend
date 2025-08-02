const { templateService } = require("../services");
const Template = require('../models/templates.model'); 
const path = require("path")




const createTemplate = async (req, res) => {
  try {
   const {userId}  = req.user

    let { type, title, content } = req.body;
    let savedTemplate;
    if (type === '1') {
      // Message Template
      savedTemplate = await new Template({
        type,
        title,
        content,
        userId
      }).save();
    } else if (type === '2') {
      // Image Template
      if (!req.file) {
        return res.status(400).json({status:false, message: 'Image file is required for image template' });
      }
      console.log("-----------",req.file,"----------")
      const imagePath = "uploads/images/"+ req.file.filename;
      
      savedTemplate = await new Template({
        type,
        title,
        content,
        userId,
        image: imagePath,
      }).save();
    } else if (type === '3') {
      // Document Template
      if (!req.file) {
        return res.status(400).json({
          status:false,
           message: 'Document file is required for document template' 
        });
      }

      const documentPath = "uploads/documents/"+ req.file.filename;
      savedTemplate = await new Template({
        type,
        title,
        userId,
        content,
        document: documentPath,
      }).save();
    } else {
      return res.status(400).json({status:false, message: 'Invalid template type'});
    }

    res.status(201).json({
      success:true,
      message:"Template Created Successfully",
      Data:savedTemplate
    });
  } catch (error) {
    
    console.log(error)
    res.status(400).json({ error: error.message });
  }
};

const getTemplates = async (req, res) => {
  try {
    const {type} = req.query
    let filter={
      ...(type? {type}:{})
    }
    console.log(filter)
    const templates = await Template.find(filter);
    console.log(templates)
    res.status(200).json({
      success:true,
      Data: templates
    });
  } catch (error) {
    res.status(500).json({ 
      success:false,
      error: error.message
     });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.status(200).json({
      success:true,
      Data: template
    });
  } catch (error) {
    res.status(500).json({ 
      success:false,
      error: error.message
     });
  }
};

const updateTemplateById = async (req, res) => {
  try{
     await Template.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    return res.status(200).json({
      success:true,
      message: "Template updated successfully!",
    });
  }catch(err){
    return res.status(400).json({
      success:false,
      message: err.message
    });
  }
  
};

const deleteTemplateById = async (req, res) => {
  try{
    const deletedTemplate = await Template.findByIdAndDelete(
      req.params.id
    );
    return res.status(200).json({
      success:true,
      message: "Templated deleted successfully!",
    });
  }catch(err){
    return res.status(400).json({
      success:false,
      message: err.message
    });
  }
};



module.exports = {
  createTemplate,
  getTemplates,
  updateTemplateById,
  deleteTemplateById,
  getTemplateById,
};
