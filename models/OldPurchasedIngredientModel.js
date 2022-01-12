var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var purchasedIngredientSchema = new Schema({
    // Primary key PK purchase_ingredient_id in lucidcharts table
    // _id: Schema.Types.ObjectId, 

    // Foreign Key
    ingredient: {
        type: Schema.Types.ObjectId,
        ref: 'Ingredient'
    },
    quantityPerStock: {
        type: Number,
        required: true
    },
    purchasedIngredientName: {
        type: String,
        required: true
    },
    uom: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('PurchasedIngredient', purchasedIngredientSchema);