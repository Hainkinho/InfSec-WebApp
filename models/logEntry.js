const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const logEntrySchema = new Schema({

    httpMethode: {
        type: String,
        required: true
    },

    route: {
        type: String,
        required: true
    },

    ipAddress: {
        type: String,
        required: true
    },

    
    browser: {
        type: String,
        required: true
    },

    token: String

}, { timestamps: true })

const LogEntry = mongoose.model('LogEntry', logEntrySchema)
module.exports = LogEntry
