var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ingredientSchema = new Schema({
   
    /*
    Ito na yung primary key na inaautogenerate ng mongoose so hindi na kailangan ideclare
    _id: Schema.Types.ObjectId, 
    */
    ingredientName: {
        type: String,
        required: true
    },
    quantityOnHand: {
        type: Number,
        default: 0
    },
    quantityPerStock: {
        type: Number,
        required: true
    },
    uom: {
        type: Schema.Types.ObjectId, 
        ref: 'Unit',
        required: true
    },
    reorderPoint: {
        type: Number, 
        required:true,
        default: 0
    },
     economicOrderQuantity: {
        type: Number,
        required:true,
        default: 0
    },
    price: {
        type: Number,
        required:true
    }, 
    status: {
        type: String,
        enum: ['Active', 'Inactive']
        /*default: "Inactive"*/
    },
    orderStatus: {
        type: String,
        enum: ['Ordered','Present'],
        default: 'Present',
        required: true
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    }

    
}, {timestamps: true});

module.exports = mongoose.model('Ingredient', ingredientSchema);