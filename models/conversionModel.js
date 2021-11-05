
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
var conversionSchema = new mongoose.Schema({
    unitA: {
        type: String,
        required: true
    },
    unitB: {
        type: String,
        required: true
    },
    unitAMeasure: {
        type: Number,
        default: 1
    },
    unitBMeasure: {
        type: Number,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Conversion', conversionSchema);