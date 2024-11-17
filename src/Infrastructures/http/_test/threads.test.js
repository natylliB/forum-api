const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');

describe('/threads endpoint', () => {
  let server = null;
  let accessToken = '';
  let refreshToken = '';
  
  beforeAll(async () => {
    // AddUser 
    server = await createServer(container);
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'billy',
        password: 'secret',
        fullname: 'Billy Tan',
      },
    });

    // Login
    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'billy',
        password: 'secret',
      },
    });

    const responseJson = JSON.parse(response.payload);
    accessToken = responseJson.data.accessToken;
    refreshToken = responseJson.data.refreshToken;
  });
  
  afterAll(async () => {
    // Logout
    await server.inject({
      method: 'DELETE',
      url: '/authentications',
      payload: {
        refreshToken,
      },
    });

    // Clean user table
    await UsersTableTestHelper.cleanTable();

    /** making sure database table is clean */
    const authRows = await AuthenticationsTableTestHelper.getAll();
    const userRows = await UsersTableTestHelper.getAll();
    const threadRows = await ThreadsTableTestHelper.getAll();

    expect(authRows).toHaveLength(0);
    expect(userRows).toHaveLength(0);
    expect(threadRows).toHaveLength(0);

    accessToken = '';
    refreshToken = '';

    // close client
    await pool.end();
  });
  
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 400 when body request is invalid', async () => {
      // Arrange
      const invalidPayload = {
        title: 'Some Topic',
        body: ['something'],
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: invalidPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 400 when body request is not complete', async () => {
      // Arrange
      const incompletePayload = {
        title: 'Some Topic',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: incompletePayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 201 with addedThread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Some Cool Topic!',
        body: 'Some Engaging Content!'
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread).toHaveProperty('id');
      expect(responseJson.data.addedThread).toHaveProperty('title');
      expect(responseJson.data.addedThread).toHaveProperty('owner');
    });
  })
})