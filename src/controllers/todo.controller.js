const httpStatus = require("http-status");
const { Todo, users } = require("../models");
const catchAsync = require("../utils/catchAsync");

const createTodo = catchAsync(async (req, res) => {

    if (req.user.UserType == 2) {
        req.body["parentId"] = req.user.userId;
        req.body["createrName"] = req.user.Name;
    }
    if (req.user.UserType == 3) {
        req.body["parentId"] = req.user.parentId;
        req.body["createrName"] = req.user.Name;
    }

    const { note, assignId, parentId, createrName, dueDate } = req.body
    const createdBy = req.user.userId

    //get the assign user
    const assignedUser = await users.findById(assignId)
    if (!assignedUser) {
        return res.status(httpStatus.NOT_FOUND).json({
            message: "user not found",
            Data: []
        })
    }

    const branch = assignedUser.Branch?.[0]

    const todo = new Todo({
        parentId,
        note,
        assignId,
        Branch: branch,
        createdBy,
        createrName,
        dueDate,
    })

    const savedTodo = await todo.save()

    return res.status(httpStatus.CREATED).json({
        message: "Todo created successfully",
        Data: savedTodo,
    })
})


const getTodos = catchAsync(async (req, res) => {
    const user = req.user
    let filter = {}

    if (user.UserType === 2) {
        filter.createdBy = user.userId
    } else if (user.UserType === 3 && (user.UserProfile === "Manager" || user.UserProfile === "Custom")) {
        if (Array.isArray(user.Permission) && user.Permission.length > 0) {
            const permittedUserId = user.Permission.map(p => p.userId)
            permittedUserId.push(user.userId)
            filter = {
                parentId: user.parentId,
                assignId: { $in: permittedUserId }
            }
        }

    } else if (user.UserType === 3 && user.UserProfile === "User") {
        filter = {
            parentId: user.parentId,
            assignId: user.userId
        }
    }

    const todos = await Todo.find(filter).sort({ createdAt: -1 })

    const enrichedTodos = todos.map((todo) => {
        let timeStatus = null;
        const dueTime = new Date(todo.dueDate);

        if (todo.status === "Completed") {
            const completedTime = new Date(todo.updatedAt); // or todo.completedAt
            timeStatus = completedTime <= dueTime ? "With in time" : "Run out of time";
        } else {
            const now = new Date();
            if (now > dueTime) {
                timeStatus = "Run out of time";
            }
        }

        return {
            ...todo._doc,
            timeStatus,
        };
    });


    return res.status(httpStatus.OK).json({
        message: "Todos fetched successfully.",
        Data: enrichedTodos
    })
})

const updateTodo = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, completedComment } = req.body;

    const todo = await Todo.findById(id);

    if (!todo) {
        return res.status(httpStatus.NOT_FOUND).json({
            message: "Todo not found",
            Data: [],
        });
    }

    if (status && completedComment) {
        todo.status = status;
        todo.completedComment = completedComment;
    }
    await todo.save();

    return res.status(httpStatus.OK).json({
        message: "Todo marked as completed",
        Data: todo,
    });
});


const deleteTodo = catchAsync(async (req, res) => {
    const { id } = req.params;

    const todo = await Todo.findById(id);

    if (!todo) {
        return res.status(httpStatus.NOT_FOUND).json({
            message: "Todo not found",
            Data: [],
        });
    }

    await Todo.findByIdAndDelete(id);

    return res.status(httpStatus.OK).json({
        message: "Todo deleted successfully",
        Data: [],
    });
});

module.exports = {
    createTodo,
    getTodos,
    updateTodo,
    deleteTodo
}