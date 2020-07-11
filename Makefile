up:
	knex migrate:latest

down:
	knex migrate:rollback

create:
	knex migrate:make $(n)

cur:
	knex migrate:currentVersion

com:
	ls $(a)
