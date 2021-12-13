const express = require('express');
const router = express.Router();

const controller = require('../controllers/controller.js');
const loginController = require('../controllers/loginController.js');
const signupController = require('../controllers/signupController.js');
const logoutController = require('../controllers/logoutController');
const bossController = require('../controllers/bossController.js');
const purchasingController = require('../controllers/purchasingController.js');
const managerController = require("../controllers/managerController.js");
const inventoryController = require("../controllers/inventoryController.js");
const cashierController = require("../controllers/cashierController.js");
const uomController = require("../controllers/uomController.js");



const validation = require('../helpers/validation.js');

router.get('/', controller.getIndex);
router.get('/login', loginController.getLogIn);
router.post('/login', loginController.postLogIn);
router.get('/signup', signupController.getSignUp);
router.post('/signup', validation.signupValidation(), signupController.postSignUp);
router.get('/getCheckEmail', signupController.getCheckEmail);
router.get('/getLogOut', logoutController.getLogOut);



router.post('/addUOM', uomController.addUOM);
router.get('/getConversion', uomController.getConversion);
router.post('/addConversion', uomController.addConversion);

// Boss routes
router.get('/boss/getAllUsers', bossController.getAllUsers);
router.get('/boss/getAssignRole/:email', bossController.getAssignRole);
router.post('/boss/postAssignRole', bossController.postAssignRole);

// Cashier routes
router.get('/cashier/cashierOrders', cashierController.getAllMenuItems);
router.get('/sell', cashierController.sell);

// Purchasing routes
router.get('/purchasing/inventory', purchasingController.getInventory);
router.post('/purchasing/addIngredient', purchasingController.addIngredient);
router.get('/purchasing/reorder', purchasingController.getReorderIngredients);
router.get('/purchasing/purchaseOrders', purchasingController.getAllPurchaseOrders);
router.get('/purchasing/suppliers', purchasingController.getAllSuppliers);
router.post('/purchasing/addSupplier', purchasingController.addSupplier);
router.get('/purchasing/reorderInventory', purchasingController.getReorder);


router.get('/listPurchased', purchasingController.listIngredient);
router.get('/getAddUOMPurchasing', uomController.getAddUOMPurchasing);
router.get('/makePurchasedOrder', purchasingController.makePurchasedOrder);

router.get('/purchasing/purchasedOrdersDetails/:id', purchasingController.getPurchasedOrderDetails);
router.post('/purchasing/addPurchasedIngredient', purchasingController.addPurchasedIngredient);
router.get('/purchasing/purchasedIngredients', purchasingController.getAllPurchasedIngredients);
/*router.get('/purchasing/inventory', purchasingController.getPurchasingInventory);
router.get('/purchasing/suppliers', purchasingController.getAllSuppliers);*/
/*router.get('/purchasing/reorder', purchasingController.getReorderIngredients);*/


// Manager routes
router.get("/manager/menuItems", managerController.getAllMenuItems);
router.get("/manager/menuItemDetailed/:id", managerController.getMenuItemDetails);
router.get("/managerAddMenuItem", managerController.getAddMenuItem);
router.get("/addMenuItem", managerController.addMenuItem);
router.get("/addIngredientsMenu", managerController.addIngredientsMenu);
router.get('/getAddUOMManager', uomController.getAddUOMManager);
router.get("/manager/orderHistory", managerController.getAllOrderHistory);
router.get("/manager/orderDetails/:id", managerController.getOrderDetails);

// Inventory routes
router.get("/inventory/ingredients", inventoryController.getAllIngredients);
/*router.post('/inventory/addIngredient', inventoryController.addIngredient);*/
router.get('/getAddUOMInventory', uomController.getAddUOMInventory);
router.get("/inventory/manualCount", inventoryController.getAllPurchasedIngredients);
router.post("/inventory/postManualCount", inventoryController.postManualCount);
router.get("/inventory/discrepancyReport", inventoryController.getdiscrepancyReport);





module.exports = router;