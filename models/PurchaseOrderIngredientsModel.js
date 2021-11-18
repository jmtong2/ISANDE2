var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var purchasedOrderIngredientsSchema = new Schema({
   
    /*
    Ito na yung primary key na inaautogenerate ng mongoose so hindi na kailangan ideclare
    _id: Schema.Types.ObjectId, 
    */

    //ito yung foreign key na isa
    purchaseOrder: {
        type: Schema.Types.ObjectId,
        ref: 'PurchaseOrder',

    },
    // yung isang foreign key
    ingredient: {
        type: Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true
    },
     quantityPerStock: {
        type: Number,
        required: true
    },
    quantityPurchased: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrderIngredients', purchasedOrderIngredientsSchema);