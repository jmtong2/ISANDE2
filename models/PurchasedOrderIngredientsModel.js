var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var purchasedOrderIngredientsSchema = new Schema({
   
    /*
    Ito na yung primary key na inaautogenerate ng mongoose so hindi na kailangan ideclare
    _id: Schema.Types.ObjectId, 
    */

    //ito yung foreign key na isa
    purchasedOrder: {
        type: Schema.Types.ObjectId,
        ref: 'PurchasedOrder',

    },
    // yung isang foreign key
    purchasedIngredients: {
        type: Schema.Types.ObjectId,
        ref: 'PurchasedIngredient',
        required: true
    },
    quantityPurchased: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('PurchasedOrderIngredients', purchasedOrderIngredientsSchema);