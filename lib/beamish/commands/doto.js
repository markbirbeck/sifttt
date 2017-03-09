exports.command = 'DoTo [modulePath]';
exports.desc = 'Specify a doto function to run on each item in the stream';
exports.builder = (yargs) => {
  return yargs.commandDir('doto_cmds');
}
exports.handler = (/*argv*/) => { }
