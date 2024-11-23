const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;

    this.execute = this.execute.bind(this);
  }

  async execute({ thread_id, content, owner, date }) {
    const newComment = new NewComment({
      thread_id,
      content,
      owner,
      date,
    });

    await this._threadRepository.checkThreadAvailability(newComment.thread_id);

    const addedComment = await this._commentRepository.addComment(newComment);
    
    return addedComment;
  }
}

module.exports = AddCommentUseCase;
