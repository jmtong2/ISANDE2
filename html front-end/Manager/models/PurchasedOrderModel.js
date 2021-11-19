var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var purchasedOrderSchema = new Schema({
    // Primary key PK purchase_ingredient_id in lucidcharts table
    // _id: Schema.Types.ObjectId, 

    // Foreign Key
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String,
        required: true,
        default: Date.now
    }

}, { timestamps: true });

module.exports = mongoose.model('PurchasedOrder', purchasedOrderSchema);