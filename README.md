# Appdate

A transaction processing system that would assist the staff of Cafe Agapita with their work in the organization. The application is focused on helping the cafe manage the inventory efficiently, assisting the purchasing department in reordering the ingredients needed beforehand, and aiding the front office personnel with the constant updating of the menu. 

The project has 3 modules, namely, Menu Item Transactions, Inventory Management, and Reordering Modules.

The menu item transactions focus on the order transactions that are connected to the menu and inventory management modules managed by the front office user. 

* Adding of menu items in the menu tab 

* Adding the ingredients required for that particular menu item

  * When the menu item is selected, the list of quantified ingredients to be used in that item is displayed. 

* Edit the details of a specific menu item if the recipe is changed. 

* Add customer orders by picking the specific menu item and its quantity. 

*An order will be generated in the list, and once the order is clicked, the ordered item will automatically appear in the orders history tab. 

* The ingredients of the orders that are placed in this transaction will automatically be deducted from the inventory so as to update the actual quantity on hand.

Inventory Management focuses on the inventory manager's keeping track of the inventory. 

* adding ingredients needed for the menu items, viewing an ingredient’s information such as the quantity on hand, reorder point, economic order point, expiration date, and its priority status. 

* Shrinkage focuses on an ingredient’s specific reason for shrinkage. 

* Once the inventory user has inputted an ingredient’s quantity and reason for shrinkage, the user can report it and it will automatically deduct that ingredient’s quantity in the inventory tab. 

* The movement feature displays all the movements a specific ingredient has been through. 

* The purchase order is where  the inventory manager can view all the purchase orders made by the purchasing manager. 

* This is connected to the receiving orders feature, which shows a purchase order’s number of ordered ingredients. 

* When the new supplies arrive from the supplier, the inventory user can simply input the number of received ingredients and it will automatically display their status as well as their actual received delivery date.

The reordering module focuses on the reordering process that is connected to the inventory management module, which is managed by the purchasing manager. The main features of this module are processing and ordering the specific products that reached the reorder point in the inventory management module, with the additional option of adding a new order that was not automatically added when they needed to stock supplies in the near future for external reasons.

  * The purchasing manager can set the details, such as the price and supplier, for each product that will be used in the purchase order.

  * Based on the reordered products, a purchase order will be generated, and the system will calculate the costs, which will then be stored in the system to be tracked.

  * The purchasing manager can view a list of suppliers and enter information about them, such as their name, address, and contact information.

The system has an authorization part where the user must first sign-up and input their designated role, where the system has three options available for the role. 
* The roles are front office manager, cashier, inventory manager, and purchasing manager.
* The login feature requests the user’s info, such as their email and password, and when they input the right details, they can use the system. 

# What We Learned

* Conversion of units in JavaScript
* Integration of MongoDB database
* jQuery
 * AJAX GET and POST request
* Bootstrap
  * Modals 
* Node JS as backend framework

