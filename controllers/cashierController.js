const MenuItemIngredient = require("../models/menuItemIngredientsModel.js");
const Ingredients = require("../models/IngredientModel.js");
const Unit = require("../models/UnitModel.js");
const MenuItem = require("../models/menuItemModel.js");
const Conversion = require("../models/ConversionModel.js");
const Order = require("../models/OrderModel.js");
const orderMenuItems = require("../models/orderMenuItemsModel.js");
const User = require("../models/UserModel.js");
const Movement = require("../models/MovementModel.js");

const cashierController = {
	getAllMenuItems: async (req, res) => {
		try {
			const menu = await MenuItem.find({ status: "Active" }).exec();
			res.render("cashierOrders", { menuItem: menu });
		} catch (err) {
			res.send("Error page");
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
				converted = menuItemIngredient.quantity;
				subtractedValue =
					ingredient.totalQuantity - menuItemIngredient.quantity;
			} else if (menuItemIngredient.uom.abbrev == conversion.unitB) {
				converted = menuItemIngredient.quantity / conversion.unitBMeasure;
				subtractedValue = ingredient.totalQuantity - converted;
			} else if (menuItemIngredient.uom.abbrev == conversion.unitA) {
				converted = menuItemIngredient.quantity * conversion.unitBMeasure;
				subtractedValue = ingredient.totalQuantity - converted;
			}
			let subtractedQuantity = Math.round(subtractedValue * 100) / 100;

			const convertedValue = await Ingredients.findOneAndUpdate(
				{
					ingredientName: menuItemIngredient.ingredient.ingredientName,
				},
				{
					totalQuantity: subtractedQuantity,
				},
				{
					new: true,
				}
			).exec();

			// List to movement

			let soldQuantityNumber = converted;
			let ingredientMovementUOM = menuItemIngredient.uom.abbrev;
			let quantity = soldQuantityNumber + " " + ingredientMovementUOM;
			let movement = new Movement({
				ingredient: ingredient._id,
				beforeTotalQuantity: ingredient.totalQuantity,
				action: "Sold",
				quantity: quantity,
				afterTotalQuantity: convertedValue.totalQuantity,
			});
			await movement.save();

			return convertedValue;
			//findOneAndUpdate the ingredient
		} catch (err) {
			res.send("Error page");
		}
	},

	sell: async (req, res) => {
		// load cart ARRAY
		const cart = req.body.cart;
		const price = req.body.totalPrice;
		try {
			let list = [];
			let menuList = [];

			const cartLength = cart.length;
			for (let i = 0; i < cartLength; i++) {
				const menuItem = await MenuItem.findOne({
					menuItemName: cart[i],
					status: "Active",
				}).exec();
				menuList.push(menuItem);

				// get menuItemIngredients to be subtracted
				const menuItemIngredient = await MenuItemIngredient.find({
					menutItem: menuItem._id,
				})
					.populate("ingredient", "ingredientName")
					.populate("uom", "abbrev")
					.exec();
				const menuItemIngredientLength = menuItemIngredient.length;
				for (let j = 0; j < menuItemIngredientLength; j++) {
					let converted = await cashierController.convert(
						menuItemIngredient[j]
					);
				}
			}
			// Make order history

			// Edit email
			const user = await User.findOne({
				email: "cashier@gmail.com",
			}).exec();

			let today = new Date();
			let date = today.toLocaleDateString();
			let time = today.toLocaleTimeString();
			/*today = date + " - " + time;*/

			const order = new Order({
				user: user._id,
				totalAmount: price,
				date: today,
			});
			await order.save();

			// Store bought menuItems in Orders
			const menuListLength = menuList.length;
			for (let i = 0; i < menuListLength; i++) {
				try {
					let orderMenuItem = new orderMenuItems({
						order: order._id,
						menuItem: menuList[i]._id,
					});
					await orderMenuItem.save();
				} catch (err) {
					res.send("Error page");
				}
			}
			res.send(true);
		} catch (err) {
			res.send("Error page");
		}
	},

	async createConversion(unitAInput, unitBInput, unitBMeasureInput) {
		const conversion = new Conversion({
			unitA: unitAInput,
			unitB: unitBInput,
			unitBMeasure: unitBMeasureInput,
		});
		const result = await conversion.save();
	},

	addConversion: async (req, res) => {
		//cashierController.createConversion('tbsp', 'tsps', 3 );
		const conversion = await Conversion.find().exec();
		res.send(conversion);
	},
};

module.exports = cashierController;