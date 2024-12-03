const routes = (handler) => ([
  {
    method: 'GET',
    path: '/',
    handler: handler.getGreetingHandler,
  },
]);

module.exports = routes;