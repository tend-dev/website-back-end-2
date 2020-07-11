exports.up = function(knex, Promise) {
    return knex.schema.createTable('blog-images', function(t) {
        t.increments('id').unsigned().primary();
        t.string('name').notNull();
        t.integer('blogId').unsigned();
        t.string('index');
        t.dateTime('createdAt').notNull().defaultTo(knex.fn.now());
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('blog-images');
};
