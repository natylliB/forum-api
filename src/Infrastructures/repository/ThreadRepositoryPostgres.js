const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;

    this.addThread = this.addThread.bind(this);
    this.isThreadAvailable = this.isThreadAvailable.bind(this);
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

  async isThreadAvailable(id) {
    const query = {
      text: 'SELECT EXISTS(SELECT 1 FROM threads where id = $1)',
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows[0].exists;
  }

  async getThreadDetail(threadId) {
    const query = {
      text: `
        SELECT
          t.id,
          t.title,
          t.body,
          TO_CHAR(t.date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS date,
          tu.username,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', c.id,
                'username', cu.username,
                'date', TO_CHAR(c.date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                'content', CASE
                  WHEN c.is_delete THEN '**komentar telah dihapus**'
                  ELSE c.content
                END
              ) ORDER BY c.date
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'
          ) AS comments
        FROM
          threads t
        LEFT JOIN
          users tu ON t.owner = tu.id
        LEFT JOIN
          comments c ON t.id = c.thread_id
        LEFT JOIN
          users cu ON c.owner = cu.id
        WHERE
          t.id = $1
        GROUP BY
          t.id, tu.username
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;