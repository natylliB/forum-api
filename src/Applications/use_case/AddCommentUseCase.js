class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;

    this.execute = this.execute.bind(this);
  }

  async execute({ thread_id, content, owner, date }) {
    // Check thread availability
    await this._threadRepository.checkThreadAvailability(thread_id);

    const addedComment = await this._commentRepository.addComment({
      thread_id,
      content,
      owner,
      date,
    });
    
    return addedComment;
  }
}

module.exports = AddCommentUseCase;
