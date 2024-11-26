const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

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
      const thread = new NewThread({
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

  describe('checkThreadAvailability function', () => {
    it('should throw NotFoundError when the thread is not found', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.checkThreadAvailability('thread-456')
      ).rejects.toThrowError(new NotFoundError('Thread tidak ditemukan'));
    });
    it('should not throw NotFoundError when the thread is available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.checkThreadAvailability('thread-123')
      ).resolves.not.toThrowError(new NotFoundError('Thread tidak ditemukan'));
    });
  });

  describe('getThreadDetail function', () => {
    it('should get the thread detail correctly', async () => {
      // Arrange
      //** create a thread */
      const billyThreadTimestamp = await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadDetail('thread-123');

      // Assert
      expect(thread).toEqual({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        username: 'billy',
        date: billyThreadTimestamp,
      });
    });
  });
});