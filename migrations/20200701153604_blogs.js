
exports.up = function(knex, Promise) {
    return knex.schema.createTable('blogs', function(t) {
        t.increments('id').unsigned().primary();
        t.string('title').notNull();
        t.text('content').notNull();
        t.string('author').notNull();
        t.string('image').notNull();
        t.string('thumbnail').notNull();
        t.dateTime('createdAt').notNull().defaultTo(knex.fn.now());

    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('blogs');
};
