const Ingredient = require("../models/IngredientModel.js");
const Supplier = require("../models/SupplierModel.js");
const PurchaseOrder = require("../models/PurchaseOrderModel.js");
const PurchaseOrderIngredients = require("../models/PurchaseOrderIngredientsModel.js");

// MUST IMPORT REFERENCE MODEL WHEN IT IS GOING TO BE USED
const Unit = require("../models/UnitModel.js");
const User = require("../models/UserModel.js");
const Conversion = require("../models/ConversionModel.js");
const purchasingController = {
  async createUnit(abbrev, fullName) {
    const unit = new Unit({
      abbrev: abbrev,
      fullName: fullName,
    });

    const result = await unit.save();
    console.log(result);
  },

  addMeasures: async (req, res) => {
    purchasingController.createUnit("mg", "milligram");
    purchasingController.createUnit("g", "gram");
    purchasingController.createUnit("kg", "kilogram");
    purchasingController.createUnit("lb", "pound");
    purchasingController.createUnit("oz", "ounce");

    // Volume units
    purchasingController.createUnit("ml", "milliliter");
    purchasingController.createUnit("l", "liter");
    purchasingController.createUnit("gal", "gallon");
    purchasingController.createUnit("qt", "quart");
    purchasingController.createUnit("p", "pint");
    purchasingController.createUnit("c", "cup");

    purchasingController.createUnit("tbsp", "tablespoon");
    purchasingController.createUnit("tsps", "teaspoon");

    const units = await Unit.find().exec();
    res.send(units);
  },

  getReorderIngredients: async (req, res) => {
    try {
      const ingredients = await Ingredient.find({
        $and: [
          {
            $expr: { $lte: ["$totalQuantity", "$reorderPoint"] },
          },
          {
            orderStatus: "Present",
          },
        ],
      })
        .populate("uom", "abbrev")
        .populate("supplier", "name")
        .sort({ totalQuantity: 1 })
        .exec();

      res.render("purchasingReorder", { ingredients: ingredients });
    } catch (err) {
      res.send("Error page");
    }
  },

  getReorder: async (req, res) => {
    try {
      const reorderIngredients = await Ingredient.find({
        $and: [
          {
            $expr: { $lte: ["$totalQuantity", "$reorderPoint"] },
          },
          {
            orderStatus: "Present",
          },
        ],
      })
        .populate("supplier")
        .exec();

      const suppliersWithReorder = [];
      let length = reorderIngredients.length;
      for (let i = 0; i < length; i++) {
        let supplier = await Supplier.findOne({
          _id: reorderIngredients[i].supplier._id,
        }).exec();

        suppliersWithReorder.push(supplier.name);
      }
      // Remove if duplicate
      let uniqueSupplier = [...new Set(suppliersWithReorder)];

      res.render("purchasingReorderInput", { supplier: uniqueSupplier });
    } catch (err) {
      res.send("Error page");
    }
  },

  getOrderIngredients: async (req, res) => {
    try {
      const supplier = await Supplier.findOne({
        name: req.query.supplierName,
      }).exec();

      const ingredients = await Ingredient.find({
        $and: [
          {
            $expr: { $lte: ["$totalQuantity", "$reorderPoint"] },
          },
          {
            supplier: supplier._id,
          },
          {
            orderStatus: "Present",
          },
        ],
      })
        .populate("uom", "abbrev")
        .exec();

      res.send(ingredients);
    } catch (err) {
      res.send("Error page");
    }
  },

  // GET FUNCTIONS
  getInventory: async (req, res) => {
    /* 
      find in mongoose that is used in sir Arren's db.js 
       ^ https://www.youtube.com/watch?v=bxsemcrY4gQ&list=PL4cUxeGkcC9jsz4LDYc6kv3ymONOKxwBU&index=9
       *** USE .exec() to make sure that  mongodb finishes finding first before going to the next step
      Populate
      https://stackoverflow.com/questions/38051977/what-does-populate-in-mongoose-mean
      https://www.youtube.com/watch?v=3p0wmR973Fw
      */

    //you can populate two times if needed
    // for the ingredients, you only need to populate the uom as seen in getToPurchasedIngredients below
    try {
      const inventory = await Ingredient.find()
        .populate("supplier", "name")
        .populate("uom", "abbrev")
        .sort({ name: 1 })
        .exec();

      const uom = await Unit.find().exec();

      const supplier = await Supplier.find().exec();

      res.render("purchasingInventory", {
        inventory: inventory,
        uom: uom,
        supplier: supplier,
      });
    } catch (err) {
      res.send("Error page");
    }
  },

  addIngredient: async (req, res) => {
    try {
      const inputName = req.body.name;
      const inputUOM = req.body.uom;
      const inputQuantityPerStock = req.body.quantityPerStock;
      const inputPrice = req.body.price;
      const inputSupplier = req.body.supplier;

      const supplier = await Supplier.findOne({ name: inputSupplier }).exec();
      const uom = await Unit.findOne({ abbrev: inputUOM }).exec();

      const ingredient = new Ingredient({
        ingredientName: inputName,
        quantityPerStock: inputQuantityPerStock,
        uom: uom._id,
        price: inputPrice,
        supplier: supplier._id,
      });

      await ingredient.save();
      res.redirect("/purchasing/inventory");
    } catch (err) {
      res.send("Error page");
    }
  },

  editIngredient: async (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const uomInput = req.body.uom;
    const qps = req.body.qps;
    const price = req.body.price;
    const supplierInput = req.body.supplier;
    try {
      const supplier = await Supplier.findOne({ name: supplierInput }).exec();
      const uom = await Unit.findOne({ abbrev: uomInput }).exec();
      /*            const ingredient = await Ingredient.findOne({_id: id}).exec();*/
      const ingredient = await Ingredient.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            ingredientName: name,
            uom: uom._id,
            quantityPerStock: qps,
            price: price,
            supplier: supplier._id,
          },
        }
      ).exec();
      res.send(ingredient);
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
      const poLength = purchaseOrderList.length;
      for (let i = 0; i < poLength; i++) {
        let date = new Date(purchaseOrderList[i].dateMade);
        date.setHours(0, 0, 0, 0);
        let dateReceived = new Date(
          purchaseOrderList[i].receivedDateOfDelivery
        );
        dateReceived.setHours(0, 0, 0, 0);

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
      res.render("purchasingPurchaseOrders", { purchaseOrder: purchaseOrders });
    } catch (err) {
      res.send("Error page");
    }
  },

  getPurchaseOrderHistoryDates: async (req, res) => {
    // Gets the queried dataes
    let startDate = new Date(req.query.startDate);
    let endDate = new Date(req.query.endDate);
    /*    let startDate = new Date("Tue Feb 01 2022 00:00:00 GMT+0800 (Philippine Standard Time)");
    let endDate = new Date("Wed Feb 02 2022 00:00:00 GMT+0800 (Philippine Standard Time)");*/
    // set Hours to 0 so you can compare just the dates
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    try {
      // save every PO
      const purchaseOrdersList = await PurchaseOrder.find()
        .populate("supplier")
        .exec();

      // POArray to be returned
      let purchaseOrders = [];
      const poLength = purchaseOrdersList.length;
      for (let i = 0; i < poLength; i++) {
        // Loads the date of the PO to be converted to proper format
        let date = new Date(purchaseOrdersList[i].dateMade);
        date.setHours(0, 0, 0, 0);

        // Checks if the PO is inside the inputted dates
        if (!(startDate > date || date > endDate)) {
          // Saves the PO to a new Object to be put into the POArray
          const sortedPurchaseOrder = {
            id: purchaseOrdersList[i]._id,
            dateMade:
              date.getMonth() +
              1 +
              "/" +
              date.getDate() +
              "/" +
              date.getFullYear(),
            supplier: purchaseOrdersList[i].supplier.name,
            status: purchaseOrdersList[i].status,
            total: parseFloat(purchaseOrdersList[i].total).toFixed(2),
          };
          purchaseOrders.push(sortedPurchaseOrder);
        }
      }
      // Send back to the JS
      // This is the returned object
      res.send(purchaseOrders);
    } catch (err) {
      res.send("Error page");
    }
  },

  savePurchaseOrder: async (req, res) => {
    try {
      const ingredients = req.body.ingredients;
      const supplierName = req.body.supplier;
      const total = req.body.total;
      const listAmount = req.body.listAmount;
      const listQuantity = req.body.listQuantity;
      const dateMade = new Date();
      dateMade.toLocaleDateString();

      const supplier = await Supplier.findOne({ name: supplierName }).exec();

      const purchaseOrder = new PurchaseOrder({
        dateMade: dateMade,
        supplier: supplier._id,
        status: "PENDING",
        total: total,
      });

      await purchaseOrder.save();

      const count = ingredients.length;
      for (let i = 0; i < count; i++) {
        const updatedIngredient = await Ingredient.findOneAndUpdate(
          {
            ingredientName: ingredients[i].ingredientName,
          },
          {
            orderStatus: "Ordered",
          },
          {
            new: true,
          }
        ).exec();

        const purchaseOrderIngredient = await PurchaseOrderIngredients({
          purchaseOrder: purchaseOrder._id,
          ingredient: ingredients[i]._id,
          amount: listAmount[i],
          quantityPurchased: listQuantity[i],
        });
        await purchaseOrderIngredient.save();
      }

      res.send(true);
    } catch (err) {
      res.send("Error page");
    }
  },

  getAllSuppliers: async (req, res) => {
    try {
      const suppliers = await Supplier.find().sort({ name: 1 }).exec();

      res.render("purchasingSuppliers", { supplier: suppliers });
    } catch (err) {
      res.send("Error page");
    }
  },

  addSupplier: async (req, res) => {
    try {
      const inputName = req.body.name;
      const inputContact = req.body.contact;
      const inputAddress = req.body.address;

      const supplier = new Supplier({
        name: inputName,
        contactNumber: inputContact,
        address: inputAddress,
      });

      await supplier.save();
      res.redirect("/purchasing/suppliers");
    } catch (err) {
      res.send("Error page");
    }
  },

  /* OLDS ---------------------------------------------------------*/

  // for purchased
  getPurchasedIngredientsToList: async (req, res) => {
    try {
      const purchasedIngredients = await PurchasedIngredients.find()
        .populate("ingredient", "ingredientName")
        .populate("uom", "abbrev")
        .sort({ createdAt: -1 })
        .exec();
      const ingredients = await Ingredient.find().exec();
      const uom = await Unit.find().exec();

      res.render("purchased", {
        purchasedIngredients: purchasedIngredients,
        ingredients: ingredients,
        uom: uom,
      });
    } catch (err) {
      res.send("Error page");
    }
  },

  /*listIngredient: async (req, res) => {
    try {
      const purchasedIngredients = await PurchasedIngredients.findOne({
        purchasedIngredientName: req.query.purchasedIngredient,
      })
        .populate("ingredient", "ingredientName")
        .populate("uom", "abbrev")
        .sort({ createdAt: -1 })
        .exec();
      res.send(purchasedIngredients);
    } catch (err) {
      res.send('Error page'); 
    }
  },*/

  makePurchasedOrder: async (req, res) => {
    let cart = req.query.cart;
    let purchasedQuantity = req.query.purchasedQuantity;

    try {
      const user = await User.findOne({ email: req.session.email }).exec();

      let today = new Date();
      let date = today.toLocaleDateString();
      let time = today.toLocaleTimeString();
      today = date + " - " + time;

      const purchasedOrder = new PurchasedOrder({
        user: user._id,
        date: today,
      });
      await purchasedOrder.save();

      // multiple save
      for (let i = 0; i < cart.length; i++) {
        let purchasedOrderIngredients = new PurchasedOrderIngredients({
          purchasedOrder: purchasedOrder._id,
          purchasedIngredients: cart[i]._id,
          quantityPurchased: purchasedQuantity[i],
        });
        try {
          await purchasedOrderIngredients.save();

          let converted = await purchasingController.convert(
            cart[i].purchasedIngredientName,
            purchasedQuantity[i]
          );
        } catch (err) {
          res.send("Error page");
        }
      }
      res.send(true);

      // multiple add to system ingredients
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
      const pO = await PurchaseOrder.findById(id).populate("supplier").exec();

      const pOI = await PurchaseOrderIngredients.find({ purchaseOrder: id })
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

      res.render("purchasingPurchaseOrderDetails", {
        pOI: pOI,
        pO: pO,
      });
    } catch (err) {
      res.send("Error page");
    }
  },

  async convert(purchasedIngredientName, quantityPurchased) {
    try {
      const purchased = await PurchasedIngredients.findOne({
        purchasedIngredientName: purchasedIngredientName,
      })
        .populate("ingredient", "ingredientName")
        .populate("uom", "abbrev");

      const ingredient = await Ingredient.findOne({
        ingredientName: purchased.ingredient.ingredientName,
      })
        .populate("uom", "abbrev")
        .exec();

      // Find conversion based on purchasedIngredient and systemIngredient uom
      const conversion = await Conversion.findOne({
        $and: [
          {
            $or: [
              { unitA: purchased.uom.abbrev },
              { unitA: ingredient.uom.abbrev },
            ],
          },
          {
            $or: [
              { unitB: purchased.uom.abbrev },
              { unitB: ingredient.uom.abbrev },
            ],
          },
        ],
      });

      let addedValue;
      let converted;

      if (purchased.uom.abbrev == ingredient.uom.abbrev) {
        addedValue =
          purchased.quantityPerStock * quantityPurchased +
          ingredient.totalQuantity;
      } else if (purchased.uom.abbrev == conversion.unitB) {
        converted =
          (purchased.quantityPerStock * quantityPurchased) /
          conversion.unitBMeasure;
        addedValue = converted + ingredient.totalQuantity;
      } else if (purchased.uom.abbrev == conversion.unitA) {
        converted =
          purchased.quantityPerStock *
          quantityPurchased *
          conversion.unitBMeasure;
        addedValue = converted + ingredient.totalQuantity;
      }

      const convertedValue = await Ingredient.findOneAndUpdate(
        {
          ingredientName: purchased.ingredient.ingredientName,
        },
        {
          totalQuantity: addedValue,
        },
        {
          new: true,
        }
      ).exec();

      return convertedValue;
      //findOneAndUpdate the ingredient
    } catch (err) {
      res.send("Error page");
    }
  },

  /* getPurchasedOrderDetails: async (req, res) => {*/
  /* https://stackoverflow.com/questions/19222520/populate-nested-array-in-mongoose --- paths
       populate the ref inside a ref
       ex. purchasedOrderIngredients has purchasedIngredients ref
       so first populate the purchasedIngredients
       then populate the uom so it can be used in the hbs
       */
  /*  const id = req.params.id;
    try {
      const pOI = await PurchasedOrderIngredients.find({ purchasedOrder: id })
        .populate({
          path: "purchasedIngredients",
          populate: {
            path: "uom",
            model: "Unit",
          },
        })
        .exec();

      res.render("purchasedOrderDetails", { purchasedOrderDetails: pOI });
    } catch (err) {
      res.send('Error page'); 
    }
  },*/

  // POST FUNCTIONS

  addPurchasedIngredient: async (req, res) => {
    const inputName = req.body.name;
    const inputIngredient = req.body.ingredient;
    const inputUOM = req.body.uom;
    const inputQuantityPerStock = req.body.quantityPerStock;

    try {
      const uom = await Unit.findOne({ abbrev: inputUOM }).exec();
      const ingredient = await Ingredient.findOne({
        ingredientName: inputIngredient,
      }).exec();

      const purchasedIngredient = new PurchasedIngredients({
        ingredient: ingredient._id,
        quantityPerStock: inputQuantityPerStock,
        purchasedIngredientName: inputName,
        uom: uom._id,
        quantityPurchased: 0,
      });

      await purchasedIngredient.save();
      res.redirect("/purchasing/purchased");
    } catch (err) {
      res.send("Error page");
    }
  },

  getAllPurchasedIngredients: async (req, res) => {
    try {
      const purchasedIngredient = await PurchasedIngredients.find()
        .populate("ingredient", "ingredientName")
        .populate("uom", "abbrev")
        .sort({ createdAt: -1 })
        .exec();
      res.render("purchasedIngredients", {
        purchasedIngredient: purchasedIngredient,
      });
    } catch (err) {
      res.send("Error page");
    }
  },
};

module.exports = purchasingController;