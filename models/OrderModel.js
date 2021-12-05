var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
var orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
   totalAmount: {
        type: Number,
        required: true
   },
   date: {
        type: Date,
        required: true,
        default: Date.now
   }
}, {timestamps: true});

module.exports = mongoose.model('Order', orderSchema);
