
var mongoose = require('mongoose');

var unitSchema = new mongoose.Schema({
    abbrev: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
}, {timestamps: true});

module.exports = mongoose.model('Unit', unitSchema);