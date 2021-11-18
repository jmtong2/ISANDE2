
var mongoose = require('mongoose');

var supplierSchema = new mongoose.Schema({
    supplier_name: {
        type: String,
        required: true
    },
    contact: {
        type: number,
        required: true
    },
    address: {
        type: String,
        required: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('Supplier', supplierSchema);