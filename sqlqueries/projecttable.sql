create table projects(
	uuid uuid,
	title varchar(100),
	authors uuid[],
	description varchar(256),
);