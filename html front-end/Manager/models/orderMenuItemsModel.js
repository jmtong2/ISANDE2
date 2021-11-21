var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderMenuItemsSchema = new Schema({
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    menuItem: {
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    }
}, {timestamps: true});

    module.exports = mongoose.model('OrderMenuItems', orderMenuItemsSchema);