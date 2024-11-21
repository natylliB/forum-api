const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
    
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { content } = request.payload;
    const owner = request.auth.credentials.id;
    const thread_id = request.params.threadId;
    const date = new Date().toISOString();
    
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    const addedComment = await addCommentUseCase.execute({ thread_id, content, owner, date });

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      }
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const { threadId, commentId } = request.params;
    const userId = request.auth.credentials.id;

    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

    await deleteCommentUseCase.execute(threadId, commentId, userId);

    const response = h.response({
      status: 'success',
    });

    return response;
  }
}

module.exports = CommentsHandler;
