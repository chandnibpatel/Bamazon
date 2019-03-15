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

var viewProductSale = "View Product Sales by Department";
var createDept = "Create New Department";
var quit = "Quit"

//BONUS Task
var summary = "Summary of Total Sales"

// prompt menu function
var promptMenu = function(){
    inquirer.prompt({
        name: "choice",
        type: "list",
        choices: [viewProductSale, createDept,summary,quit],
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
            
            case createDept:
                createDepartment();
                break;

            //BONUS Part
            case summary:
                viewSummary();
                break;

            default:
            {
                console.log("choose a valid selection");
                connection.end();
            }
                
        }
    });
}

//view product sale and total profit by department
var viewSale = function(){
    connection.query("select d.*,sum(p.product_sales) product_sales, (sum(p.product_sales)-over_head_costs) total_profit " +
        "from products p join departments d on p.department_name= d.department_name " +
        "group by  department_name", function (err, res) {
            if (err) throw err;
            console.table(res);
            promptMenu();
    })

}

//prompt a supervisor to create department
var createDepartment = function(){
    inquirer.prompt([{
        name: "deptName",
        type: "input",
        message: "Enter the department name to add:"
        
     },
     {
        name: "overheadCost",
        type: "input",
        message: "Enter the over head costs :",
        validate: function (value) {
            if (isNaN(value) == false)
                return true;
            else
                return false;
        }
     }]
     ).then(function (answer) {
        console.log(answer.deptName);
        addDepartment(answer.deptName,answer.overheadCost);
    });
}

//function to add department
var addDepartment = function(deptName,overheadCost){
    connection.query("insert into departments set ?", {
        department_name:deptName,
        over_head_costs: overheadCost
    },function(err,results){
        if (err) throw err;
        console.log(results.affectedRows + "department added!\n");
        promptMenu();
    })
}

//BONUS part - View Summary about Store's Total Sales accross all the departments and highest selling department
var viewSummary=function(){
    connection.query("select sum(product_sales) total_sales from products p",
    function(err,results){
        if (err) throw err;
        console.log("****************************\n");
        console.log("    Total Store Selling     \n");
        console.log("****************************\n");
        console.table(results);
       
    })
    connection.query("select  d.*,sum(p.product_sales)  product_sales from products p join departments d on p.department_name= d.department_name "+
                "group by  d.department_name order by product_sales desc limit 1;",
        function(err,results){
            if (err) throw err;
            console.log("************************************************\n");
            console.log("   Highest Selling Departement is shown below   \n");
            console.log("************************************************\n");
            console.table(results);
            promptMenu();
        })
}