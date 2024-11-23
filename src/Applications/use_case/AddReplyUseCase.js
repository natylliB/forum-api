const Reply = require("../../Domains/replies/entities/Reply");

class AddReplyUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ thread_id, comment_id, content, owner, date }) {
    const newReply = new Reply({ comment_id, content, owner, date })

    await this._threadRepository.checkThreadAvailability(thread_id);
    
    await this._commentRepository.checkCommentAvailabilityInThread(comment_id, thread_id);

    const addedReply = await this._replyRepository.addReply(newReply);

    return addedReply;
  }
}

module.exports = AddReplyUseCase;
