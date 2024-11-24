const Thread = require('../../Domains/threads/entities/Thread');
const Comment = require('../../Domains/comments/entities/Comment');
const Reply = require('../../Domains/replies/entities/Reply');

class GetThreadDetailUseCase {
  constructor({ 
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.checkThreadAvailability(threadId);

    const thread = await this._threadRepository.getThreadDetail(threadId);

    const threadComments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = threadComments.map(((comment) => comment.id));

    const repliesOfComments = await this._replyRepository.getRepliesByCommentIds(...commentIds);

    const threadDetail = this._composeThreadDetail(thread, threadComments, repliesOfComments);

    return threadDetail;
  }

  _composeThreadDetail(thread, threadComments, repliesOfComments) {
    /**composing array of comments with replies in it */
    const comments = threadComments.map((comment) => {
      /** filter the replies with corresponding comment id and create the array of reply object. */
      const replies = repliesOfComments.filter(
        (reply) => reply.comment_id === comment.id
      ).map(
        (reply) => new Reply({
          id: reply.id,
          content: reply.content,
          date: reply.date,
          username: reply.username,
          is_delete: reply.is_delete,
        })
      );

      /** create and return comment object */
      const commentObject =  new Comment({
        id: comment.id,
        content: comment.content,
        date: comment.date,
        username: comment.username,
        is_delete: comment.is_delete,
      });

      if (replies.length !== 0) {
        commentObject.setReplies(replies);
      }

      return commentObject;
    });

    /** Composing thread object */
    const threadObject = new Thread({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
    });

    if (comments.length !== 0) {
      threadObject.setComments(comments);
    }

    return threadObject;
  }
}

module.exports = GetThreadDetailUseCase;
