const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
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
    await RepliesTableTestHelper.cleanTable();
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

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 with added reply and succesfully add reply', async () => {
      // Action
      /** Billy reply Jack's comment */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments/${addedCommentId}/replies`,
        payload: {
          content: 'A critical reply',
        },
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });
      
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(typeof responseJson.data.addedReply.id).toEqual('string');
      expect(responseJson.data.addedReply.content).toBeDefined();
      expect(typeof responseJson.data.addedReply.content).toEqual('string');
      expect(responseJson.data.addedReply.owner).toBeDefined();
      expect(typeof responseJson.data.addedReply.owner).toEqual('string');

      const replies = await RepliesTableTestHelper.findReplyById(responseJson.data.addedReply.id);
      expect(replies).toHaveLength(1);
    });

    it('should response 404 when thread is not valid', async () => {
      // Action
      /** Billy reply Jack's comment */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/unknown-thread/comments/${addedCommentId}/replies`,
        payload: {
          content: 'A critical reply',
        },
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 when comment to reply is not valid', async () => {
      // Action
      /** Billy reply Jack's comment */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments/unknown-comment/replies`,
        payload: {
          content: 'A critical reply',
        },
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 400 when sending emtpy reply', async () => {
      // Action
      /** Billy reply Jack's comment */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments/${addedCommentId}/replies`,
        payload: {
          content: '', // empty string
        },
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Balasan komentar tidak boleh kosong');
    });
  });
  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    let addedReplyId = '';

    beforeEach(async () => {
      /** Billy reply Jack's comment */
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThreadId}/comments/${addedCommentId}/replies`,
        payload: {
          content: 'A critical reply',
        },
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      addedReplyId = JSON.parse(
        replyResponse.payload
      ).data.addedReply.id;
    });

    it('should response 200 with status success and soft delete reply correctly', async () => {
      // Action
      /** Billy try delete his own comment */
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThreadId}/comments/${addedCommentId}/replies/${addedReplyId}`,
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const replies = await RepliesTableTestHelper.findReplyById(addedReplyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toEqual(true);
    });

    it('should response 403 when deleting not your own reply', async () => {
      // Action
      /** Jack try delete Billy's comment */
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThreadId}/comments/${addedCommentId}/replies/${addedReplyId}`,
        headers: {
          authorization: `Bearer ${jackAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak untuk mengubah balasan komentar ini');
    });

    it('should response 404 when thread is not valid', async () => {
      // Action
      /** Billy try delete his own comment with invalid threadId */
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/unknown-threads/comments/${addedCommentId}/replies/${addedReplyId}`,
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 when comment of the reply is not valid', async () => {
      // Action
      /** Billy try to delete his comment with invalid commentId */
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThreadId}/comments/invalid-comment/replies/${addedReplyId}`,
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 404 when the replyId to delete is invalid', async () => {
      // Action
      /** Billy try to delete his comment with invalid replyId */
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThreadId}/comments/${addedCommentId}/replies/invalid-reply`,
        headers: {
          authorization: `Bearer ${billyAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Balasan komentar tidak ditemukan');
    });
  });
});