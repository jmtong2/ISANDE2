var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var purchaseOrderSchema = new Schema({
    // Primary key PK purchase_ingredient_id in lucidcharts table
    // _id: Schema.Types.ObjectId, 

    // Foreign Key
/*    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },*/
    dateMade: {
        type: Date,
        required: true,
    },
    /*expectedDateOfDelivery: {
        type: Date,
        required: true,
        default: Date.now
    },*/
    receivedDateOfDelivery: {
        type: Date,
        
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    status: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);