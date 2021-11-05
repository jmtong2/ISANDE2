const MenuItemIngredient = require("../models/menuItemIngredientsModel.js");
const Ingredients = require("../models/IngredientModel.js");
const Unit = require("../models/UnitModel.js");
const MenuItem = require("../models/menuItemModel.js");
const Conversion = require("../models/ConversionModel.js");
const Order = require("../models/OrderModel.js");
const orderMenuItems = require("../models/orderMenuItemsModel.js");
const User = require("../models/UserModel.js");

const cashierController = {
	getAllMenuItems: async (req, res) => {
		try {
			const menu = await MenuItem.find({ status: "active" }).exec();
			res.render("cashierOrders", { menuItem: menu });
		} catch (err) {
			console.log(err);
		}
	},

	async convert(menuItemIngredient) {
		try {
			const ingredient = await Ingredients.findOne({
				ingredientName: menuItemIngredient.ingredient.ingredientName,
			})
				.populate("uom", "abbrev")
				.exec();

			// Find conversion based on purchasedIngredient and systemIngredient uom
			const conversion = await Conversion.findOne({
				$and: [
					{
						$or: [
							{ unitA: menuItemIngredient.uom.abbrev },
							{ unitA: ingredient.uom.abbrev },
						],
					},
					{
						$or: [
							{ unitB: menuItemIngredient.uom.abbrev },
							{ unitB: ingredient.uom.abbrev },
						],
					},
				],
			});

			let subtractedValue;
			let converted;

			if (menuItemIngredient.uom.abbrev == ingredient.uom.abbrev) {
				subtractedValue =
					ingredient.totalQuantity - menuItemIngredient.quantity;
			} else if (menuItemIngredient.uom.abbrev == conversion.unitB) {
				converted =
					menuItemIngredient.quantity / conversion.unitBMeasure;
				subtractedValue = ingredient.totalQuantity - converted;
			} else if (menuItemIngredient.uom.abbrev == conversion.unitA) {
				converted =
					menuItemIngredient.quantity * conversion.unitBMeasure;
				subtractedValue = ingredient.totalQuantity - converted;
			}
			let subtractedQuantity = Math.round(subtractedValue * 100) / 100;

			const convertedValue = await Ingredients.findOneAndUpdate(
				{
					ingredientName:
						menuItemIngredient.ingredient.ingredientName,
				},
				{
					totalQuantity: subtractedQuantity,
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

	sell: async (req, res) => {
		// load cart ARRAY
		const cart = req.query.cart;

		try {
			let list = [];
			let menuList = [];
			for (let i = 0; i < cart.length; i++) {
				const menuItem = await MenuItem.findOne({
					menuItemName: cart[i],
					status: "active",
				}).exec();

				menuList.push(menuItem);

				// get menuItemIngredients to be subtracted
				const menuItemIngredient = await MenuItemIngredient.find({
					menutItem: menuItem._id,
				})
					.populate("ingredient", "ingredientName")
					.populate("uom", "abbrev")
					.exec();

				for (let j = 0; j < menuItemIngredient.length; j++) {
					let converted = await cashierController.convert(
						menuItemIngredient[j]
					);
				}
			}
			// Make order history
			const user = await User.findOne({
				email: req.session.email,
			}).exec();

			let today = new Date();
			let date = today.toLocaleDateString();
			let time = today.toLocaleTimeString();
			today = date + " - " + time;

			const order = new Order({
				user: user._id,
				totalAmount: req.query.totalPrice,
				date: today,
			});
			await order.save();
			// Store bought menuItems in Orders

			for (let i = 0; i < menuList.length; i++) {
				try {
					let orderMenuItem = new orderMenuItems({
						order: order._id,
						menuItem: menuList[i]._id,
					});
					await orderMenuItem.save();
				} catch (err) {
					console.log(err);
				}
			}
			res.send(true);
		} catch (err) {
			console.log(err);
		}
	},
};

module.exports = cashierController;