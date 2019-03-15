var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Test123",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    promptMenu();
});

var viewProductSale = "View Products for Sale";
var viewLowInvtry = "View Low Inventory";
var addToInvtry = "Add to Inventory";
var addNewProduct = "Add New Product";
var quit = "Quit"

//This function is to prompt the customer for Product name
var promptMenu = function(){
    inquirer.prompt({
        name: "choice",
        type: "list",
        choices: [viewProductSale, viewLowInvtry, addToInvtry,addNewProduct,quit],
        message: "Which option would you like to select?"
    }).then(function (answer) {
      
        switch (answer.choice) {

            case quit:
                connection.end();
                process.exit();
                break;

            case viewProductSale:
                viewSale();
                break;
            
            case viewLowInvtry:
                viewInvtry();
                break;
                  
            case addToInvtry:
                addInvtry();
                break;
   
            case addNewProduct:
                addProduct();
                break;

            default:
            {
                console.log("choose a valid selection");
                connection.end();
            }
                
        }
    });
}

//this function to view the product table
var viewSale = function(){
    connection.query("select item_id, product_name,price,stock_quantity  from products", function (err, res) {
    console.table(res);
    promptMenu();
    })
}

//view inventory function to see the products with low stocks (i.e. stocks < 15)
var viewInvtry = function(){
    connection.query("select item_id, product_name,price,stock_quantity from products where stock_quantity < ?",15,function (err, res) {
    console.table(res);
    promptMenu();
    });
}

//add inventory function
var addInvtry = function(){
    promptAddInv();
}

//function to add new product ! prompt a manager for product name, deptname, price and stock
var addProduct = function(){
    inquirer.prompt([{
        name: "productName",
        type: "input",
        message: "Enter the new product name:"
        
     },
     {
        name: "deptName",
        type: "input",
        message: "Enter the department name:"
        
     },
     {
        name: "price",
        type: "input",
        message: "Enter the new product price :",
        validate: function (value) {
            if (isNaN(value) == false)
                return true;
            else
                return false;
        }
        
     },
     {
        name: "stock",
        type: "input",
        message: "Enter the new product stock :",
        validate: function (value) {
            if (isNaN(value) == false)
                return true;
            else
                return false;
        }
        
     }]
     ).then(function (answer) {
        insertProduct(answer.productName,answer.deptName,answer.price, answer.stock);
    });
    
}

//prompt manager for add inventory
var  promptAddInv = function(){
    connection.query("select item_id, product_name,price,stock_quantity  from products", 
    function (err, res) {
        console.table(res);
        inquirer.prompt({
            name: "item",
            type: "input",
            message: "Enter the product name for which you would like to add stock !! Or [Quit with Q]"
            
         }).then(function (answer) {
            if(answer.item.toUpperCase()=== 'Q')
            {
                connection.end();
                process.exit();
            }
            var itemInList = false;
            //verify the choice against the available items to purchase
            var availableStock = 0 ;
            var itemid = 0;
            for (var i = 0; i < res.length; i++) {
               
                if (res[i].product_name.toUpperCase() === answer.item.toUpperCase() ) 
                {
                    itemInList = true;
                    availableStock = res[i].stock_quantity;
                    itemid = res[i].item_id;            
                }//If end
            }//for loop end
           
           
            //if item not in list
            if (itemInList === false){
                console.log("Not a valid selection! Re-enter the Product name !!");
                
               promptAddInv();
            }
            else{
                promptStock(itemid,availableStock);
            }
        });
    });
}

//this function is to prompt a manager for adding the stock
var promptStock = function(itemid,availableStock){
    inquirer.prompt({
        name: "quantity",
        type: "input",
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        },
        message: "Enter quantity you would like to add"  
    }).then(function (answer) {
        var totalStock = parseInt(answer.quantity) + parseInt(availableStock);
        updateStock(itemid, totalStock);
    });
    
}
//update Stock function to update the table
var updateStock = function (itemid, totalStock) {
    connection.query("update products set ? where ?", [
        {
            stock_quantity: totalStock
        },
        {
            item_id: itemid
        }
    ], function (err, res) {
        if (err) throw err;
        console.log("\n"+ res.affectedRows + "products updated!\n");
        console.log("Stock successfully added for  itemID " + itemid + "!!");
        viewSale();
        promptMenu();
    })
}

//insert Product function to add a new product
var insertProduct = function(productName,deptName,price, stock){
    connection.query("insert into products set ?", {
        product_name:productName,
        department_name:deptName,
        price: price,
        stock_quantity: stock
    },function(err,results){
        if (err) throw err;
        console.log(results.affectedRows + "products added!\n");
        viewSale();
    })
};