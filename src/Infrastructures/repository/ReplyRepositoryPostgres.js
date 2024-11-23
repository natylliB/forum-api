const InvariantError = require('../../Commons/exceptions/InvariantError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;

    this._verifiyReply = this._verifiyReply.bind(this);
    this.addReply = this.addReply.bind(this);
    this.isReplyAvailableInComment = this.isReplyAvailableInComment.bind(this);
    this.isReplyOwnerValid = this.isReplyOwnerValid.bind(this);
  }

  _verifiyReply(reply) {
    if (reply.length === 0) {
      throw new InvariantError('Balasan komentar tidak boleh kosong');
    }
  }

  async addReply({ comment_id, content, date, owner }){
    this._verifiyReply(content);

    const id = `reply-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) returning id, content, owner',
      values: [ id, comment_id, content, date, owner ],
    };

    const result = await this._pool.query(query);
    const addedReply = new AddedReply({ ...result.rows[0] });

    return addedReply;
  }

  async isReplyAvailableInComment(id, commentId) {
    const query = {
      text: 'SELECT EXISTS(SELECT 1 FROM replies WHERE id = $1 AND comment_id = $2)',
      values: [id, commentId],
    };

    const result = await this._pool.query(query);
    return result.rows[0].exists;
  }

  async isReplyOwnerValid(id, userId) {
    const query = {
      text: 'SELECT EXISTS(SELECT 1 FROM replies WHERE id = $1 AND owner = $2)',
      values: [id, userId],
    };

    const result = await this._pool.query(query);
    return result.rows[0].exists;
  }

  async deleteReply(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = $1 WHERE id = $2',
      values: [true, id],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
