var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var menuItemIngredientsSchema = new Schema({
    ingredient: {
        type: Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true
    },
    menutItem: {
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    uom: {
        type: Schema.Types.ObjectId, 
        ref: 'Unit',
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('MenuItemIngredients', menuItemIngredientsSchema);