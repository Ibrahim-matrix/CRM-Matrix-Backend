const mongoose = require("mongoose");
const permissionSchema = mongoose.Schema({
    name:{
        type:String,
        unique:true
    },
});

const permissions = mongoose.model("permissions", permissionSchema);
module.exports = permissions;
