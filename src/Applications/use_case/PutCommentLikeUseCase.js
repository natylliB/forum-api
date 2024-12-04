const CommentLike = require('../../Domains/likes/entities/CommentLike');

class PutCommentLikeUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute({ threadId, commentId, userId }) {
    const commentLike = new CommentLike({
      threadId,
      commentId,
      userId,
    });

    await this._threadRepository.checkThreadAvailability(commentLike.threadId);

    await this._commentRepository.checkCommentAvailabilityInThread(
      commentLike.commentId,
      commentLike.threadId,
    );

    const isCommentLiked = await this._commentLikeRepository.isCommentLiked(
      commentLike.commentId,
      commentLike.userId,
    );

    if (isCommentLiked) {
      await this._commentLikeRepository.deleteCommentLike(commentLike.commentId, commentLike.userId);
    } else {
      await this._commentLikeRepository.addCommentLike(commentLike.commentId, commentLike.userId);
    }
  }
}

module.exports = PutCommentLikeUseCase;
