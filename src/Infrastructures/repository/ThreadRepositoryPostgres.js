const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;

    this.addThread = this.addThread.bind(this);
    this.isThreadAvailable = this.checkThreadAvailability.bind(this);
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
        WITH RepliesCTE AS (
          SELECT
            r.comment_id,
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', r.id,
                'content', CASE
                  WHEN r.is_delete THEN '**balasan telah dihapus**'
                  ELSE r.content
                END,
                'date', TO_CHAR(r.date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                'username', ru.username
              ) ORDER BY r.date
            ) AS replies
          FROM
            replies r
          LEFT JOIN
            users ru ON r.owner = ru.id
          GROUP BY
            r.comment_id
        ),
        CommentsCTE AS (
          SELECT
            c.thread_id,
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', c.id,
                'username', cu.username,
                'date', TO_CHAR(c.date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                'replies', COALESCE(rc.replies, '[]'),
                'content', CASE
                  WHEN c.is_delete THEN '**komentar telah dihapus**'
                  ELSE c.content
                END
              ) ORDER BY c.date
            ) AS comments
          FROM
            comments c
          LEFT JOIN
            users cu ON c.owner = cu.id
          LEFT JOIN
            RepliesCTE rc ON c.id = rc.comment_id
          GROUP BY
            c.thread_id
        )
        SELECT
          t.id,
          t.title,
          t.body,
          TO_CHAR(t.date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS date,
          tu.username,
          COALESCE(cc.comments, '[]') AS comments
        FROM
          threads t
        LEFT JOIN
          users tu ON t.owner = tu.id
        LEFT JOIN
          CommentsCTE cc ON t.id = cc.thread_id
        WHERE
          t.id = $1;
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;