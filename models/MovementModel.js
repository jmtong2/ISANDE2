
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
var movementSchema = new mongoose.Schema({
    ingredient: {
        type: Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true
    },
    beforeTotalQuantity: {
        type: Number,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    afterTotalQuantity: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {timestamps: true});

module.exports = mongoose.model('Movement', movementSchema);