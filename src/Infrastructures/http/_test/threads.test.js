const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads endpoint', () => {
  let server = null;
  let billyAccessToken = '';
  let billyRefreshToken = '';
  
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
    billyAccessToken = responseJson.data.accessToken;
    billyRefreshToken = responseJson.data.refreshToken;
  });
  
  afterAll(async () => {
    // Logout
    await server.inject({
      method: 'DELETE',
      url: '/authentications',
      payload: {
        refreshToken: billyRefreshToken,
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

    billyAccessToken = '';
    billyRefreshToken = '';

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
          authorization: `Bearer ${billyAccessToken}`,
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
          authorization: `Bearer ${billyAccessToken}`,
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
          authorization: `Bearer ${billyAccessToken}`,
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
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when thread you access is invalid/not available', async () => {
      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/unknown_thread'
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 200 with expected thread detail', async () => {
      // Arrange
      /** create user jack */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'jack',
          password: 'confidential',
          fullname: 'Jack Sparrow',
        },
      });

      /** login user jack */
      const responseLoginJack = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'jack',
          password: 'confidential',
        },
      });

      const jackAccessToken = JSON.parse(
        responseLoginJack.payload
      ).data.accessToken;

      const jackRefreshToken = JSON.parse(
        responseLoginJack.payload
      ).data.refreshToken;

      /** billy create thread */
      const responseBillyCreateThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Some interesting topic',
          body: 'Some engaging content',
        },
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      const billyThreadId = JSON.parse(
        responseBillyCreateThread.payload,
      ).data.addedThread.id;

      const billyThreadTimestamp = await ThreadsTableTestHelper.getThreadTimetamp(billyThreadId);

      /** jack comment on billy thread */
      const responseJackComment = await server.inject({
        method: 'POST',
        url: `/threads/${billyThreadId}/comments`,
        payload: {
          content: 'Sangat menarik!!',
        },
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
        },
      });

      const jackCommentId = JSON.parse(
        responseJackComment.payload,
      ).data.addedComment.id;

      const jackCommentTimeStamp = await CommentTableTestHelper.getCommentTimestamp(jackCommentId);

      /** billy comment on billy thread */
      const responseBillyComment = await server.inject({
        method: 'POST',
        url: `/threads/${billyThreadId}/comments`,
        payload: {
          content: 'Ingat beli minyak di warung',
        },
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      const billyCommentId = JSON.parse(
        responseBillyComment.payload
      ).data.addedComment.id;

      const billyCommentTimestamp = await CommentTableTestHelper.getCommentTimestamp(billyCommentId);

      /** billy delete the comment */
      await server.inject({
        method: 'DELETE',
        url: `/threads/${billyThreadId}/comments/${billyCommentId}`,
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      /** billy reply on jack's comment */
      const billyReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${billyThreadId}/comments/${jackCommentId}/replies`,
        payload: {
          content: 'Terima Kasih!',
        },
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        }
      });

      const billyReplyId = JSON.parse(
        billyReplyResponse.payload
      ).data.addedReply.id;

      const billyReplyTimestamp = await RepliesTableTestHelper.getReplyTimestamp(billyReplyId);

      /** jack reply on jack's comment */
      const jackReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${billyThreadId}/comments/${jackCommentId}/replies`,
        payload: {
          content: 'Sesuatu candaan yang sensitif',
        },
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
        }
      });

      const jackReplyId = JSON.parse(
        jackReplyResponse.payload
      ).data.addedReply.id;

      const jackReplyTimestamp = await RepliesTableTestHelper.getReplyTimestamp(jackReplyId);

      /** jack delete his own comment */
      await server.inject({
        method: 'DELETE',
        url: `/threads/${billyThreadId}/comments/${jackCommentId}/replies/${jackReplyId}`,
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${billyThreadId}`
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread).toEqual(expect.objectContaining({
        id: billyThreadId,
        title: 'Some interesting topic',
        body: 'Some engaging content',
        date: billyThreadTimestamp,
        username: 'billy',
        comments: [
          {
            id: jackCommentId,
            username: 'jack',
            date: jackCommentTimeStamp,
            replies: [
              {
                id: billyReplyId,
                content: 'Terima Kasih!',
                date: billyReplyTimestamp,
                username: 'billy',
              },
              {
                id: jackReplyId,
                content: '**balasan telah dihapus**',
                date: jackReplyTimestamp,
                username: 'jack'
              }
            ],
            content: 'Sangat menarik!!',
          },
          {
            id: billyCommentId,
            username: 'billy',
            date: billyCommentTimestamp,
            replies: [],
            content: '**komentar telah dihapus**',
          },
        ],
      }));

      /** logout jack */
      await server.inject({
        method: 'DELETE',
        url: '/authentications',
        payload: {
          refreshToken: jackRefreshToken,
        }
      });
    });
  })
});