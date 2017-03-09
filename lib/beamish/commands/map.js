exports.command = 'Map [modulePath]';
exports.desc = 'Specify a map function to run on each item in the stream';
exports.builder = (yargs) => {
  return yargs.commandDir('map_cmds');
}
exports.handler = (/*argv*/) => { }
