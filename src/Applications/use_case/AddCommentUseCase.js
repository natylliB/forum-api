const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;

    this.execute = this.execute.bind(this);
  }

  async execute(payload) {
    const newComment = new NewComment(payload);
    console.log(newComment);
    const isThreadAvailable = await this._threadRepository.isThreadAvailable(newComment.thread_id);
    if (!isThreadAvailable) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
    const addedComment = await this._commentRepository.addComment(newComment);
    return addedComment;
  }
}

module.exports = AddCommentUseCase;
