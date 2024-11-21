/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
  async findThreadsById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },
  async getAll() {
    const result = await pool.query('SELECT * FROM threads');
    return result.rows;
  },
  async addThread({ 
    id = 'thread-123',
    title = 'Some Interesting Topic',
    body = 'Some Engaging Content',
    owner = 'user-123',
    date = new Date().toISOString(),
  }) {
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, owner, date],
    };

    await pool.query(query);
  }
}

module.exports = ThreadsTableTestHelper;
