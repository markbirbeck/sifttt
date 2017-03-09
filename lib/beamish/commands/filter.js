exports.command = 'Filter [filter]';
exports.desc = 'Specify a filter function to run on each item in the stream';
exports.builder = (yargs) => {
  return yargs.commandDir('filter_cmds');
}
exports.handler = (/*argv*/) => { }
