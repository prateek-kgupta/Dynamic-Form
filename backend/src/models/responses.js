const mongoose = require('mongoose')

const responseSchema = new mongoose.Schema({
    responderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Form'
    },
    
    responses: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId
        },
        response: {
            type: [String]
        }
    }]
})

const Response = mongoose.model("Response", responseSchema)

module.exports = Response