const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadDetailUseCase = require('../../../../Applications/use_case/GetThreadDetailUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler (request, h) {
    const owner = request.auth.credentials.id;
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const date = new Date().toISOString();
    const addedThread = await addThreadUseCase.execute({ ...request.payload, owner, date });

    const response = h.response({
      status: 'success',
      data: { addedThread }
    });
    response.code(201);
    return response;
  }

  async getThreadHandler (request, h) {
    const { threadId } = request.params;
    const getThreadDetailUseCase = this._container.getInstance(GetThreadDetailUseCase.name);
    const thread = await getThreadDetailUseCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: { thread },
    });
    return response;
  }
}

module.exports = ThreadsHandler;
