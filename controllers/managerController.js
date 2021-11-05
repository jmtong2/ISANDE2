const MenuItemIngredient = require("../models/menuItemIngredientsModel.js");
const Ingredients = require("../models/IngredientModel.js");
const Unit = require("../models/UnitModel.js");
const MenuItem = require("../models/menuItemModel.js");
const Order = require("../models/OrderModel.js");
const OrderMenuItem = require("../models/orderMenuItemsModel.js");
const mongoose = require("mongoose");
const managerController = {
	getAddMenuItem: async (req, res) => {
		try {
			const ingredients = await Ingredients.find().exec();
			const uom = await Unit.find().exec();

			res.render("managerAddMenuItem", {ingredient: ingredients, uom: uom});
		} catch(err) {
			console.log(err);
		}
	},

	addMenuItem: async (req, res) => {
		let menuItem = req.query.menuItem;
		let price = req.query.price;
		let listIngredient = req.query.listIngredient;
		let listQuantity = req.query.listQuantity;
		let listUnit = req.query.listUnit;

		try {
			const newMenuItem = await MenuItem({
				menuItemName: menuItem,
				price: price
			});
			await newMenuItem.save();

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
					console.log(err);
				}
			}

			
		} catch (err) {
			console.log(err);
		}

		res.status(200).send({ result: "redirect", url: "/manager/menuItems" });
	},

	addIngredientsMenu: async (req, res) => {
		let oldMenuItemName = req.query.oldMenuItemName;
		let listIngredient = req.query.listIngredient;
		let listQuantity = req.query.listQuantity;
		let listUnit = req.query.listUnit;

		try {
			// Duplicate old menu Item
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
					console.log(err);
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
					console.log(err);
				}
			}

			// change status of oldMenuItem
			const old = await MenuItem.findOneAndUpdate(
				{
					menuItemName: oldMenuItemName,
				},
				{
					status: "old version",
				},
				{
					new: true,
				}
			).exec();
		} catch (err) {
			console.log(err);
		}

		res.status(200).send({ result: "redirect", url: "/manager/menuItems" });
	},

	getAllMenuItems: (req, res) => {
		MenuItem.find({ status: "active" })
			.exec()
			.then((result) => {
				res.render("managerMenu", { menuItem: result });
			})
			.catch((err) => {
				console.log(err);
			});
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
			console.log(err);
		}
	},

	getAllOrderHistory: (req, res) => {
		Order.find()
			.populate("user")
			.exec()
			.then((result) => {
				res.render("managerOrdersHistory", { Orders: result });
			})
			.catch((err) => {
				console.log(err);
			});
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
				console.log(err);
			});
	},
};

module.exports = managerController;