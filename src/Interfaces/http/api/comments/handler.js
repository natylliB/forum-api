const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
    
    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { content } = request.payload;
    const owner = request.auth.credentials.id;
    const thread_id = request.params.threadId;
    
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    const addedComment = await addCommentUseCase.execute({ thread_id, content, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      }
    });
    response.code(201);
    return response;
  }
}

module.exports = CommentsHandler;