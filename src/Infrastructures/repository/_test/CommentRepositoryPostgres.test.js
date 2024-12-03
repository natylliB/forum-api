const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const UserTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

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
        date: new Date().toISOString(),
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

  describe('checkCommentAvailabilityInThread function', () => {
    it('should throw NotFoundError when comment is not in the given thread', async () => {
      // Arrange
      const payload = new NewComment({
        thread_id: 'thread-123',
        content: 'Some Comment',
        owner: 'user-123',
        date: new Date().toISOString(),
      });
      const fakeIdGenerator = () => 123;
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /** Add comment into the thread */
      await commentRepositoryPostgres.addComment(payload);

      // Action & Assert 
      /** the only comment available in thread-123 right now is comment-123 */
      await expect(
        commentRepositoryPostgres.checkCommentAvailabilityInThread('comment-456', 'thread-123')
      ).rejects.toThrowError(
        new NotFoundError('Komentar tidak ditemukan')
      );
    });
    it('should resolve when comment is in the given thread', async () => {
      // Arrange
      const payload = new NewComment({
        thread_id: 'thread-123',
        content: 'Some Comment',
        owner: 'user-123',
        date: new Date().toISOString(),
      });
      const fakeIdGenerator = () => 123;
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /** Add comment into the thread */
      const addedComment = await commentRepositoryPostgres.addComment(payload);

      // Action & Assert
      await expect(
        commentRepositoryPostgres.checkCommentAvailabilityInThread(addedComment.id, 'thread-123')
      ).resolves.not.toThrowError(new NotFoundError('Komentar tidak ditemukan'));
    });
  });

  describe('checkCommentOwnership function', () => {
    it('should reject throw AuthorizationError when user not authorized over the comment', async () => {
      // Arrange
      /** add comment */
      await CommentTableTestHelper.addComment({ 
        id: 'comment-123', 
        thread_id: 'thread-123', 
        owner: 'user-123',
        date: new Date().toISOString(),
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.checkCommentOwnership('comment-123', 'user-456') // user-456 is not rightful owner
      ).rejects.toThrowError(
        new AuthorizationError('Anda tidak berhak melakukan perubahan pada komentar ini')
      );
    });
    it('should resolve when user is rightful comment owner', async () => {
      // Arrange
      /** Add Comment */
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        owner: 'user-123',
        date: new Date().toISOString(),
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      
      // Action & Assert
      await expect(
        commentRepositoryPostgres.checkCommentOwnership('comment-123', 'user-123')
      ).resolves.not.toThrowError(
        new AuthorizationError('Anda tidak berhak melakukan perubahan pada komentar ini')
      );
    });
  });

  describe('deleteComment function', () => {
    it('should successfully soft delete comment', async() => {
      // Arrange
      /** Add Comment */
      await CommentTableTestHelper.addComment({ id: 'comment-123' });

      const commentsThen = await CommentTableTestHelper.findCommentById('comment-123');
      expect(commentsThen).toHaveLength(1);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      
      // Action & Assert
      await expect(
        commentRepositoryPostgres.deleteComment('comment-123')
      ).resolves.not.toThrow();

      const commentsNow = await CommentTableTestHelper.findCommentById('comment-123');
      expect(commentsNow).toHaveLength(1);
      expect(commentsNow[0].is_delete).not.toEqual(false);
    })
  });

  describe('getCommentByThreadIds function', () => {
    let jackCommentTimestamp = '';
    let billyCommentTimestamp = '';
    beforeAll(async () => {
      /** we have thread-123 by billy (user-123) */
      // creating new user jack (user-124)
      await UserTableTestHelper.addUser({ 
        id: 'user-124',
        username: 'jack',
        fullname: 'Jack Sparrow',
      });

      // creating comment-123 by jack (user-124) to billy thread
      jackCommentTimestamp = await CommentTableTestHelper.addComment({ 
        id: 'comment-123',
        content: 'sebuah comment',
        thread_id: 'thread-123',
        owner: 'user-124',
        date: '2021-08-08T07:22:33.555Z'
      });

      // creating comment-124 by billy
      billyCommentTimestamp = await CommentTableTestHelper.addComment({
        id: 'comment-124',
        content: 'sebuah komentar menarik',
        thread_id: 'thread-123',
        owner: 'user-123',
        date: '2021-08-08T07:26:21.338Z',
      });

      // billy delete his own comment
      await CommentTableTestHelper.deleteComment('comment-124');
    });
    
    it('should return comments of the threadId provided', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toEqual([
        {
          id: 'comment-123',
          thread_id: 'thread-123', 
          content: 'sebuah comment',
          username: 'jack',
          date: jackCommentTimestamp,
          is_delete: false,
        },
        {
          id: 'comment-124',
          thread_id: 'thread-123',
          content: 'sebuah komentar menarik',
          username: 'billy',
          date: billyCommentTimestamp,
          is_delete: true,
        },
      ])
    })
  })
});
