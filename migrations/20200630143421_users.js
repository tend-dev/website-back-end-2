
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(t) {
        t.increments('id').unsigned().primary();
        t.string('email').notNull();
        t.string('pass').notNull();
        t.string('name');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users');
};
