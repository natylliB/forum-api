const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;

    this.addReply = this.addReply.bind(this);
  }

  async addReply({ comment_id, content, date, owner }){
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) returning id, content, owner',
      values: [ id, comment_id, content, date, owner ],
    };

    const result = await this._pool.query(query);
    const addedReply = new AddedReply({ ...result.rows[0] });

    return addedReply;
  }
}

module.exports = ReplyRepositoryPostgres;
