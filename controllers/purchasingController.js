const PurchasedIngredients = require("../models/PurchasedIngredientModel.js");
const Ingredients = require("../models/IngredientModel.js");
const PurchasedOrder = require("../models/PurchasedOrderModel.js");
const PurchasedOrderIngredients = require("../models/PurchasedOrderIngredientsModel.js");
// MUST IMPORT REFERENCE MODEL WHEN IT IS GOING TO BE USED
const Unit = require("../models/UnitModel.js");
const User = require("../models/UserModel.js");
const Conversion = require("../models/ConversionModel.js");
const purchasingController = {
  // GET FUNCTIONS
  getAllPurchasedIngredients: (req, res) => {
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

    PurchasedIngredients.find()
      .populate("ingredient", "ingredientName")
      .populate("uom", "abbrev")
      .sort({ createdAt: -1 })
      .exec()
      .then((result) => {
        /* purchasedIngredients is just a name, can be anything
        ^ this is used in the hbs file, usually placed inside the #each
        result is the Ingredient schema where the uom is loaded and available for use in the hbs
        */
        res.render("purchasedIngredients", { purchasedIngredients: result });
      })
      .catch((err) => {
        res.status(404).json({
          message: "Error",
        });
      });
  },

  // for purchased
  getPurchasedIngredientsToList: async (req, res) => {
    try {
      const purchasedIngredients = await PurchasedIngredients.find()
        .populate("ingredient", "ingredientName")
        .populate("uom", "abbrev")
        .sort({ createdAt: -1 })
        .exec();
      const ingredients = await Ingredients.find().exec();
      const uom = await Unit.find().exec();

      res.render("purchased", {
        purchasedIngredients: purchasedIngredients,
        ingredients: ingredients,
        uom: uom,
      });
    } catch (err) {
      console.log(err);
    }
  },

  listIngredient: async (req, res) => {
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
      console.log(err);
    }
  },

  async convert(purchasedIngredientName, quantityPurchased) {
    try {
      const purchased = await PurchasedIngredients.findOne({
        purchasedIngredientName: purchasedIngredientName,
      })
        .populate("ingredient", "ingredientName")
        .populate("uom", "abbrev");

      const ingredient = await Ingredients.findOne({
        ingredientName: purchased.ingredient.ingredientName,
      }).populate("uom", "abbrev");

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

      const convertedValue = await Ingredients.findOneAndUpdate(
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
      console.log(err);
    }
  },

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
          console.log(err);
        }
      }
      res.send(true);

      // multiple add to system ingredients
    } catch (err) {
      console.log(err);
    }
  },

  getToPurchasedIngredients: (req, res) => {
    // checks if totalquantity in ingredients/ system count is less than or equal to reorderpoint
    Ingredients.find({ $expr: { $lte: ["$totalQuantity", "$reorderPoint"] } })
      .populate("uom", "abbrev")
      .sort({ totalQuantity: 1 })
      .exec()
      .then((result) => {
        res.render("purchasingToPurchase", { ingredients: result });
      })
      .catch((err) => {
        res.status(404).json({
          message: "Error",
        });
      });
  },

  getAllPurchasedOrders: (req, res) => {
    PurchasedOrder.find()
      .populate("user")
      .sort({ createdAt: -1 })
      .exec()
      .then((result) => {
        res.render("purchasedOrdersHome", { purchasedOrder: result });
      })
      .catch((err) => {
        res.status(404).json({
          message: "Error",
        });
      });
  },

  getPurchasedOrderDetails: async (req, res) => {
    /* https://stackoverflow.com/questions/19222520/populate-nested-array-in-mongoose --- paths
       populate the ref inside a ref
       ex. purchasedOrderIngredients has purchasedIngredients ref
       so first populate the purchasedIngredients
       then populate the uom so it can be used in the hbs
       */
    const id = req.params.id;
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
      console.log(err);
    }
  },

  // POST FUNCTIONS

  addPurchasedIngredient: async (req, res) => {
    const inputName = req.body.name;
    const inputIngredient = req.body.ingredient;
    const inputUOM = req.body.uom;
    const inputQuantityPerStock = req.body.quantityPerStock;

    try {
      const uom = await Unit.findOne({ abbrev: inputUOM }).exec();
      const ingredient = await Ingredients.findOne({
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
      console.log(err);
    }

  },

  getAllPurchasedIngredients: async (req, res) => {
    try {
      const purchasedIngredient = await PurchasedIngredients.find()
      .populate("ingredient", "ingredientName")
      .populate("uom", "abbrev")
      .sort({ createdAt: -1 })
      .exec();
      res.render('purchasedIngredients', {purchasedIngredient: purchasedIngredient});
    } catch(err) {
      console.log(err);
    }
  }
};

module.exports = purchasingController;
