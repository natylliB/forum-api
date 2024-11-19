const NotFoundError = require("../../Commons/exceptions/NotFoundError");

class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId, commentId, userId) {
    const isThreadAvailable = await this._threadRepository.isThreadAvailable(threadId);
    if (!isThreadAvailable) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    const isCommentAvailableInThread = await this._commentRepository.isCommentAvailableInThread(commentId, threadId);
    if (!isCommentAvailableInThread) {
      throw new NotFoundError('Comment tidak ditemukan');
    }

    await this._commentRepository.checkCommentOwnership(commentId, userId);

    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
