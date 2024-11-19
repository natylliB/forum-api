const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const UserTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    // create user
    await UserTableTestHelper.addUser({ id: 'user-123', username: 'billy' });
    // create thread
    await ThreadTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UserTableTestHelper.cleanTable();
  
    await pool.end();
  });
  
  describe('addComment function', () => {
    it('should persist add comment correctly and return added comment', async () => {
      // Arrange
      const payload = new NewComment({
        thread_id: 'thread-123',
        content: 'Some Top Rated Comment',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => 123;

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(payload);
      
      // Assert
      const comments = await CommentTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'Some Top Rated Comment',
        owner: 'user-123',
      }));
    });
  });
});
