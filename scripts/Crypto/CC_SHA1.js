'use strict';

var sha1_data;
var sha1_digest;

var hexify = function (hexdump_output) {
  var hexified = " ";
  var raw_array = hexdump_output.split("\n");
  for (var a = 0; a < raw_array.length; a++) {
    var line_array = raw_array[a].split(" ");
    for (var b = 1; b < line_array.length - 1; b++) {
      if(line_array[b].length === 2){
        hexified += line_array[b];
        hexified = hexified.trim()
      }
    }
  };
  return hexified;
};

Interceptor.attach(Module.findExportByName('libcommonCrypto.dylib', 'CC_SHA1'), {
  onEnter: function(args) {
    var data = hexify(hexdump(args[0], {
      length: args[1].toInt32()
    }));
    sha1_data = data;
  },
  
  onLeave: function(retval) {
    var SHA1 = hexify(hexdump(retval, {
      length: 20
    }));
    sha1_digest = SHA1;

    /*   --- Payload Header --- */
    var send_data = {};
    send_data.time = new Date();
    send_data.txnType = 'SHA1 Hash';
    send_data.lib = 'libcommonCrypto.dylib';
    send_data.method = 'CC_SHA1';
    send_data.artifact = [];
    
    /*   --- Payload Body --- */
    var data = {};
    data.name = "SHA1 Data";
    data.value = sha1_data;
    data.argSeq = 2;
    send_data.artifact.push(data);
    
    /*   --- Payload Body --- */
    var data = {};
    data.name = "SHA1 Digest";
    data.value = sha1_digest;
    data.argSeq = 3;
    send_data.artifact.push(data);
    
    send(JSON.stringify(send_data));
  }
});
