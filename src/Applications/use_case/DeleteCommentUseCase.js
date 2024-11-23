class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId, commentId, userId) {
    await this._threadRepository.checkThreadAvailability(threadId);

    await this._commentRepository.checkCommentAvailabilityInThread(commentId, threadId);

    await this._commentRepository.checkCommentOwnership(commentId, userId);

    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
