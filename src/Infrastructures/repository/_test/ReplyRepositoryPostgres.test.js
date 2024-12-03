const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    // create user
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'billy' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'jack' });
    // billy (user-123) create (thread-123)
    await ThreadsTableTestHelper.addThread({ 
      id: 'thread-123', 
      title: 'Some interesting topic', 
      body: 'Some engaging content',
      owner: 'user-123',
    });
    // jack (user-456) create (comment-123)
    await CommentTableTestHelper.addComment({
      id: 'comment-123',
      thread_id: 'thread-123',
      content: 'Some good comment',
      owner: 'user-456'
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    // clean up table
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    const commentRows = await CommentTableTestHelper.getAll();
    const threadRows = await ThreadsTableTestHelper.getAll();
    const userRows = await UsersTableTestHelper.getAll();

    expect(commentRows).toHaveLength(0);
    expect(threadRows).toHaveLength(0);
    expect(userRows).toHaveLength(0);

    await pool.end();
  })
  describe('addReply function', () => {
    it('should persist add reply correctly and return addedReply', async () => {
      // Arrange
      const payload = new NewReply({
        comment_id: 'comment-123',
        content: 'A critical reply',
        owner: 'user-123',
        date: new Date().toISOString(),
      });

      const fakeIdGenerator = () => 123;

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      
      // Action
      const addedReply = await replyRepositoryPostgres.addReply(payload);

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
      expect(addedReply).toEqual(new AddedReply({
        id: 'reply-123',
        content: 'A critical reply',
        owner: 'user-123',
      }));
    });
  });

  describe('checkReplyAvailabilityInComment function', () => {
    beforeEach(async () => {
      // Add Reply form billy (user-123)
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'A critical reply',
        owner: 'user-123',
        date: new Date().toISOString(),
      });
    });

    it('should throw NotFoundError when the reply is not in the comment', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.checkReplyAvailabilityInComment('reply-456', 'comment-123')
      ).rejects.toThrowError(
        new NotFoundError('Balasan komentar tidak ditemukan')
      );
    });

    it('should resolve when the reply is in the comment', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.checkReplyAvailabilityInComment('reply-123', 'comment-123')
      ).resolves.not.toThrowError(
        new NotFoundError('Balasan komentar tidak ditemukan')
      );
    });
  });

  describe('checkReplyOwnership function', () => {
    beforeEach(async () => {
      // Add (reply-123) form billy (user-123)
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'A critical reply',
        owner: 'user-123',
        date: new Date().toISOString(),
      });
    });

    it('should throw AuthorizationError if reply owner is invalid', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      /** Jack (user-456) */
      await expect(
        replyRepositoryPostgres.checkReplyOwnership('reply-123', 'user-456')
      ).rejects.toThrowError(
        new AuthorizationError('Anda tidak berhak untuk mengubah balasan komentar ini')
      );
    });

    it('should resolve if reply owner is valid', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      /** Billy (user-123) */
      await expect(
        replyRepositoryPostgres.checkReplyOwnership('reply-123', 'user-123')
      ).resolves.not.toThrowError(
        new AuthorizationError('Anda tidak berhak untuk mengubah balasan komentar ini')
      );
    });
  });

  describe('deleteReply function', () => {
    beforeEach(async () => {
      // Add (reply-123) form billy (user-123)
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'A critical reply',
        owner: 'user-123',
        date: new Date().toISOString(),
      });
    });

    it('should soft-delete reply correctly', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.deleteReply('reply-123')
      ).resolves.not.toThrow();

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe('getRepliesByCommentIds(...commentIds) function', () => {
    let jackReplyTimestamp = '';
    let billyReplyTimestamp = '';
    let jackSecondReplyTimestamp = '';

    beforeAll(async () => {
      /**
       * we have users billy(user-123) jack(user-456)
       * we have a thread (thread-123) by billy
       * we have a comment (comment-123) in (thread-123) by jack
       */

      const timestamp = new Date().toISOString();

      // Create a comment(comment-124) in (thread-123) by billy
      await CommentTableTestHelper.addComment({
        id: 'comment-124',
        thread_id: 'thread-123',
        content: 'Thread saya tutup ya!',
        owner: 'user-123',
        date: timestamp,
      });

      // jack reply (reply-123) to (comment-123)
      jackReplyTimestamp = await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'A critical reply',
        owner: 'user-456',
      });

      // billy reply(reply-124) to (comment-123)
      billyReplyTimestamp = await RepliesTableTestHelper.addReply({
        id: 'reply-124',
        comment_id: 'comment-123',
        content: 'A debateful reply',
        owner: 'user-123',
      });

      // jack reply(reply-125) to (comment-123)
      jackSecondReplyTimestamp = await RepliesTableTestHelper.addReply({
        id: 'reply-125',
        comment_id: 'comment-123',
        content: 'A sensitive reply',
        owner: 'user-456',
      });

      // delete (reply-125)
      await RepliesTableTestHelper.deleteReply('reply-125');
    });

    it('should return the replies of all commentsIds provided', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const arrayOfCommentIds = ['comment-123', 'comment-124'];

      // Action
      const repliesOfComments = await replyRepositoryPostgres.getRepliesByCommentIds(...arrayOfCommentIds);

      // Assert
      expect(repliesOfComments).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'reply-123',
          comment_id: 'comment-123',
          content: 'A critical reply',
          date: jackReplyTimestamp,
          username: 'jack',
          is_delete: false,
        }),
        expect.objectContaining({
          id: 'reply-124',
          comment_id: 'comment-123',
          content: 'A debateful reply',
          date: billyReplyTimestamp,
          username: 'billy',
          is_delete: false,
        }),
        expect.objectContaining({
          id: 'reply-125',
          comment_id: 'comment-123',
          content: 'A sensitive reply',
          date: jackSecondReplyTimestamp,
          username: 'jack',
          is_delete: true,
        }),
      ]));
    });

    it('should return empty array when there is no commentId', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const arrayOfCommentIds = []

      // Action
      const repliesOfComments = await replyRepositoryPostgres.getRepliesByCommentIds(...arrayOfCommentIds);

      // Assert
      expect(repliesOfComments).toEqual([]);
    });
  });
});
