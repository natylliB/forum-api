const Comment = require('../../comments/entities/Comment');
const Reply = require('../../replies/entities/Reply');
const Thread = require('./Thread');

class ThreadDetail {
  constructor({
    thread,
    threadComments,
    repliesOfComments,
    likeCountsOfComments,
  }) {
    this._verifyPayload({ thread, threadComments, repliesOfComments, likeCountsOfComments });

    this._thread = thread;
    this._threadComments = threadComments;
    this._repliesOfComments = repliesOfComments;
    this._likeCountsOfComments = likeCountsOfComments;
  }

  _verifyPayload({ thread, threadComments, repliesOfComments, likeCountsOfComments}) {
    const requiredProperties = [
      thread, 
      threadComments, 
      repliesOfComments, 
      likeCountsOfComments
    ];

    if (requiredProperties.some((prop) => typeof prop === 'undefined')) {
      throw new Error('THREAD_DETAIL.NOT_CONTAIN_REQUIRED_PROPERTY');
    }
  }

  compose() {
    const comments = this._composeCommentsWithReplies();

    const thread = new Thread({
      id: this._thread.id,
      title: this._thread.title,
      body: this._thread.body,
      date: this._thread.date,
      username: this._thread.username,
    });

    if (comments.length !== 0) {
      thread.setComments(comments);
    }

    return thread;
  }

  _composeReplies(commentId) {
    const replies = this._repliesOfComments.filter(
      (reply) => reply.comment_id === commentId
    ).map(
      (reply) => new Reply({
        id: reply.id,
        content: reply.content,
        date: reply.date,
        username: reply.username,
        is_delete: reply.is_delete,
      })
    );

    return replies;
  }

  _composeCommentLikeCount(commentId) {
    return this._likeCountsOfComments.filter(
      (like) => like.comment_id === commentId
    )[0]?.like_count;
  }

  _composeCommentsWithReplies() {
    const comments = this._threadComments.map((comment) => {
      const replies = this._composeReplies(comment.id);
      const likeCount = this._composeCommentLikeCount(comment.id);

      const commentObject = new Comment({
        id: comment.id,
        content: comment.content,
        date: comment.date,
        username: comment.username,
        is_delete: comment.is_delete,
      });

      if (replies.length !== 0) {
        commentObject.setReplies(replies);
      }

      if (likeCount) {
        commentObject.setLikeCount(parseInt(likeCount))
      }

      return commentObject
    });

    return comments;
  }
}

module.exports = ThreadDetail;