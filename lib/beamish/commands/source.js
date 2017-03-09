exports.command = 'source [source]';
exports.desc = 'Specify a source stream';
exports.builder = (yargs) => {
  return yargs.commandDir('source_cmds');
}
exports.handler = (/*argv*/) => { }
