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
    
    await this._threadRepository.checkThreadAvailability(threadId);

    await this._commentRepository.checkCommentAvailabilityInThread(commentId, threadId);

    await this._replyRepository.checkReplyAvailabilityInComment(replyId, commentId);

    await this._replyRepository.checkReplyOwnership(replyId, owner);

    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;