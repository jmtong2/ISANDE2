
var mongoose = require('mongoose');

var supplierSchema = new mongoose.Schema({
    supplierName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: number,
        required: true
    },
    address: {
        type: String,
        required: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('Supplier', supplierSchema);