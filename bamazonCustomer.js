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
    showTable();
});

//ShowTable function to display available products to purchase
var showTable = function () {
    connection.query("select * from products", function (err, res) {
        console.table(res);
        promptCustomer(res);
    })
}

//This function is to prompt the customer for Product name
var promptCustomer = function(res){
    inquirer.prompt({
        name: "choice",
        type: "input",
        message: "Which Item would you like to purchase? [Quit with Q]"
    }).then(function (answer) {
        //quit if choice is Q close the connection and exit the process
        if(answer.choice.toUpperCase()=== 'Q')
        {
            connection.end();
            process.exit();
        }

        var itemInList = false;
        //verify the choice against the available items to purchase
        for (var i = 0; i < res.length; i++) {
            if (res[i].product_name.toUpperCase() === answer.choice.toUpperCase() ) {
                var chosenItem = res[i];
                itemInList = true;
                console.log("chosen item id :", chosenItem);
                promptQuantity(chosenItem);
        
            }//If end
        }//for loop end

        //if item not in list
        if (itemInList === false){
            console.log("Not a valid selection! Re-enter the Product name !!");
            promptCustomer(res);
        }

    });
}

//This function is to prompt the customer for Product Quantity
var promptQuantity = function(chosenItem){
    inquirer.prompt({
        name: "quantity",
        type: "input",
        message: "Tell us the quantity you would like to purchase?",
        validate: function (value) {
            if (isNaN(value) == false)
                return true;
            else
                return false;
        }
    }).then(function (answer) {
        if (chosenItem.stock_quantity < parseInt(answer.quantity))
        {
            console.log("Sorry !! Insufficient Quantity!! Re-enter as per available stock!" );
            promptQuantity(chosenItem);
        }
        else {
            console.log('Update stock');
            chosenItem.stock_quantity = chosenItem.stock_quantity - answer.quantity
            updateStock(chosenItem,answer.quantity);
        }

    });
}

//update Stock function to update the table , Also update the product sales
var updateStock = function (chosenItem,purchaseQuantity) {
    connection.query("update products set ? where ?", [
        {
            stock_quantity: chosenItem.stock_quantity
        },
        {
            item_id: chosenItem.item_id
        }
    ], function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + "products updated!\n");
        
        connection.query("update products set product_Sales = product_Sales + " + 
                        (purchaseQuantity*chosenItem.price)+ " where ?", 
                        {
                            item_id: chosenItem.item_id
                        },
                        function (err, res) {
                            if (err) throw err;
                            console.log("Product successfully purchased!! Thank you for ur order!!");
                        })
        showTable();
    })
}