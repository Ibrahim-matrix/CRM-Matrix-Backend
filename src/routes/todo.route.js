const express = require("express");

const validate = require("../middlewares/validate");
const { profileImage } = require("../middlewares/upload");

const todoController = require("../controllers/todo.controller")
const { userValidation } = require("../validations");
const router = express.Router();
const auth = require("../middlewares/auth");


router 
    .route("/")
    .get(auth, todoController.getTodos)
    .post(auth, todoController.createTodo)

router.route("/:id")
    .put(auth, todoController.updateTodo)
    .delete(auth, todoController.deleteTodo)



module.exports = router