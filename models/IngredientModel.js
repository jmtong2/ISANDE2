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
    totalQuantity: {
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