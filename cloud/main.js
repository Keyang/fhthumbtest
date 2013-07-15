var util = require('util');
var thumb=require("./thumb.js");
var async=require("async");
/* main.js
 * All calls here are publicly exposed as REST API endpoints.
 * - all parameters must be passed in a single JSON paramater.
 * - the return 'callback' method signature is 'callback (error, data)', where 'data' is a JSON object.
*/
var count=0;
function _genThumbnailFunc(){
    return function (cb){
        count++;
        console.log("Start time:"+count);
        thumb.generateFromFilePath(__dirname+"/test.pdf","/tmp/test.png",function(){
            console.log("finished time:"+count);
            cb(null,{"done":"ok"});
        });
  }
}

/* 'getConfig' server side REST API method.
 * Trivial example of pulling in a shared config file.
 */
exports.getConfig = function(params, callback) {
  console.log("In getConfig() call");
  var cfg = require("config.js");
  return callback(null, {config: cfg.config});
};

exports.thumbgen=function(params,cb){
    var genThumbnailFunc=[];
    console.log("called");
    count=0;
    for (var i=0;i<100;i++){
        genThumbnailFunc.push(_genThumbnailFunc());
    }
    console.log("ready to go");
    async.series(genThumbnailFunc,function(){
        cb(null,{"done":"ok"});
    });
}