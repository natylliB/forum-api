/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentTableTestHelper = {
  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
  async getAll() {
    const result = await pool.query('SELECT * FROM comments');
    return result.rows;
  },
  async addComment({ 
    id = 'comment-123', 
    thread_id = 'thread-123', 
    content = 'Some Comment', 
    owner = 'user-123',
    is_delete = false,
    date = new Date().toISOString(),
   }) {
      const query = {
        text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) returning date',
        values: [id, thread_id, content, owner, is_delete, date],
      };

      const result = await pool.query(query);
      return result.rows[0].date;
  },
  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = $1 WHERE id = $2',
      values: [true, commentId],
    };

    await pool.query(query);
  },
  async getCommentTimestamp(id) {
    const query = {
      text: `
        SELECT
          TO_CHAR(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS date
        FROM
          comments
        WHERE
          id = $1
      `,
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows[0].date;
  },
}

module.exports = CommentTableTestHelper;
