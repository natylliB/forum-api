const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTesthelper');

describe('CommentLikeRepositoryPostgres', () => {
  beforeAll(async () => {
    /** create user billy */
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'billy', fullname: 'Billy Tan' });

    /** create user jack */
    await UsersTableTestHelper.addUser({ id: 'user-124', username: 'jack', fullname: 'Jack Fruit' });

    /** create thread by billy */
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

    /** jack comment billy's thread */
    await CommentTableTestHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', owner: 'user-124' });
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  })

  describe('addCommentLike function', () => {
    it('should add CommentLike successfully', async () => {
      // Arrange
      const commentId = 'comment-123';
      const userId = 'user-123';

      const fakeIdGenerator = () => 123;

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const commentLikeRows = await CommentLikesTableTestHelper.getAll();
      expect(commentLikeRows).toHaveLength(0);

      await commentLikeRepositoryPostgres.addCommentLike(commentId, userId);

      // Assert
      const commentLikes = await CommentLikesTableTestHelper.findCommentLikeById('comment_like-123');
      expect(commentLikes).toHaveLength(1);
    });
  });

  describe('deleteCommentLike function', () => {
    it('should delete CommentLike successfully', async () => {
      // Arrange
      const commentId = 'comment-123';
      const userId = 'user-123';

      await CommentLikesTableTestHelper.addCommentLike({ 
        id: 'comment_like-123', 
        comment_id: commentId,
        owner: userId,
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const commentLikesBefore = await CommentLikesTableTestHelper.findCommentLikeById('comment_like-123');
      expect(commentLikesBefore).toHaveLength(1);

      commentLikeRepositoryPostgres.deleteCommentLike(commentId, userId);

      // Assert
      const commentLikesAfter = await CommentLikesTableTestHelper.findCommentLikeById('comment_like-123');
      expect(commentLikesAfter).toHaveLength(0);
    });
  });

  describe('isCommentLiked function', () => {
    it('should return true when comment is liked', async() => {
      // Arrange
      await CommentLikesTableTestHelper.addCommentLike({
        id: 'comment_like-123',
        comment_id: 'comment-123',
        owner: 'user-123',
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const isCommentLiked = await commentLikeRepositoryPostgres.isCommentLiked('comment-123', 'user-123');

      // Assert
      expect(isCommentLiked).toEqual(true);
    });

    it('should return false when comment is not liked', async() => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const isCommentLiked = await commentLikeRepositoryPostgres.isCommentLiked('comment-123', 'user-123');

      // Assert
      expect(isCommentLiked).toEqual(false);
    });
  });
});