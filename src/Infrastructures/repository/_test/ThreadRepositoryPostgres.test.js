const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const Thread = require('../../../Domains/threads/entities/Thread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'billy' });
  })

  afterAll(async() => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async() => {
    await ThreadsTableTestHelper.cleanTable();
  });


  describe('addThread function', () => {
    it('should persist thread and return addedThread correctly', async () => {
      // Arrange
      const thread = new Thread({
        title: 'Some Title',
        body: 'Some Content',
        owner: 'user-123',
        date: new Date().toISOString(),
      });

      const fakeIdGenerator = () => 123;
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(thread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Some Title',
        owner: 'user-123',
      }));
    });
  });

  describe('isThreadAvailable function', () => {
    it('should resolve false if thread is not available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const isThreadAvailable = await threadRepositoryPostgres.isThreadAvailable('thread-456');

      expect(isThreadAvailable).toEqual(false);
    });
    it('should resolve true if thread is available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const isThreadAvailable = await threadRepositoryPostgres.isThreadAvailable('thread-123');

      expect(isThreadAvailable).toEqual(true);
    });
  });

  describe('getThreadDetail function', () => {
    it('should get the thread detail correctly', async () => {
      // Arrange
      /** create another user */
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'jack' });
      
      //** create a thread */
      const billyThreadTimestamp = await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123' 
      }); // other default values. title: Some Interesting Topic, body: Some Engaging Content
      
      /** comment on thread-123 by jack (user-124) */
      const jackCommentTimeStamp = await CommentTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        content: 'Interesting insights',
        owner: 'user-124',
      });

      /** comment on thread-123 by billy (user-123) */
      const billyCommentTimestamp = await CommentTableTestHelper.addComment({
        id: 'comment-124',
        thread_id: 'thread-123',
        content: 'Something sensitive',
        owner: 'user-123',
      });

      /** delete comment-124 */
      await CommentTableTestHelper.deleteComment('comment-124');

      /** reply to comment-123 by billy (user-123) */
      const billyReplyTimestamp  = await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'Thank You!',
        owner: 'user-123',
      });

      /** reply to comment 123 by jack (user-124) */
      const jackReplyTimestamp = await RepliesTableTestHelper.addReply({
        id: 'reply-124',
        comment_id: 'comment-123',
        content: 'Some crude joke',
        owner: 'user-124',
      })

      /** jack (user-124) delete his own reply (reply-124)  */
      await RepliesTableTestHelper.deleteReply('reply-124');

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadDetail('thread-123');

      // Assert
      expect(thread).toEqual(expect.objectContaining({
        id: 'thread-123',
        title: 'Some Interesting Topic',
        body: 'Some Engaging Content',
        date: billyThreadTimestamp,
        username: 'billy',
        comments: [
          {
            id: 'comment-123',
            username: 'jack',
            date: jackCommentTimeStamp,
            replies: [
              {
                id: 'reply-123',
                content: 'Thank You!',
                date: billyReplyTimestamp,
                username: 'billy',
              },
              {
                id: 'reply-124',
                content: '**balasan telah dihapus**',
                date: jackReplyTimestamp,
                username: 'jack'
              }
            ],
            content: 'Interesting insights',
          },
          {
            id: 'comment-124',
            username: 'billy',
            date: billyCommentTimestamp,
            replies: [],
            content: '**komentar telah dihapus**',
          },
        ],
      }));
    });
  });
});