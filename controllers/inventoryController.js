const Ingredients = require("../models/IngredientModel.js");
const Unit = require("../models/UnitModel.js");
const PurchaseOrder = require("../models/PurchaseOrderModel.js");
const PurchaseOrderIngredients = require("../models/PurchaseOrderIngredientsModel.js");
const Shrinkage = require("../models/ShrinkageModel.js");
const Movement = require("../models/MovementModel.js");

function ManualCountInstance(purchasedIngredient, manualCount, lossQuantity) {
    this.purchasedIngredient = purchasedIngredient;
    this.manualCount = manualCount;
    this.lossQuantity = lossQuantity;
}

const inventoryController = {

    getDashboard: async (req, res) => {
        const outOfStockIngredients = await Ingredients.find({totalQuantity: 0}).exec();
        // Priority ingredients that haven't been ordered 
       /* const priorityIngredients = await Ingredients.find({
        $and: [
          {
            $expr: { $lte: ["$totalQuantity", "$reorderPoint"] },
          },
          {
            orderStatus: "Present",
          },
        ],
      })
        .sort({ totalQuantity: 1 })
        .exec();*/
         const priorityIngredients = await Ingredients.find({
            $expr: { $lte: ["$totalQuantity", "$reorderPoint"] },
      })
        .sort({ totalQuantity: 1 })
        .exec();

        const ordersToBeRecieved = await PurchaseOrder.find({status: "Ordered"}).exec();
        const shrinkages = await Shrinkage.find().exec();
        const name = req.session.firstName + " " + req.session.lastName;
 
        // Send to hbs to be received
        // To get the number of out of stock ingredients in the dashobard hbs use {{outOfStockIngredientsNumber}} inside
        // This will display the number
        res.render("inventoryDashboard", {
            outOfStockIngredientsNumber: outOfStockIngredients.length, 
            priorityIngredients: priorityIngredients,
            ordersToBeRecieved: ordersToBeRecieved.length,
            shrinkages: shrinkages.length,
            managerName: name
            });
    },

    getAllIngredients: async (req, res) => {
        try {
            const inventory = await Ingredients.find()
                .sort({ totalQuantity: 1 })
                .populate("uom")
                .exec();

            res.render("inventoryIngredients", { inventory: inventory });
        } catch (e) {
            res.send("Error page");
        }
    },

       getIngredientInventoryDates: async (req, res) => {
    // Gets the queried dataes
    let startDate = new Date(req.query.startDate);
    let endDate = new Date(req.query.endDate);
      /* let startDate = new Date("Wed Feb 02 2022 00:00:00 GMT+0800 (Philippine Standard Time)");
    let endDate = new Date("Thu Feb 03 2022 00:00:00 GMT+0800 (Philippine Standard Time)");*/
    // set Hours to 0 so you can compare just the dates
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);


    try {
      // save every PO
      const ingredientList = await Ingredients.find()
        .populate("supplier")
        .populate("uom")
        .exec();
    
      // POArray to be returned
      let ingredients = [];
      const ingredientLength = ingredientList.length;
      for (let i = 0; i < ingredientLength; i++) {
        // Loads the date of the PO to be converted to proper format
        let date = new Date(ingredientList[i].createdAt);
        date.setHours(0, 0, 0, 0);
        // Checks if the PO is inside the inputted dates
        if (!(startDate > date || date > endDate)) {

          // Saves the PO to a new Object to be put into the POArray
          const sortedIngredient = {
            id: ingredientList[i]._id,
            dateMade:
              date.getMonth() +
              1 +
              "/" +
              date.getDate() +
              "/" +
              date.getFullYear(),
            ingredientName: ingredientList[i].ingredientName,
            quantityPerStock: ingredientList[i].quantityPerStock,
            uom: ingredientList[i].uom,
            totalQuantity: ingredientList[i].totalQuantity,
            reorderPoint: ingredientList[i].reorderPoint,
            economicOrderQuantity: ingredientList[i].economicOrderQuantity,
          };
          ingredients.push(sortedIngredient);
        }
      }
      // Send back to the JS
      // This is the returned object
      res.send(ingredients);
    } catch (err) {
      res.send("Error page");
    }
  },

    setReorderEOQ: async (req, res) => {
        try {
            const inventory = await Ingredients.findOneAndUpdate(
                { ingredientName: req.body.ingredientName },
                {
                    $set: {
                        reorderPoint: req.body.reorderPoint,
                        economicOrderQuantity: req.body.economicOrderQuantity,
                    },
                }
            ).exec();

            res.send(inventory);
        } catch (e) {
            res.send("Error page");
        }
    },

    getAllPurchaseOrders: async (req, res) => {
        try {
            const purchaseOrderList = await PurchaseOrder.find()
                .populate("supplier", "name")
                .sort({ createdAt: -1 })
                .exec();

            let purchaseOrders = [];
            let totalAmount = 0.00;
            totalAmount.toFixed(2);
            const poLength = purchaseOrderList.length;
            for (let i = 0; i < poLength; i++) {
                let date = new Date(purchaseOrderList[i].dateMade);
                date.setHours(0, 0, 0, 0);
                let dateReceived = new Date(
                    purchaseOrderList[i].receivedDateOfDelivery
                );
                if(dateReceived == null)
                    res.send(true);
                dateReceived.setHours(0, 0, 0, 0);
                let totalDecimal = (Math.round(purchaseOrderList[i].total * 100) / 100).toFixed(2);
        totalAmount += parseFloat(totalDecimal);

                const sortedPO = {
                    id: purchaseOrderList[i]._id,
                    ingredient: purchaseOrderList[i].ingredient,
                    dateMade:
                        date.getMonth() +
                        1 +
                        "/" +
                        date.getDate() +
                        "/" +
                        date.getFullYear(),
                    receivedDateOfDelivery:
                        dateReceived.getMonth() +
                        1 +
                        "/" +
                        dateReceived.getDate() +
                        "/" +
                        dateReceived.getFullYear(),
                    supplier: purchaseOrderList[i].supplier,
                    status: purchaseOrderList[i].status,
                    total: totalDecimal,
                };
                purchaseOrders.push(sortedPO);
            }

            res.render("inventoryPurchaseOrders", {
                purchaseOrder: purchaseOrders,
                totalAmount: totalAmount.toFixed(2) 
            });
        } catch (err) {
            res.send("Error page");
        }
    },

    getInventoryPurchaseOrderHistoryDates: async (req, res) => {
    // Gets the queried dataes
    let startDate = new Date(req.query.startDate);
    let endDate = new Date(req.query.endDate);
        /*let startDate = new Date("Tue Feb 01 2022 00:00:00 GMT+0800 (Philippine Standard Time)");
    let endDate = new Date("Wed Feb 02 2022 00:00:00 GMT+0800 (Philippine Standard Time)");*/
    // set Hours to 0 so you can compare just the dates
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
     try {
            const purchaseOrderList = await PurchaseOrder.find()
                .populate("supplier", "name")
                .sort({ createdAt: -1 })
                .exec();



            let purchaseOrders = [];
            const poLength = purchaseOrderList.length;
            for (let i = 0; i < poLength; i++) {
                let date = new Date(purchaseOrderList[i].dateMade);
                date.setHours(0, 0, 0, 0);
                let dateReceived = new Date(
                    purchaseOrderList[i].receivedDateOfDelivery
                );
                dateReceived.setHours(0, 0, 0, 0);

                if (!(startDate > date || date > endDate)) {
                    const sortedPO = {
                    id: purchaseOrderList[i]._id,
                    ingredient: purchaseOrderList[i].ingredient,
                    dateMade:
                        date.getMonth() +
                        1 +
                        "/" +
                        date.getDate() +
                        "/" +
                        date.getFullYear(),
                    receivedDateOfDelivery:
                        dateReceived.getMonth() +
                        1 +
                        "/" +
                        dateReceived.getDate() +
                        "/" +
                        dateReceived.getFullYear(),
                    supplier: purchaseOrderList[i].supplier,
                    status: purchaseOrderList[i].status,
                    total: purchaseOrderList[i].total,
                };
                purchaseOrders.push(sortedPO);
                }

                
            }

            res.send(purchaseOrders);
        } catch (err) {
            res.send("Error page");
        }
  },

    getMovement: async (req, res) => {
        try {
            const movementList = await Movement.find()
                .populate({
                    path: "ingredient",
                    populate: {
                        path: "uom",
                        model: "Unit",
                    },
                })
                .sort({ createdAt: -1 })
                .exec();

            let movements = [];
            const movementLength = movementList.length;
            for (let i = 0; i < movementLength; i++) {
                let date = new Date(movementList[i].date);
                date.setHours(0, 0, 0, 0);

                const sortedMovement = {
                    ingredient: movementList[i].ingredient,
                    date:
                        date.getMonth() +
                        1 +
                        "/" +
                        date.getDate() +
                        "/" +
                        date.getFullYear(),
                    beforeTotalQuantity: movementList[i].beforeTotalQuantity,
                    action: movementList[i].action,
                    quantity: movementList[i].quantity,
                    afterTotalQuantity: movementList[i].afterTotalQuantity,
                };
                movements.push(sortedMovement);
            }

            res.render("inventoryMovement", { movement: movements });
        } catch (e) {
            res.send("Error page");
        }
    },

    getMovementDates: async (req, res) => {
        let startDate = new Date(req.query.startDate);
        let endDate = new Date(req.query.endDate);

        /*        let startDate = new Date("Tue Feb 01 2022 00:00:00 GMT+0800 (Philippine Standard Time)");
    let endDate = new Date("Wed Feb 02 2022 00:00:00 GMT+0800 (Philippine Standard Time)");*/
        // set Hours to 0 so you can compare just the dates
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        try {
            const movementList = await Movement.find()
                .populate({
                    path: "ingredient",
                    populate: {
                        path: "uom",
                        model: "Unit",
                    },
                })
                .sort({ createdAt: -1 })
                .exec();

            let movements = [];
            const movementLength = movementList.length;
            for (let i = 0; i < movementLength; i++) {
                let date = new Date(movementList[i].date);
                date.setHours(0, 0, 0, 0);

                if (!(startDate > date || date > endDate)) {
                    const sortedMovement = {
                        ingredient: movementList[i].ingredient,
                        date:
                            date.getMonth() +
                            1 +
                            "/" +
                            date.getDate() +
                            "/" +
                            date.getFullYear(),
                        beforeTotalQuantity:
                            movementList[i].beforeTotalQuantity,
                        action: movementList[i].action,
                        quantity: movementList[i].quantity,
                        afterTotalQuantity: movementList[i].afterTotalQuantity,
                    };
                    movements.push(sortedMovement);
                }
            }

            res.send(movements);
        } catch (err) {
            res.send("Error page");
        }
    },

    getShrinkageReport: async (req, res) => {
        try {
            const shrinkageList = await Shrinkage.find()
                .populate({
                    path: "ingredient",
                    populate: {
                        path: "uom",
                        model: "Unit",
                    },
                })
                .sort({ createdAt: -1 })
                .exec();

            let shrinkages = [];
            const shrinkageLength = shrinkageList.length;
            for (let i = 0; i < shrinkageLength; i++) {
                let date = new Date(shrinkageList[i].date);
                date.setHours(0, 0, 0, 0);

                const sortedShrinkage = {
                    ingredient: shrinkageList[i].ingredient,
                    date:
                        date.getMonth() +
                        1 +
                        "/" +
                        date.getDate() +
                        "/" +
                        date.getFullYear(),
                    reason: shrinkageList[i].reason,
                    remarks: shrinkageList[i].remarks,
                    lossQuantity: shrinkageList[i].lossQuantity,
                };
                shrinkages.push(sortedShrinkage);
            }

            res.render("inventoryShrinkageReport", { shrinkage: shrinkages });
        } catch (e) {
            res.send("Error page");
        }
    },

    getShrinkageDates: async (req, res) => {
        let startDate = new Date(req.query.startDate);
        let endDate = new Date(req.query.endDate);

              /* let startDate = new Date("Tue Feb 01 2022 00:00:00 GMT+0800 (Philippine Standard Time)");
    let endDate = new Date("Wed Feb 02 2022 00:00:00 GMT+0800 (Philippine Standard Time)");*/
        // set Hours to 0 so you can compare just the dates
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        try {
            const shrinkageList = await Shrinkage.find()
                .populate({
                    path: "ingredient",
                    populate: {
                        path: "uom",
                        model: "Unit",
                    },
                })
                .sort({ createdAt: -1 })
                .exec();

            let shrinkages = [];
            const shrinkageLength = shrinkageList.length;
            for (let i = 0; i < shrinkageLength; i++) {
                let date = new Date(shrinkageList[i].date);
                date.setHours(0, 0, 0, 0);

                if (!(startDate > date || date > endDate)) {
                    const sortedShrinkage = {
                        ingredient: shrinkageList[i].ingredient,
                        date:
                            date.getMonth() +
                            1 +
                            "/" +
                            date.getDate() +
                            "/" +
                            date.getFullYear(),
                        reason: shrinkageList[i].reason,
                        remarks: shrinkageList[i].remarks,
                        lossQuantity: shrinkageList[i].lossQuantity,
                    };
                    shrinkages.push(sortedShrinkage);
                }
            }
            res.send(shrinkages);
        } catch (err) {
            res.send("Error page");
        }
    },

    getInputShrinkage: async (req, res) => {
        try {
            const ingredients = await Ingredients.find().populate("uom").exec();
            res.render("inventoryShrinkage", { ingredients: ingredients });
        } catch (e) {
            res.send("Error page");
        }
    },

    listShrinkage: async (req, res) => {
        try {
            const ingredient = await Ingredients.findOne({
                ingredientName: req.query.ingredient,
            })
                .populate("uom", "abbrev")
                .exec();
            res.send(ingredient);
        } catch (err) {
            res.send("Error page");
        }
    },

    makeShrinkage: async (req, res) => {
        let cart = req.body.cart;
        let shrinkageQuantity = req.body.shrinkageQuantity;
        let reasons = req.body.reasonsList;
        let remarks = req.body.remarksList;

        try {
            /* let today = new Date();
          let date = today.toLocaleDateString();
          let time = today.toLocaleTimeString();
          today = date + " - " + time;*/
            // multiple save

            let length = cart.length;
            for (let i = 0; i < length; i++) {
                let shrinkage = new Shrinkage({
                    ingredient: cart[i]._id,
                    reason: reasons[i],
                    remarks: remarks[i],
                    lossQuantity: shrinkageQuantity[i],
                });
                await shrinkage.save();
                let subtractedIngredient = -Math.abs(shrinkageQuantity[i]);
                // Subtract the shrinkage to the inventory in the ingredients
                const ingredientMovement = await Ingredients.findOne({
                    ingredientName: cart[i].ingredientName,
                })
                    .populate("uom", "abbrev")
                    .exec();

                const ingredient = await Ingredients.findOneAndUpdate(
                    { ingredientName: cart[i].ingredientName },
                    { $inc: { totalQuantity: subtractedIngredient } },
                    {
                        new: true,
                    }
                ).exec();
                // List in movement
                let shrinkageQuantityNumber = shrinkageQuantity[i];
                let ingredientMovementUOM = ingredientMovement.uom.abbrev;
                let quantity =
                    shrinkageQuantityNumber + " " + ingredientMovementUOM;
                let movement = new Movement({
                    ingredient: ingredientMovement._id,
                    beforeTotalQuantity: ingredientMovement.totalQuantity,
                    action: reasons[i],
                    quantity: quantity,
                    afterTotalQuantity: ingredient.totalQuantity,
                });
                await movement.save();
            }
            res.send(true);
        } catch (err) {
            res.send("Error page");
        }
    },

    getPurchaseOrderDetails: async (req, res) => {
        /* https://stackoverflow.com/questions/19222520/populate-nested-array-in-mongoose --- paths
       populate the ref inside a ref
       ex. purchasedOrderIngredients has purchasedIngredients ref
       so first populate the purchasedIngredients
       then populate the uom so it can be used in the hbs
       */
        const id = req.params.id;
        try {
            const pO = await PurchaseOrder.findById(id)
                .populate("supplier")
                .exec();
                let total = (Math.round(pO.total * 100) / 100).toFixed(2);

            const pOI = await PurchaseOrderIngredients.find({
                purchaseOrder: id,
            })
                .populate({
                    path: "ingredient",
                    populate: {
                        path: "uom",
                        model: "Unit",
                    },
                })
                .populate({
                    path: "purchaseOrder",
                    populate: {
                        path: "supplier",
                        model: "Supplier",
                    },
                })
                .exec();

            res.render("inventoryPurchaseOrderDetails", {
                pOI: pOI,
                pO: pO,
                total: total
            });
        } catch (err) {
            res.send("Error page");
        }
    },

    receivePurchaseOrder: async (req, res) => {
        const id = req.params.id;
        try {
            const pO = await PurchaseOrder.findById(id)
                .populate("supplier")
                .exec();

            const pOI = await PurchaseOrderIngredients.find({
                purchaseOrder: id,
            })
                .populate("ingredient")
                .exec();

            const pOISize = pOI.length;
            //const ingr = await Ingredients.findById(pOI[0].ingredient);

            for (let i = 0; i < pOISize; i++) {
                // Increases the ingredient based on the EOQ
                const ingredient = await Ingredients.findOneAndUpdate(
                    { _id: pOI[i].ingredient._id },
                    { orderStatus: "Present" },
                    {
                        new: true,
                    }
                )
                    .populate("uom", "abbrev")
                    .exec();

                let quantityPurchased = pOI[i].quantityPurchased;
                let qtyPerStock = ingredient.quantityPerStock;
                let addedTotalQuantity = quantityPurchased * qtyPerStock;
                const ingredientIncreased = await Ingredients.findOneAndUpdate(
                    { _id: pOI[i].ingredient._id },
                    { $inc: { totalQuantity: addedTotalQuantity } },
                    {
                        new: true,
                    }
                ).exec();
                // List to movement

                let receivedQuantityNumber = addedTotalQuantity;
                let ingredientMovementUOM = ingredient.uom.abbrev;
                let quantity =
                    receivedQuantityNumber + " " + ingredientMovementUOM;
                let movement = new Movement({
                    ingredient: ingredient._id,
                    beforeTotalQuantity: ingredient.totalQuantity,
                    action: "Received",
                    quantity: quantity,
                    afterTotalQuantity: ingredientIncreased.totalQuantity,
                });
                await movement.save();
            }

            const today = new Date();
            const receivePO = await PurchaseOrder.findOneAndUpdate(
                { _id: id },
                { receivedDateOfDelivery: today },
                {
                    new: true,
                }
            ).exec();
            const receivePO1 = await PurchaseOrder.findOneAndUpdate(
                { _id: id },
                { status: "RECEIVED" },
                {
                    new: true,
                }
            ).exec();

            res.redirect("/inventory/purchaseOrders");

            // inventory.quantityOnHand += qtyPerStock * quantity
            // inventory.status = Ordered
            // PucharsedOrder.receivedDateOfDelivery = today
            // PucharsedOrder.status = received
        } catch (err) {
            res.send("Error page");
        }
    },

    isReceived: async (req, res) => {
        const id = req.body.id;
        try {
            const pO = await PurchaseOrder.findById(id).exec();
            if (pO.status === "PENDING") res.send(false);
            else if (pO === "RECEIVED") res.send(true);
        } catch (err) {
            res.send("Error page");
        }
    },


};

module.exports = inventoryController;