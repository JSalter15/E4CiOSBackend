create table projects(
	ID uuid primary key,
	owner uuid,
	title varchar(200),
	contributors uuid[],
	description varchar(256)
);