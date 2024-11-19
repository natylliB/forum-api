const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const UserTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

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

  describe('isCommentAvailableInThread function', () => {
    it('should resolve false when comment is not in the given thread', async () => {
      // Arrange
      const payload = new NewComment({
        thread_id: 'thread-123',
        content: 'Some Comment',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => 123;
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /** Add comment into the thread */
      await commentRepositoryPostgres.addComment(payload);

      // Action & Assert 
      /** the only comment available in thread-123 right now is comment-123 */
      await expect(
        commentRepositoryPostgres.isCommentAvailableInThread('comment-456', 'thread-123')
      ).resolves.toEqual(false);
    });
    it('should resolve true when comment is in the given thread', async () => {
      // Arrange
      const payload = new NewComment({
        thread_id: 'thread-123',
        content: 'Some Comment',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => 123;
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /** Add comment into the thread */
      const addedComment = await commentRepositoryPostgres.addComment(payload);

      // Action & Assert
      await expect(
        commentRepositoryPostgres.isCommentAvailableInThread(addedComment.id, 'thread-123')
      ).resolves.toEqual(true);
    });
  });

  describe('checkCommentOwnership function', () => {
    it('should reject throw AuthorizationError when user not authorized over the comment', async () => {
      // Arrange
      /** add comment */
      CommentTableTestHelper.addComment({ 
        id: 'comment-123', 
        thread_id: 'thread-123', 
        owner: 'user-123' 
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
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      
      // Action & Assert
      await expect(
        commentRepositoryPostgres.checkCommentOwnership('comment-123', 'user-123')
      ).resolves.not.toThrow();
    });
  });

  describe('deleteComment function', () => {
    it('should successfully soft delete comment', async() => {
      // Arrange
      /** Add Comment */
      await CommentTableTestHelper.addComment({ id: 'comment-123' });

      const commentsThen = await CommentTableTestHelper.findCommentById('comment-123');
      expect(commentsThen).toHaveLength(1);
      
      /** is_delete column before delete comment */
      const deleteStatusBeforeCommentDelete = commentsThen[0].is_delete;

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      
      // Action & Assert
      await expect(
        commentRepositoryPostgres.deleteComment('comment-123')
      ).resolves.not.toThrow();

      const commentsNow = await CommentTableTestHelper.findCommentById('comment-123');
      expect(commentsNow).toHaveLength(1);
      expect(commentsNow[0].is_delete).not.toEqual(deleteStatusBeforeCommentDelete);
    })
  })
});
