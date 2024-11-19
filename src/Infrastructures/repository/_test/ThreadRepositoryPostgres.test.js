const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const Thread = require('../../../Domains/threads/entities/Thread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

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
  })
})