var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
var discrepancySchema = new Schema({
    ingredient: {
        type: Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true
    }, 
    reason: {
        type: String,
        required: true
    },
    remarks: {
        type: String,
        required: true
    },
    lossQuantity: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {timestamps: true});

module.exports = mongoose.model('Discrepancy', discrepancySchema);