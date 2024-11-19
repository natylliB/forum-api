const { headers } = require("@hapi/hapi/lib/cors");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const CommentTableTestHelper = require("../../../../tests/CommentTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const pool = require("../../database/postgres/pool");
const createServer = require("../createServer");

describe('/coments endpoint', () => {
  let server = null;
  let accessToken = '';
  let addedThreadId = '';

  beforeAll(async () => {
    server = await createServer(container);
    
    // Add User
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

    // Add Thread
    const threadReponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'Some Cool Topic',
        body: 'Some Engaging Content',
      },
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJsonThread = JSON.parse(threadReponse.payload);
    addedThreadId = responseJsonThread.data.addedThread.id;
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    // clean thread
    await ThreadsTableTestHelper.cleanTable();
    // clean authentication
    await AuthenticationsTableTestHelper.cleanTable();
    // clean user
    await UsersTableTestHelper.cleanTable();

    // close client
    await pool.end();
  });

  describe('when POST /comments', () => {
    it('should response 404 when adding coments to not found thread', async () => {
      // Arrange
      const requestPayload = {
        content: 'Some Interesting Opinion',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/unknown-thread/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
    it('should response 400 when request body is invalid', async () => {
      // Arrange
      const requestPayload = { unkown: 'Some unknown things' };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 201 with addedComment', async () => {
      // Arrange
      const requestPayload = {
        content: 'Some serious opinion',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment).toHaveProperty('id');
      expect(responseJson.data.addedComment).toHaveProperty('content');
      expect(responseJson.data.addedComment).toHaveProperty('owner');
    });
  })
})