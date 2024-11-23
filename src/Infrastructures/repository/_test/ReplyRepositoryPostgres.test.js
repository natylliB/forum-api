const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const Reply = require('../../../Domains/replies/entities/Reply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    // create user
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'billy' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'jack' });
    // billy (user-123) create thread
    await ThreadsTableTestHelper.addThread({ 
      id: 'thread-123', 
      title: 'Some interesting topic', 
      body: 'Some engaging content',
      owner: 'user-123',
    });
    // jack (user-456) create comment
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
      const payload = new Reply({
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
    it('should throw InvariantError when trying to add empty reply', async () => {
      // Arrange
      const payload = new Reply({
        comment_id: 'comment-123',
        content: '',
        owner: 'user-123',
        date: new Date().toISOString(),
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      
      // Action & Assert
      await expect(
        replyRepositoryPostgres.addReply(payload)
      ).rejects.toThrowError('Balasan komentar tidak boleh kosong');
    })
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
      ).rejects.toThrowError('Balasan komentar tidak ditemukan');
    });

    it('should resolve when the reply is in the comment', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.checkReplyAvailabilityInComment('reply-123', 'comment-123')
      ).resolves.not.toThrowError(new NotFoundError('Balasan komentar tidak ditemukan'));
    });
  });

  describe('checkReplyOwnership function', () => {
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
      // Add Reply form billy (user-123)
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
});
