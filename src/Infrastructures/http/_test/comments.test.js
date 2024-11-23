const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const CommentTableTestHelper = require("../../../../tests/CommentTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const pool = require("../../database/postgres/pool");
const createServer = require("../createServer");

describe('/coments endpoint', () => {
  let server = null;
  let billyAccessToken = '';
  let jackAccessToken = '';
  let addedThreadId = '';

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
        title: 'Some Cool Topic',
        body: 'Some Engaging Content',
      },
      headers: {
        authorization: `Bearer ${billyAccessToken}`,
      },
    });

    addedThreadId = JSON.parse(
      threadReponse.payload
    ).data.addedThread.id;
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
      /** Jack try comment on unknown thread */
      const response = await server.inject({
        method: 'POST',
        url: '/threads/unknown-thread/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
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
      /** Jack try comment with wrong request payload */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan komentar karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request body not met data type specification', async () => {
      // Arrange
      const requestPayload = { content: [''] };

      // Action
      /** Jack try comment with wrong request payload */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan komentar karena tipe data tidak sesuai');
    });

    it('should response 400 when request body comment is empty', async () => {
      // Arrange
      const requestPayload = { content: '' };

      // Action
      /** Jack try comment with wrong request payload */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan komentar, komentar tidak boleh kosong');
    });

    it('should response 201 with addedComment', async () => {
      // Arrange
      const requestPayload = {
        content: 'Some serious opinion',
      };

      // Action
      /** Jack try comment on billy thread */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
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
  });

  describe('when DELETE /comments/{commentId}', () => {
    it('should response 200 with status success and soft delete comment correctly', async () => {
      // Arrange
      /** Jack comment on billy thread */
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments`,
        payload: {
          content: 'Some inappropriate comment',
        },
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
        }
      });

      const commentId = JSON.parse(
        commentResponse.payload
      ).data.addedComment.id;

      // Action
      /** Jack is a good internet user he immediately deleted the comment and apologize */
      const deleteCommentResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThreadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(deleteCommentResponse.payload);
      expect(deleteCommentResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
    it('should response 403 when deleting comment that you not own', async() => {
      // Arrange
      /** Jack comment on billy thread */
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments`,
        payload: {
          content: 'Some inappropriate comment',
        },
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
        },
      });

      const commentId = JSON.parse(
        commentResponse.payload
      ).data.addedComment.id;

      // Action
      /** Billy try to delete jack comment */
      const deleteCommentResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThreadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(deleteCommentResponse.payload);
      expect(deleteCommentResponse.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak melakukan perubahan pada komentar ini');
    });

    it('should response 404 if thread of the comment you want delete is not found', async () => {
      // Arrange
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments`,
        payload: {
          content: 'Some inappropriate comment',
        },
        headers: {
          authorization: `Bearer ${jackAccessToken}`
        }
      });

      const commentId = JSON.parse(
        commentResponse.payload
      ).data.addedComment.id;

      // Action
      const deleteCommentResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/unknown-thread/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${jackAccessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(deleteCommentResponse.payload);
      expect(deleteCommentResponse.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 if the comment you want to delete is not found', async () => {
      // Arrange
      await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments`,
        payload: {
          content: 'Some inappropriate comment',
        },
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThreadId}/comments/unknown-comment`,
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });
  });
});