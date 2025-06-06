// eslint-disable-next-line @typescript-eslint/no-require-imports
const ReplaceServers = require('./decorators/replace-servers-url');
const id = 'servers';

/** @type {import('@redocly/cli').DecoratorsConfig} */
const decorators = {
  oas3: {
    'replace-servers-url': ReplaceServers,
  },
};

module.exports = {
  id: id,
  decorators: decorators,
};
