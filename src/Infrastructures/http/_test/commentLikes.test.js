const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTesthelper');


describe('/threads/{threadId}/comments/{commentId}/likes', () => {
  let server = null;
  let billyAccessToken = '';
  let jackAccessToken = '';
  let addedThreadId = '';
  let addedCommentId = '';

  beforeAll(async () => {
    server = await createServer(container);

    // Add User Billy
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'billy',
        password: 'secret',
        fullname: 'Billy Tan',
      },
    });

    // Add User Jack
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'jack',
        password: 'confidential',
        fullname: 'Jack Sparrow',
      }
    })

    // Login user Billy
    const billyResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'billy',
        password: 'secret',
      },
    });

    billyAccessToken = JSON.parse(
      billyResponse.payload
    ).data.accessToken;

    // Login user Jack
    const jackReponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'jack',
        password: 'confidential',
      },
    });

    jackAccessToken = JSON.parse(
      jackReponse.payload
    ).data.accessToken;

    // User Billy Add Thread Discussion
    const threadReponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'Some cool topic',
        body: 'Some engaging content',
      },
      headers: {
        authorization: `Bearer ${billyAccessToken}`,
      },
    });

    addedThreadId = JSON.parse(
      threadReponse.payload
    ).data.addedThread.id;

    // User Jack comment on Billy's Thread
    const commentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${addedThreadId}/comments`,
      payload: {
        content: 'Some good comment',
      },
      headers: {
        authorization: `Bearer ${jackAccessToken}`
      }
    });

    addedCommentId = JSON.parse(
      commentResponse.payload,
    ).data.addedComment.id;
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    // clean comments
    await CommentTableTestHelper.cleanTable();
    // clean threads
    await ThreadsTableTestHelper.cleanTable();
    // clean authentications
    await AuthenticationsTableTestHelper.cleanTable();
    // clean users
    await UsersTableTestHelper.cleanTable();

    // close connection
    await pool.end();
  })

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 with status success and like comment', async () => {
      // Action
      /** Billy like jack's comment */
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThreadId}/comments/${addedCommentId}/likes`,
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
    it('should response 200 with status success and unlike comment', async () => {
      // Arrange
      /** Billy like jack's comment */
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThreadId}/comments/${addedCommentId}/likes`,
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      // Action
      /** Billy unlike jack's comment */
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThreadId}/comments/${addedCommentId}/likes`,
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});