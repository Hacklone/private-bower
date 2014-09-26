var spawn = require('child_process').spawn

module.exports=function(command, args, callback) {
  var proc = spawn(command, args);
  var stdout = "";
  var stderr = "";

  proc.stdout.on('data', function(data) {
    stdout += data;
  });
  proc.stderr.on('data', function(data) {
    stderr += data;
  });
  proc.on('close', function(code) {
    callback(code, stdout, stderr);
  });

  return proc;
};
