var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contactNumber: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('Supplier', supplierSchema);