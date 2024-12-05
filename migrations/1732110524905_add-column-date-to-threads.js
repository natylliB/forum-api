exports.up = pgm => {
  pgm.addColumn('threads', {
    date: {
      type: 'TIMESTAMPTZ',
      default: pgm.func('NOW()')
    }
  });

  pgm.sql(`UPDATE threads SET date = NOW() WHERE date IS NULL;`);
};

exports.down = pgm => {
  pgm.dropColumn('threads', 'date');
};
