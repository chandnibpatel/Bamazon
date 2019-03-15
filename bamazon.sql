create database bamazon;
use bamazon;

create table products(
item_id int not null AUTO_INCREMENT,
product_name varchar(50) not null ,
department_name varchar(50) not null,
price decimal(10,4) not null,
stock_quantity int(10) not null,
primary key (item_id)
)

select * from products