create table users(
	uuid uuid, 
	firstname varchar(30), 
	lastname varchar(30), 
	email varchar(30), 
	password varchar(60), 
	profstatus varchar(30), 
	affiliation varchar(30), 
	country char(3), 
	age smallint, 
	gender char(1), 
	expertise varchar(11)[], 
	articles uuid[], 
	webinars uuid[], 
	projects uuid[]
);