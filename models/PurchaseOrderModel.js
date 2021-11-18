var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var purchaseOrderSchema = new Schema({
    // Primary key PK purchase_ingredient_id in lucidcharts table
    // _id: Schema.Types.ObjectId, 

    // Foreign Key
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },

}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchasedOrderSchema);