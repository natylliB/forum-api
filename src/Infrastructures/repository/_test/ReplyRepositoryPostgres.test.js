const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const Reply = require('../../../Domains/replies/entities/Reply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

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
  });

  describe('isReplyAvailableInComment function', () => {
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

    it('should resolve false when the reply is not in the comment', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const isReplyAvailableInComment = await replyRepositoryPostgres.isReplyAvailableInComment('reply-456', 'comment-123');

      // Assert
      expect(isReplyAvailableInComment).toEqual(false);
    });

    it('should resolve true when the reply is in the comment', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const isReplyAvailableInComment = await replyRepositoryPostgres.isReplyAvailableInComment('reply-123', 'comment-123');

      // Assert
      expect(isReplyAvailableInComment).toEqual(true);
    });
  });

  describe('isReplyOwnerValid function', () => {
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

    it('should resolve false if reply owner is invalid', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      /** Jack (user-456) */
      const isReplyOwnerValid = await replyRepositoryPostgres.isReplyOwnerValid('reply-123', 'user-456')

      // Assert
      expect(isReplyOwnerValid).toEqual(false);
    });

    it('should resolve true if reply owner is valid', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      /** Billy (user-123) */
      const isReplyOwnerValid = await replyRepositoryPostgres.isReplyOwnerValid('reply-123', 'user-123');

      // Assert
      expect(isReplyOwnerValid).toEqual(true);
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
