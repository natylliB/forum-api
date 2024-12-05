/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },

  async addCommentLike({
    id = 'comment_like-123',
    comment_id = 'comment-123',
    owner = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3)',
      values: [ id, comment_id, owner ],
    };

    await pool.query(query);
  },

  async findCommentLikeById(id) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getAll() {
    const result = await pool.query('SELECT * FROM comment_likes');
    return result.rows;
  },
}

module.exports = CommentLikesTableTestHelper;