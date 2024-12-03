const routes = require('./routes');
const GreetingHandler = require('./handler');

module.exports = {
  name: 'greetings',
  register: async (server, { container }) => {
    const greetingHandler = new GreetingHandler(container);
    server.route(routes(greetingHandler));
  }
}