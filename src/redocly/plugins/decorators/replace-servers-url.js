module.exports = ReplaceServers;

/** @type {import('@redocly/cli').OasDecorator} */

function ReplaceServers({ serverUrl }) {
  return {
    Root: {
      leave(root) {
        if (serverUrl) {
          root.servers = [{ url: serverUrl }];
        }
      },
    },
  };
}
