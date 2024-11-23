const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    
    this._pool = pool;
    this._idGenerator = idGenerator;

    this._verifyComment = this._verifyComment.bind(this);
    this.addComment = this.addComment.bind(this);
    this.isCommentAvailableInThread = this.isCommentAvailableInThread.bind(this);
    this.checkCommentOwnership = this.checkCommentOwnership.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }

  _verifyComment(comment) {
    if (typeof comment === 'undefined') {
      throw new InvariantError('Tidak dapat menambahkan komentar, karena properti yang dibutuhkan tidak ada');
    }
    if (typeof comment !== 'string') {
      throw new InvariantError('Tidak dapat menambahkan komentar, karena tipe data tidak sesuai');
    }
    if (comment.length === 0) {
      throw new InvariantError('Tidak dapat menambahkan komentar, komentar tidak boleh kosong');
    }
  }

  async addComment({ thread_id, content, owner, date }) {
    this._verifyComment(content);
    const id = `comment-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, thread_id, content, owner, false, date],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async isCommentAvailableInThread(commentId, threadId) {
    const query = {
      text: 'SELECT EXISTS(SELECT 1 FROM comments WHERE id = $1 AND thread_id = $2)',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);
    return result.rows[0].exists;
  }

  async checkCommentOwnership(commentId, userId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const owner = (await this._pool.query(query)).rows[0].owner;

    if (owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak melakukan perubahan pada komentar ini');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: `
        UPDATE comments
        SET is_delete = $1
        WHERE id = $2
      `,
      values: [true, commentId],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
