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
        required: true,
        default: 0
    },
    uom: {
        type: Schema.Types.ObjectId, 
        ref: 'Unit',
        required: true
    },
    reorderPoint: {
        type: Number,
        required: true
    }
    
}, {timestamps: true});

module.exports = mongoose.model('Ingredient', ingredientSchema);