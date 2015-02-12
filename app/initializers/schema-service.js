export function initialize(container, application) {
  application.inject('route', 'schema', 'service:schema');
}

export default {
  name: 'schema-service',
  initialize: initialize
};
