const Unit = require("../models/UnitModel.js");
const Conversion = require("../models/ConversionModel.js");

const uomController = {
	addUOM: async (req, res) => {
		const fullName = req.body.uom;
		try {
			const uom = await Unit.findOne({ fullName: fullName }).exec();
			if (uom) res.send("Conversion already exists!");
			else {
				const uom = new Unit({
					abbrev: req.body.abbrev,
					fullName: fullName,
				});

				try {
					await uom.save();
					res.redirect("back");
				} catch (err) {
					console.log(err);
				}
			}
		} catch (err) {
			console.log(err);
		}
	},

	getAddUOMManager: (req, res) => {
		res.render("managerUom");
	},
	getAddUOMPurchasing: (req, res) => {
		res.render("purchasingUom");
	},
	getAddUOMInventory: (req, res) => {
		res.render("inventoryUom");
	},

	

	getConversion: async (req, res) => {
		try {
			const role = req.session.role;
			const uom = await Unit.find().exec();

		if (role == "purchasing")
			res.render("purchasingConversion", {uom: uom});
		else if (role == "sales manager", {uom: uom})
			res.render("managerConversion", {uom: uom});
		else if (role == "inventory")
			res.render("inventoryConversion", {uom: uom});
		} catch(err) {
			console.log(err);
		}
	
	},

	addConversion: async (req, res) => {
		const unitA = req.body.unitA;
		const unitB = req.body.unitB;
		const unitBNum = req.body.unitBNum;


		const conversion = new Conversion({
			unitA: unitA,
			unitB: unitB,
			unitAMeasure: 1,
			unitBMeasure: unitBNum,
		});

		try {
			await conversion.save();
			res.redirect('back');
		} catch (err) {
			console.log(err);
		}
	},

};

module.exports = uomController;