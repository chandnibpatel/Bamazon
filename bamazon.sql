-- create database bamazon;
use bamazon;

/*create table products(
item_id int not null AUTO_INCREMENT,
product_name varchar(50) not null ,
department_name varchar(50) not null,
price decimal(10,4) not null,
stock_quantity int(10) not null,
primary key (item_id)
)*/

/*create table departments(
department_id int not null AUTO_INCREMENT,
department_name varchar(50) not null,
over_head_costs int(10) not null,
primary key (department_id)
)*/

select * from departments;
select * from products;
alter table products 
add product_Sales dec(10,4) default 0;

/* Join query: to get product sales by department  */
select d.*,sum(p.product_sales) product_sales, (sum(p.product_sales)-over_head_costs) total_profit from products p join departments d on p.department_name= d.department_name
group by  department_name;

/* Highest Selling Dept*/
select  d.*,sum(p.product_sales)  product_sales from products p join departments d on p.department_name= d.department_name
group by  d.department_name order by product_sales desc limit 1;

/* Total Store selling*/
select sum(product_sales) total_sales from products p;
