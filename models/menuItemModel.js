var mongoose = require('mongoose');

var menuItemSchema = new mongoose.Schema({
     /*
    Ito na yung primary key na inaautogenerate ng mongoose so hindi na kailangan ideclare
    _id: Schema.Types.ObjectId, 
    */
    menuItemName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Active',
        enum: ['Active', 'Inactive', 'Old version']
    },
    price: {
        type: Number,
        required: true
    }
}, {timestamps: true});
module.exports = mongoose.model('MenuItem', menuItemSchema);