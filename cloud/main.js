var util = require('util');
var thumb=require("./thumb.js");
/* main.js
 * All calls here are publicly exposed as REST API endpoints.
 * - all parameters must be passed in a single JSON paramater.
 * - the return 'callback' method signature is 'callback (error, data)', where 'data' is a JSON object.
*/

/* 'getConfig' server side REST API method.
 * Trivial example of pulling in a shared config file.
 */
exports.getConfig = function(params, callback) {
  console.log("In getConfig() call");
  var cfg = require("config.js");
  return callback(null, {config: cfg.config});
};

exports.thumbgen=function(params,cb){
    thumb.generateFromFilePath(__dirname+"/test.pdf","/tmp/test.png",function(){
        cb(null,{"done":"ok"});
    });
}