up:
	knex migrate:latest

down:
	knex migrate:rollback

create:
	knex migrate:make $(n)

com:
	ls $(a)
