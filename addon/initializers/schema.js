import Schema from '../schema';

export default function(container, application) {
    application.register('schema:main', Schema);
    application.inject('controller', 'schema', 'schema:main');
    application.inject('route', 'schema', 'schema:main');
}