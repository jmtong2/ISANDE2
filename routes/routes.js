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
router.post('/sell', cashierController.sell);

// Purchasing routes
router.get('/purchasing/inventory', purchasingController.getInventory);
router.post('/purchasing/addIngredient', purchasingController.addIngredient);
router.post("/editIngredient", purchasingController.editIngredient);
router.get("/getIngredientDates", purchasingController.getIngredientDates);
router.get('/purchasing/reorder', purchasingController.getReorderIngredients);
router.get('/purchasing/purchaseOrders', purchasingController.getAllPurchaseOrders);
router.post('/savePurchaseOrder', purchasingController.savePurchaseOrder);
router.get('/getOrderIngredients', purchasingController.getOrderIngredients);
router.get('/purchasing/suppliers', purchasingController.getAllSuppliers);
router.post('/purchasing/addSupplier', purchasingController.addSupplier);
router.post('/purchasing/editSupplier', purchasingController.editSupplier);
router.get('/purchasing/reorderInventory', purchasingController.getReorder);
router.get('/purchasing/purchaseOrdersDetails/:id', purchasingController.getPurchaseOrderDetails);
router.get('/getPurchaseOrderHistoryDates', purchasingController.getPurchaseOrderHistoryDates);

router.get('/addConversion', cashierController.addConversion);
/*router.get('/addMeasures', purchasingController.addMeasures);
router.get('/listPurchased', purchasingController.listIngredient);
router.get('/getAddUOMPurchasing', uomController.getAddUOMPurchasing);
router.get('/makePurchasedOrder', purchasingController.makePurchasedOrder);
router.get('/purchasing/purchaseOrdersDetails/:id', purchasingController.getPurchaseOrderDetails);
router.post('/purchasing/addPurchasedIngredient', purchasingController.addPurchasedIngredient);
router.get('/purchasing/purchasedIngredients', purchasingController.getAllPurchasedIngredients);*/
/*router.get('/purchasing/inventory', purchasingController.getPurchasingInventory);
router.get('/purchasing/suppliers', purchasingController.getAllSuppliers);*/
/*router.get('/purchasing/reorder', purchasingController.getReorderIngredients);*/


// Manager routes
router.get("/manager/menuItems", managerController.getAllMenuItems);
router.get("/manager/addMenuItem", managerController.getAddMenuItem);
router.get("/manager/menuItemDetailed/:id", managerController.getMenuItemDetails);
router.post("/addMenuItem", managerController.addMenuItem);
router.post("/addIngredientsMenu", managerController.addIngredientsMenu);
router.post("/editMenuItem", managerController.editMenuItem);
router.get('/getAddUOMManager', uomController.getAddUOMManager);
router.get("/manager/orderHistory", managerController.getAllOrderHistory);
router.get("/manager/orderDetailed/:id", managerController.getOrderDetailed);
router.get('/getOrderHistoryDates', managerController.getOrderHistoryDates);

// Inventory routes old
router.get("/inventory/dashboard", inventoryController.getDashboard);
router.get("/inventory/ingredients", inventoryController.getAllIngredients);
router.get("/getIngredientInventoryDates", inventoryController.getIngredientInventoryDates);
router.get("/inventory/movement", inventoryController.getMovement);
router.get('/getMovementDates', inventoryController.getMovementDates);
router.get("/inventory/shrinkageReport", inventoryController.getShrinkageReport);
router.get('/getShrinkageDates', inventoryController.getShrinkageDates);
router.get("/inventory/shrinkage", inventoryController.getInputShrinkage);
router.get('/listShrinkage', inventoryController.listShrinkage);
router.post('/makeShrinkage', inventoryController.makeShrinkage);
router.post("/setReorderEOQ", inventoryController.setReorderEOQ);
router.get("/inventory/purchaseOrders", inventoryController.getAllPurchaseOrders);
router.get('/getInventoryPurchaseOrderHistoryDates', inventoryController.getInventoryPurchaseOrderHistoryDates);
router.post("/isReceived", inventoryController.isReceived);
/*router.post('/inventory/addIngredient', inventoryController.addIngredient);*/
// Inventory routes new
router.get('/inventory/purchaseOrdersDetails/:id', inventoryController.getPurchaseOrderDetails);
router.get('/inventory/purchaseOrdersReceive/:id', inventoryController.receivePurchaseOrder);





module.exports = router;