exports.command = 'sink [sink]';
exports.desc = 'Specify a sink stream';
exports.builder = (yargs) => {
  return yargs.commandDir('sink_cmds');
}
exports.handler = (/*argv*/) => { }
