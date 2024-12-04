exports.up = pgm => {
  pgm.addColumn('comments', {
    date: {
      type: 'TIMESTAMPTZ',
      default: pgm.func('NOW()')
    }
  });

  pgm.sql(`UPDATE comments SET date = NOW() WHERE date IS NULL;`);
};

exports.down = pgm => {
  pgm.dropColumn('comments', 'date');
};
