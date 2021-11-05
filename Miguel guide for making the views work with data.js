/*
    How to make the pages/tabs viewable with data -Miguel version/guide
    ***Ginawa ko siya sa index kasi hindi ko alam pano gawin yung POST sa mga modal ng bootstrap
        1. Check schema in the models that you want to create
        2. Check if there are "refs" - https://www.youtube.com/watch?v=7xYMulfv-PU
        3. In the index.js in the main folder,
            study and copy the structure of the *** in the index for quick creation of schemas

        Now that the schema is created
        5. Go to routes folder and then routes.js
        6. Create a controller file and paste it at the top
        7. Create a comment then paste your routes (ex. look at previous routes)
        8. Go to the controller file you created
        9. Study and copy the structure in the puchasingControllers.js
        10. Go to the hbs file and input  the attributes needed
            *Use purchasing as referencesfield in  the schema
            *The ones inputted in the puchasing hbs are matched with the attributes/
            */

    // ***creation of Ingredients
    // Schemas needed
    // Import the neede models/schemas
    // Include the ref inside the desired schema that you want to create
    const Ingredients = require("./models/IngredientModel.js");
    const Unit = require("./models/UnitModel.js");


    app.get('/addIngredients', (req, res) => {

    // find the id of the Unit to paste it inside the Ingredient
    // Pastas are meassure ing grams so we find first the "g" in the Unit model
    Unit.findOne({abbrev: 'g'})
    .exec((err, result) => {
        if (err) return handleError(err);

        // Take note the spelling of ingredient and the schema in the right of the equal sign
        // create an ingredient schema
        const ingredient = new Ingredients({
            ingredientName: 'Cheese',
            totalQuantity: 10,
            // id of the Unit because a ref inside a schema only allows the id of an object
            // https://www.youtube.com/watch?v=7xYMulfv-PU 
            uom: result._id,
            reorderPoint: 10
        });

        //save the ingredient
        // take note of the spelling and what was used
        ingredient.save()
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.log(err);
        });
    });

    
    
});

    const Ingredients = require("./models/IngredientModel.js");
    const PurchasedIngredients = require("./models/PurchasedIngredientModel.js");
    const Unit = require("./models/UnitModel.js");

    app.get('/addPurchasedIngredients', (req, res) => {

        Unit.findOne({abbrev: 'ml'})
        .exec()
        .then(result => {
            const unit = result
            console.log(result);

            Ingredients.findOne({ingredientName: 'Cheese'})
            .exec((err, result) => {
                if (err) return handleError(err);

                const purchasedIngredient = new PurchasedIngredients({
                    ingredient: result._id,
                    quantityPerStock: 500,
                    purchasedIngredientName: 'Coke Sakto',
                    uom: unit._id,
                    quantityPuchased: 10
                });

                purchasedIngredient.save()
                .then(result => {
                    res.send(result);
                })
                .catch(err => {
                    console.log(err);
                });
            });
        })
        .catch(err => {
            console.log(err);
        });

        
    });

    getToPurchasedIngredients: (req, res) => {
        Ingredients.find({isLowStock: true})
        .sort({ createdAt: -1})
        .exec()
        .then(result => {
          res.render('purchasingToPurchase', {ingredients: result});
      })
        .catch(err => {
          res.status(404).json({
            message: "Error",
        });
      });
    }, 

    const Conversion = require("./models/ConversionModel.js");
app.get('/addConversion', async (req, res) => {
    const conversion = new Conversion({
        unitA: "kg",
        unitB: "g",
        unitBMeasure: 1000
    });
    try {
        await conversion.save();
        res.send(conversion);
    } catch (err) {
        console.log(err);
    }
});


    app.get('/addOrder', (req, res) => {

        User.findOne({email: 'lmg@yahoo.com'})
        .exec()
        .then(result => {
            const user = result;

            let today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = today.getFullYear();

        today = mm + '/' + dd + '/' + yyyy;

        const purchasedOrder = new PurchasedOrder({
            user: user._id,
            date: today
        });

        purchasedOrder.save()
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.log(err);
        });
    })
        .catch(err => {
            console.log(err);
        });

        
    });


    const PurchasedIngredients = require("../models/PurchasedIngredientModel.js");
    const Ingredients = require("../models/IngredientModel.js");
    const PurchasedOrder = require("../models/PurchasedOrderModel.js");
    const PurchasedOrderIngredients = require("../models/PurchasedOrderIngredientsModel.js");
// MUST IMPORT REFERENCE MODEL WHEN IT IS GOING TO BE USED
const Unit = require("../models/UnitModel.js");

const purchasingController = {


  getAllPurchasedIngredients:  (req, res) => {
    PurchasedIngredients.find()
    .populate('ingredient', 'ingredientName')
    .sort({ createdAt: -1 })
    .exec()
    .then(result => {
      res.render('purchasedIngredients', { purchasedIngredients: result });
  })
    .catch((err) => {
      res.status(404).json({
        message: "Error",
    });
  });
},

  // for purchased
  getPurchasedIngredientsToList:  (req, res) => {
    PurchasedIngredients.find()
    .sort({ createdAt: -1 })
    .exec()
    .then(result => {
      res.render('purchased', { purchasedIngredients: result });
  })
    .catch((err) => {
      res.status(404).json({
        message: "Error",
    });
  });
},

getToPurchasedIngredients: (req, res) => {
    Ingredients.find({isLowStock: true})
    .populate('uom')
    .sort({ createdAt: -1})
    .exec()
    .then(result => {
      res.render('purchasingToPurchase', {ingredients: result});
  })
    .catch(err => {
      res.status(404).json({
        message: "Error",
    });
  });
}, 

getAllPurchasedOrders:  (req, res) => {
    PurchasedOrder.find()
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .exec()
    .then(result => {
      res.render('purchasedOrdersHome', { purchasedOrder: result });
  })
    .catch((err) => {
      res.status(404).json({
        message: "Error",
    });
  });
}, 

getPurchasedOrderDetails: (req, res) => {
    const id = req.params.id;
    // console.log(id);
    PurchasedOrderIngredients.find({purchaseOrder: id})
    .populate('purchasedIngredients')
    .exec()
    .then(result => {
      res.render('purchasedOrderDetails', {purchasedIngredients: result.purchasedIngredients});
  })
    .catch(err => {
      res.status(404).json({
        message: "Error"
    });
  });
},


};

module.exports = purchasingController;


const Ingredients = require("./models/IngredientModel.js");
const PurchasedIngredients = require("./models/PurchasedIngredientModel.js");
const Unit = require("./models/UnitModel.js");
const User = require("./models/UserModel.js");
const PurchasedOrder = require("./models/PurchasedOrderModel.js");
const PurchasedOrderIngredients = require("./models/PurchasedOrderIngredientsModel.js");

app.get('/addIngredients', (req, res) => {

    PurchasedOrder.findOne({date: '08/24/2021'})
    .exec()
    .then(result => {
        const po = result;
        

        PurchasedIngredients.findOne({purchasedIngredientName: 'Coke Sakto'})
        .exec()
        .then(result => {
            const pi = result;

            const purchasedOrderIngredients = new PurchasedOrderIngredients({
                purchasedOrder: po._id,
                purchasedIngredients: pi._id,
                quantityPurchased: 3
            });

            purchasedOrderIngredients.save()
            .then(result => {
                res.send(result);
            })
            .catch(err => {
                console.log(err);
            });

        })
        .catch(err => {
            console.log(err);
        });


    })
    
    
});


const Ingredients = require("./models/IngredientModel.js");
const Unit = require("./models/UnitModel.js");
const User = require("./models/UserModel.js");
const Order = require("./models/OrderModel.js");
const OrderMenuItem = require("./models/orderMenuItemsModel.js");
const MenuItem = require("./models/menuItemModel.js");
app.get('/add', (req, res) => {

    Order.findOne({number: 1})
    .exec((err, result) => {
        if (err) return handleError(err);

        const order = result;
        MenuItem.findOne({menuItemName: 'Joyful Chicken'})
        .exec()
        .then(result => {

            const menuItem = result; 

            const orderMenuItem = new OrderMenuItem({
                order: order._id,
                menuItem: menuItem._id,
                quantity: 1
            });

            orderMenuItem.save()
            .then(result => {
                res.send(result);
            })
            .catch(err => {
                console.log(err);
            });
        })
        .catch(err => {

        });

        


    });
});