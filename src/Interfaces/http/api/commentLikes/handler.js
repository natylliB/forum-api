const PutCommentLikeUseCase = require("../../../../Applications/use_case/PutCommentLikeUseCase");

class CommentLikesHandler {
  constructor(container) {
    this._container = container;

    this.putCommentLikeHandler = this.putCommentLikeHandler.bind(this);
  }

  async putCommentLikeHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;

    const putCommentLikeUseCase = this._container.getInstance(PutCommentLikeUseCase.name);
    
    await putCommentLikeUseCase.execute({
      threadId,
      commentId,
      userId,
    });

    const response = h.response({
      status: 'success',
    });

    return response;
  }
}

module.exports = CommentLikesHandler;