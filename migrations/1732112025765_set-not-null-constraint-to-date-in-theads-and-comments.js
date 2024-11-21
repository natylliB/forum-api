/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.alterColumn('threads', 'date', {
    notNull: true,
  });

  pgm.alterColumn('comments', 'date', {
    notNull: true,
  });
};

exports.down = pgm => {
  pgm.alterColumn('threads', 'date', {
    notNull: false,
  });

  pgm.alterColumn('comments', 'date', {
    notNull: false
  })
};
