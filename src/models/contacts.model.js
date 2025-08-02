const { default: mongoose } = require("mongoose");

const contactSchema = mongoose.Schema({
    phoneNumber: {
        type:String
    },
    callType: {
        type:String
    },
    duration: {
        type:Number
    },
    dateTime: {
        type:String
    }
})

const contacts = mongoose.model('contacts', contactSchema);
module.exports = contacts;