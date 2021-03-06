exports.up = function(knex, Promise) {
    return knex.schema.createTable('images', function(t) {
        t.increments('id').unsigned().primary();
        t.string('path').notNull();
        t.dateTime('createdAt').notNull().defaultTo(knex.fn.now());
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('images');
};
