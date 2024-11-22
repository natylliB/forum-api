/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
  async addReply({
    id = 'reply-123',
    comment_id = 'comment-123',
    content = 'A critical reply',
    date = new Date().toISOString(),
    owner = 'user-123',
    is_delete = false,
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING date',
      values: [id, comment_id, content, date, owner, is_delete],
    };

    const result = await pool.query(query);

    return result.rows[0].date.toISOString();
  },
  async deleteReply(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = $1 WHERE id = $2',
      values: [true, id],
    };

    await pool.query(query);
  },
  async getReplyTimestamp(id) {
    const query = {
      text: `
        SELECT
          TO_CHAR(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS date
        FROM
          replies
        WHERE
          id = $1
      `,
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows[0].date;
  },
  async getAll() {
    const result = await pool.query('SELECT * FROM replies');
    return result.rows;
  },
  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = RepliesTableTestHelper;