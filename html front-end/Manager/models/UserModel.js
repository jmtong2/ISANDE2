
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'unassigned',
        enum: ['boss', 'cashier', 'sales manager', 'inventory', 'purchasing', 'unassigned']
    }
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);