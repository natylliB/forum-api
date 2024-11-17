/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.addColumn('threads', {
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('threads', 'fk_threads.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = pgm => {
  pgm.dropConstraint('threads', 'fk_threads.owner_users.id');
  pgm.dropColumn('threads', 'owner');
};
