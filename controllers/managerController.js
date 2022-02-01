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
			res.send("Error page");
		}
	},

	getAddMenuItem: async (req, res) => {
		try {
			const ingredients = await Ingredients.find().exec();
			const uom = await Unit.find().exec();
			res.render("managerMenuAdd", { ingredient: ingredients, uom: uom });
		} catch (err) {
			res.send("Error page");
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
				price: price,
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
					res.send("Error page");
				}
			}
		} catch (err) {
			res.send("Error page");
		}
		res.status(200).send({ result: "redirect", url: "/manager/menuItems" });
	},

	addIngredientsMenu: async (req, res) => {
		let id = req.body.id;
		let oldMenuItemName = req.body.oldMenuItemName;
		let listIngredient = req.body.listIngredient;
		let listQuantity = req.body.listQuantity;
		let listUnit = req.body.listUnit;

		try {
			// Duplicate old menu Item so it can stay in the reports
			const oldMenuItem = await MenuItem.findById(id).exec();

			// duplicate menuItem
			const newMenuItem = new MenuItem({
				menuItemName: oldMenuItem.menuItemName,
				price: oldMenuItem.price,
				status: oldMenuItem.status,
			});

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
						ingredientName: oldMenuItemIngredients[i].ingredient.ingredientName,
					}).exec();
					let menuIngredient = new MenuItemIngredient({
						ingredient: ingredient._id,
						menutItem: newMenuItem._id,
						quantity: oldMenuItemIngredients[i].quantity,
						uom: oldMenuItemIngredients[i].uom,
					});
					await menuIngredient.save();
				} catch (err) {
					res.send("Error page");
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
					res.send("Error page");
				}
			}

			// change status of oldMenuItem
			const old = await MenuItem.findOneAndUpdate(
				{
					_id: id,
				},
				{
					status: "Old version",
				},
				{
					new: true,
				}
			).exec();
		} catch (err) {
			res.send("Error page");
		}

		res.status(200).send({ result: "redirect", url: "/manager/menuItems" });
	},

	editMenuItem: async (req, res) => {
		let id = req.body.id;
		let name = req.body.name;
		//name = name.charAt(0).toUpperCase() + name.slice(1);

		let price = req.body.price;
		let status = req.body.status;

		try {
			// Duplicate old menu Item so it can stay in the reports

			const oldMenuItem = await MenuItem.findById(id).exec();
			const newMenuItem = new MenuItem({
				menuItemName: name,
				price: price,
				status: status,
			});
			await newMenuItem.save();

			// edit new menu item
			const newMenu = await MenuItem.findOneAndUpdate(
				{ _id: newMenuItem._id },
				{
					$set: {
						menuItemName: name,
						status: status,
						price: price,
					},
				}
			).exec();

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
				const ingredient = await Ingredients.findOne({
					ingredientName: oldMenuItemIngredients[i].ingredient.ingredientName,
				}).exec();
				let menuIngredient = new MenuItemIngredient({
					ingredient: ingredient._id,
					menutItem: newMenuItem._id,
					quantity: oldMenuItemIngredients[i].quantity,
					uom: oldMenuItemIngredients[i].uom,
				});
				await menuIngredient.save();
			}

			// change status of oldMenuItem
			const old = await MenuItem.findOneAndUpdate(
				{
					_id: id,
				},
				{
					status: "Old Version",
				},
				{
					new: true,
				}
			).exec();
			res.status(200).send({ result: "redirect", url: "/manager/menuItems" });
		} catch (err) {
			res.send("Error page");
		}
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
			res.send("Error page");
		}
	},

	getAllOrderHistory: async (req, res) => {
		try {
			const orderList = await Order.find()
				.populate("user")
				.sort({ createdAt: -1 })
				.exec();

				let orders = [];
            const orderLength = orderList.length;
            for (let i = 0; i < orderLength; i++) {
            	let date = new Date(orderList[i].date);
                date.setHours(0, 0, 0, 0);

                let totalAmount = (Math.round(orderList[i].totalAmount * 100) / 100).toFixed(2);
                const sortedOrders = {
                	id: orderList[i]._id,
                	user: orderList[i].user,
                    date:
                        date.getMonth() +
                        1 +
                        "/" +
                        date.getDate() +
                        "/" +
                        date.getFullYear(),
                    totalAmount: totalAmount,
                };
                orders.push(sortedOrders);
            }

			res.render("managerOrdersHistory", { orders: orders });
		} catch (err) {
			res.send("Error page");
		}
	},

	 getOrderHistoryDates: async (req, res) => {
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
      const orderList = await Order.find()
				.populate("user")
				.sort({ createdAt: -1 })
				.exec();

				let orders = [];
            const orderLength = orderList.length;
            for (let i = 0; i < orderLength; i++) {
            	let date = new Date(orderList[i].date);
                date.setHours(0, 0, 0, 0);

                let totalAmount = (Math.round(orderList[i].totalAmount * 100) / 100).toFixed(2);
                if (!(startDate > date || date > endDate)) {
                const sortedOrders = {
                	id: orderList[i]._id,
                	user: orderList[i].user,
                    date:
                        date.getMonth() +
                        1 +
                        "/" +
                        date.getDate() +
                        "/" +
                        date.getFullYear(),
                    totalAmount: totalAmount,
                };
                orders.push(sortedOrders);
            }
      }
      // Send back to the JS
      // This is the returned object
      res.send(orders);
    } catch (err) {
      res.send("Error page");
    }
  },

	getOrderDetailed: async (req, res) => {
		//Order to get the number to be shown in hbs
		const id = req.params.id;
		try {
			const orderMenuItemList = await OrderMenuItem.find({order: id})
			.populate('menuItem')
			.exec();

			let orderMenuItems = [];
            const orderMenuItemLength = orderMenuItemList.length;
            for (let i = 0; i < orderMenuItemLength; i++) {
            	let date = new Date(orderMenuItemList[i].date);
                date.setHours(0, 0, 0, 0);

                let price = (Math.round(orderMenuItemList[i].menuItem.price * 100) / 100).toFixed(2);
                const sortedOrderMenuItems = {
                	menuItem: orderMenuItemList[i].menuItem,
                	price: price
                };
                orderMenuItems.push(sortedOrderMenuItems);
            }

			res.render("managerOrderDetailed", { orderMenuItems: orderMenuItems });

		} catch (err) {
      res.send("Error page");
    }
		
		
	},
};

module.exports = managerController;