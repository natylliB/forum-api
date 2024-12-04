const CommentLikeRepository = require('../../Domains/likes/CommentLikeRepository');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;

    this.addCommentLike = this.addCommentLike.bind(this);
    this.deleteCommentLike = this.deleteCommentLike.bind(this);
    this.isCommentLiked = this.isCommentLiked.bind(this);
  }

  async addCommentLike(commentId, userId) {
    const id = `comment_like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3)',
      values: [ id, commentId, userId ],
    };

    await this._pool.query(query);
  }

  async deleteCommentLike(commentId, userId) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [ commentId, userId ],
    };

    await this._pool.query(query);
  }

  async isCommentLiked(commentId, userId) {
    const query = {
      text: 'SELECT EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = $1 and owner = $2)',
      values: [ commentId, userId ],
    };

    const result = await this._pool.query(query);

    return result.rows[0].exists;
  }
}

module.exports = CommentLikeRepositoryPostgres;
