const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;

    this.addThread = this.addThread.bind(this);
    this.checkThreadAvailability = this.checkThreadAvailability.bind(this);
    this.getThreadDetail = this.getThreadDetail.bind(this);
  }

  async addThread(thread) {
    const { title, body, owner } = thread;
    const id = `thread-${this._idGenerator()}`
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner]
    }

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async checkThreadAvailability(id) {
    const query = {
      text: 'SELECT EXISTS(SELECT 1 FROM threads where id = $1)',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].exists) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }

  async getThreadDetail(threadId) {
    const query = {
      text: `
        SELECT
          t.id,
          t.title,
          t.body,
          tu.username,
          t.date
        FROM
          threads t
        LEFT JOIN
          users tu ON t.owner = tu.id
        WHERE 
          t.id = $1
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;