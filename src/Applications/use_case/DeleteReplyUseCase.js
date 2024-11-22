const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");

class DeleteReplyUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;

    this.execute = this.execute.bind(this);
  }

  async execute({
    threadId,
    commentId,
    replyId,
    owner
  }) {
    // check if thread is available
    const isThreadAvailable = await this._threadRepository.isThreadAvailable(threadId);
    if (!isThreadAvailable) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    // check if the comment of the replies is in the mentioned thread
    const isCommentAvailableInThread = await this._commentRepository.isCommentAvailableInThread(commentId, threadId);
    if (!isCommentAvailableInThread) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    // check if the said reply available in the comment
    const isReplyAvailableInComment = await this._replyRepository.isReplyAvailableInComment(replyId, commentId);
    if (!isReplyAvailableInComment) {
      throw new NotFoundError('Balasan komentar tidak ditemukan');
    }

    // check if this owner is authorized to modify the reply
    const isReplyOwnerValid = await this._replyRepository.isReplyOwnerValid(replyId, owner);
    if (!isReplyOwnerValid) {
      throw new AuthorizationError('Anda tidak berhak untuk mengubah balasan komentar ini');
    }

    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;