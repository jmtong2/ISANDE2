const MenuItemIngredient = require("../models/menuItemIngredientsModel.js");
const Ingredients = require("../models/IngredientModel.js");
const Unit = require("../models/UnitModel.js");
const MenuItem = require("../models/menuItemModel.js");
const Order = require("../models/OrderModel.js");
const OrderMenuItem = require("../models/orderMenuItemsModel.js");
const mongoose = require("mongoose");
const managerController = {

	getAllMenuItems: async (req, res) => {
		try {
			let menuItems = await MenuItem.find({ status: "Active" }).exec();
			res.render("managerMenu", { menuItem: menuItems });
		} catch (err) {
      		res.send('Error page'); 
  		}
	},

	getAddMenuItem: async (req, res) => {
		try {
			const ingredients = await Ingredients.find().exec();
			const uom = await Unit.find().exec();
			res.render("managerMenuAdd", {ingredient: ingredients, uom: uom});
		} catch(err) {
			res.send('Error page'); 
		}
	},

	addMenuItem: async (req, res) => {
		let menuItem = req.body.menuItem;
		let price = req.body.price;
		let listIngredient = req.body.listIngredient;
		let listQuantity = req.body.listQuantity;
		let listUnit = req.body.listUnit;

		try {
			const newMenuItem = await MenuItem({
				menuItemName: menuItem,
				price: price
			});
			await newMenuItem.save();

			// Add new ingredients to the new menuItem
			let listIngredientLength = listIngredient.length;
			for (let i = 0; i < listIngredientLength; i++) {
				try {
					const ingredient2 = await Ingredients.findOne({
						ingredientName: listIngredient[i],
					}).exec();
					const unit = await Unit.findOne({
						abbrev: listUnit[i],
					}).exec();

					let menuIngredient = new MenuItemIngredient({
						ingredient: ingredient2._id,
						menutItem: newMenuItem._id,
						quantity: listQuantity[i],
						uom: unit._id,
					});
					await menuIngredient.save();
				} catch (err) {
					res.send('Error page');
				}
			}
			
		} catch (err) {
			res.send('Error page');
		}
		res.status(200).send({ result: "redirect", url: "/manager/menuItems" });
	},

	addIngredientsMenu: async (req, res) => {
		let oldMenuItemName = req.body.oldMenuItemName;
		let listIngredient = req.body.listIngredient;
		let listQuantity = req.body.listQuantity;
		let listUnit = req.body.listUnit;

		try {
			// Duplicate old menu Item so it can stay in the reports
			const oldMenuItem = await MenuItem.findOne({
				menuItemName: oldMenuItemName,
			}).exec();
		

			// duplicate menuItem
			const newMenuItem = new MenuItem(oldMenuItem);
			newMenuItem._id = mongoose.Types.ObjectId();
			newMenuItem.isNew = true;
			await newMenuItem.save();

			// connect previous menuItemIngredients to the new MenuItem
			// load ingredients of old menuItem
			const oldMenuItemIngredients = await MenuItemIngredient.find({
				menutItem: oldMenuItem._id,
			})
				.populate("ingredient", "ingredientName")
				.exec();

			let length = oldMenuItemIngredients.length;
			// Load old ingredients to the new edited menu item
			for (let i = 0; i < length; i++) {
				try {
					const ingredient = await Ingredients.findOne({
						ingredientName:
							oldMenuItemIngredients[i].ingredient.ingredientName,
					}).exec();
					let menuIngredient = new MenuItemIngredient({
						ingredient: ingredient._id,
						menutItem: newMenuItem._id,
						quantity: oldMenuItemIngredients[i].quantity,
						uom: oldMenuItemIngredients[i].uom,
					});
					await menuIngredient.save();

				} catch (err) {
					res.send('Error page');
				}
			}

			// Add new ingredients to the new menuItem
			for (let i = 0; i < listIngredient.length; i++) {
				try {
					const ingredient2 = await Ingredients.findOne({
						ingredientName: listIngredient[i],
					}).exec();
					const unit = await Unit.findOne({
						abbrev: listUnit[i],
					}).exec();

					let menuIngredient = new MenuItemIngredient({
						ingredient: ingredient2._id,
						menutItem: newMenuItem._id,
						quantity: listQuantity[i],
						uom: unit._id,
					});
					await menuIngredient.save();
				} catch (err) {
					res.send('Error page');
				}
			}

			// change status of oldMenuItem
			const old = await MenuItem.findOneAndUpdate(
				{
					menuItemName: oldMenuItemName,
				},
				{
					status: "Old version",
				},
				{
					new: true,
				}
			).exec();
		} catch (err) {
			res.send('Error page');
		}

		res.status(200).send({ result: "redirect", url: "/manager/menuItems" });
	},

	

	getMenuItemDetails: async (req, res) => {
		try {
			const menuItem = await MenuItem.findById(req.params.id).exec();
			const menuItemIngredient = await MenuItemIngredient.find({
				menutItem: req.params.id,
			})
				.populate("ingredient", "ingredientName")
				.populate("uom", "abbrev")
				.exec();
			const uom = await Unit.find().exec();
			const ingredients = await Ingredients.find().exec();
			res.render("managerMenuItemDetailed", {
				menuItemIngredient: menuItemIngredient,
				menuItem: menuItem,
				ingredient: ingredients,
				uom: uom,
			});
		} catch (err) {
			res.send('Error page');
		}
	},

	getAllOrderHistory: async (req, res) => {
		try {
			const orderMenuItems = await OrderMenuItem.find()
			.populate({
          path: "order",
          populate: {
            path: "user",
            model: "User",
          },
        })
			.populate("menuItem")
			.exec();
			res.render("managerOrdersHistory", { orders: orderMenuItems });

		} catch (err) {
			res.send('Error page');
		}
	},

	getOrderDetails: (req, res) => {
		//Order to get the number to be shown in hbs

		OrderMenuItem.find({ order: req.params.id })
			.populate("menuItem")
			.exec()
			.then((result) => {
				res.render("managerSpecificOrder", { orders: result });
			})
			.catch((err) => {
				res.send('Error page');
			});
	},
};

module.exports = managerController;