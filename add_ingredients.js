const db = require('./models/db.js');

// const url = 'mongodb://localhost:27017/itisdev-instock';
const url = 'mongodb+srv://draco:nAG5fKmyDbDqsUS5@itisdev-in-stock.mjmm5.mongodb.net/inventory?retryWrites=true&w=majority';

const Ingredient = require('./models/IngredientModel');
const Unit = require('./models/UnitModel');

db.connect(url);


async function createIngredient(ingredientName, totalQuantity, unitAbbrev, reorderPoint) {
    console.log('Adding ingredient ' + ingredientName + '...');

    const unit = await Unit.findOne({abbrev: unitAbbrev}).exec();

    const ingredient = new Ingredient({
        ingredientName: ingredientName,
        totalQuantity: totalQuantity,
        uom: unit._id,
        reorderPoint: reorderPoint
    })

    const result = await ingredient.save();
    console.log(result);
}

async function listIngredients() {
    const ingredients = await Ingredient
        .find()
        .populate('uom')
        .select('ingredientName');
    console.log("Listing all ingredients...");
    console.log(ingredients);
}

createIngredient('Coke', 5000, 'ml', 500);
createIngredient('Milk', 8000, 'ml', 400);
createIngredient('Meatball' , 800, 'g', 200);

listIngredients();