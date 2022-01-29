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
            const purchaseOrders = await PurchaseOrder.find()
                .populate("supplier", "name")
                .sort({ createdAt: -1 })
                .exec();

            res.render("inventoryPurchaseOrders", {
                purchaseOrder: purchaseOrders,
            });
        } catch (err) {
            res.send("Error page");
        }
    },

    getMovement: async (req, res) => {
        try {
            const movement = await Movement.find()
                .populate({
                    path: "ingredient",
                    populate: {
                        path: "uom",
                        model: "Unit",
                    },
                })
                .sort({ createdAt: -1 })
                .exec();

            res.render("inventoryMovement", { movement: movement });
        } catch (e) {
            res.send("Error page");
        }
    },

    getShrinkageReport: async (req, res) => {
        try {
            const shrinkage = await Shrinkage.find()
                .populate({
                    path: "ingredient",
                    populate: {
                        path: "uom",
                        model: "Unit",
                    },
                })
                .sort({ createdAt: -1 })
                .exec();
            res.render("inventoryShrinkageReport", { shrinkage: shrinkage });
        } catch (e) {
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

    postManualCount: async (req, res) => {
        try {
            // const inputs = req.body;

            const purchasedIngredientsId = req.body.purchasedIngredientId;
            const manualCountInput = req.body.manualCount;
            var details = [];
            var ingredientsDetails = [];
            var isFound;

            console.log("inputs: " + manualCountInput.length);

            // const purchasedIngredients = await PurchasedIngredients.find({})
            //     .populate({
            //         path: 'ingredient',
            //         populate: {
            //             path: 'uom',
            //             model: 'Unit'
            //         }
            //     })
            //     .populate('uom')
            //     .exec();

            const ingredients = await Ingredients.find({}).exec();
            console.log("ingredients...");
            console.log(ingredients);

            for (let i = 0; i < manualCountInput.length; i++) {
                const purchasedIngredient = await PurchasedIngredients.find({
                    _id: purchasedIngredientsId[i],
                })
                    .populate({
                        path: "ingredient",
                        populate: {
                            path: "uom",
                            model: "Unit",
                        },
                    })
                    .populate("uom")
                    .exec()
                    .then((result) => {
                        result.manualCountInput = manualCountInput[i];

                        console.log(
                            "h" +
                                result.manualCountInput +
                                result[0].quantityPerStock
                        );

                        result.lossQuantity =
                            manualCountInput[i] * result[0].quantityPerStock;

                        details.push(result);

                        // for(let j = 0; j < details.length; j++) {
                        //     if(result[0].ingredient == details[j][0].ingredient) {
                        //         console.log('1- ' + details[j][0].ingredient);
                        //         console.log('2- ' + result[0].ingredient);
                        //     }
                        //     else {
                        //         console.log('unsame');
                        //     }
                        // }

                        // for(let j = 0; j < ingredients.length; j++) {
                        //     // console.log('1- ' + ingredients[j]._id);
                        //     // console.log('2- ' + result[0].ingredient._id);
                        //     if(result[0].ingredient.ingredientName == ingredients[j].ingredientName) {
                        //         console.log('2- ' + result[0].ingredient.ingredientName);

                        //         console.log('same');

                        //         ingredientsDetails.push(ingredients[j]);

                        //         console.log(ingredients[j]);
                        //     }
                        //     else {
                        //     }
                        // }

                        isFound = -1;

                        for (let j = 0; j < ingredientsDetails.length; j++) {
                            // console.log('1- ' + ingredients[j]._id);
                            // console.log('2- ' + result[0].ingredient._id);
                            if (
                                result[0].ingredient.ingredientName ==
                                ingredientsDetails[j].ingredient.ingredientName
                            ) {
                                console.log(
                                    "2- " + result[0].ingredient.ingredientName
                                );

                                console.log("same");

                                isFound = j;
                            }
                        }

                        // if not found
                        if (isFound == -1) {
                            var manualCountInstance = {
                                ingredient: result[0].ingredient,
                                manualCount: result.manualCountInput,
                                lossQuantity: result.lossQuantity,
                            };

                            // ingredientsDetails.push(result[0].ingredient);
                            ingredientsDetails.push(manualCountInstance);

                            // console.log(result[0].ingredient);
                        }
                        // if found which means this is a duplicate
                        else if (isFound >= 0) {
                            ingredientsDetails[isFound];
                        }
                    });

                // var lossQuantity = purchasedIngredient.ingredient.totalQuantity - manualCountInput

                // var manualCountInstance = new ManualCountInstance(
                //     purchasedIngredient,
                //     manualCountInput[i],
                //     0
                // )

                // var manualCountInstance = {
                //     ingredient: ingredient,
                //     convertedManualInput: manualCountInput[i],
                //     lossQuantity: 0
                // }

                // details.push(purchasedIngredient);
            }

            console.log("details...");
            console.log(details);

            console.log("ingredientsDetails...");
            console.log(ingredientsDetails);

            res.render("inventoryDiscrepancyReason", {
                ingredients: ingredientsDetails,
            });
        } catch (err) {
            console.log(err);
        }
    },

    getdiscrepancyReport: (req, res) => {
        Discrepancy.find()
            .populate({
                path: "ingredient",
                populate: {
                    path: "uom",
                    model: "Unit",
                },
            })
            .exec()
            .then((result) => {
                //res.send(result);
                res.render("inventoryDiscrepancyReport", {
                    discrepancyReport: result,
                });
            })
            .catch((err) => {
                console.log(err);
            });
    },
};

module.exports = inventoryController;