//module interfaces
exports.generateFromFilePath=generateFromFilePath;
exports.getTmpFolder=getTmpFolder;

//implementaion
var im = require('imagemagick');
var pdfGenTmp="/tmp/pdfThumbnailGenTmp";
var fs=require("fs");
var path=require("path");
//tweak for node 0.6 -
if (!fs.exists){
    fs.exists=path.exists;
    fs.existsSync=path.existsSync;
}


var util = require('util');

var maximumWH=286;
function getTmpFolder(){
    return pdfGenTmp;
}
function generateFromFilePath(pdfFilePath,targetPath,cb){
    if (cb===undefined){
        cb=targetPath;
        targetPath=undefined;
    }
    
    if (path.extname(pdfFilePath).toLowerCase()===".pdf"){
        _initTmpFolder(function(){
            _convertPDFToPNG(pdfFilePath,function(err,firstPagePath){
                if (err){
                    console.error(err);
                    return cb(err);
                }
                _resizeToThumbNail(firstPagePath,function(err,targetThumbNail){
                    if (err){
                        console.error(err);
                        return cb(err);
                    }
                    if (!targetPath){
                        targetPath=targetThumbNail.replace(".targetpng","");
                    }
                    _moveFile(targetThumbNail,targetPath,function(err){
                        _deleteFolderRecursive(pdfGenTmp);
                        if (err){
                            console.error(err);
                            return cb(err);
                        }
                        cb(null,targetPath);
                    });
                });
            });
        });
    }else{
        cb("PDF Thumbnail generator: Not pdf file:"+pdfFilePath);
    }
}
function _deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                _deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function _moveFile(oriPath,targetPath,cb){
    if (fs.existsSync(targetPath)){
        fs.unlinkSync(targetPath);
    }
   var is = fs.createReadStream(oriPath)
    var os = fs.createWriteStream(targetPath);

    util.pump(is, os, function() {
        fs.unlinkSync(oriPath);
        cb();
    });
}

function _initTmpFolder(cb){
    //TODO clean tmp folder before using it.
    fs.exists(pdfGenTmp,function(exists){
        if (!exists){
            fs.mkdir(pdfGenTmp,cb)
        }else{
            cb();
        }
    });
}



function _convertPDFToPNG(pdfFile,cb){
    var baseName=_getBaseName(pdfFile);
    var targetFile=pdfGenTmp+"/"+baseName+".png";
    im.convert([pdfFile, '-alpha', 'off', targetFile],function(err,stdout){
        if (err){
            cb(err);
        }else{
            var firstPagePNG=targetFile;
            if (fs.existsSync(targetFile)){
            }else{
                var guessFileName=pdfGenTmp+"/"+baseName+"-0.png";
                if (fs.existsSync(guessFileName)){
                    firstPagePNG=guessFileName;
                }
            }
            cb(null,firstPagePNG);
        }
    });
}

function _resizeToThumbNail(pngFile,cb){
    _getDimension(pngFile,function(err,op){
        if (err){
            console.error(err);
            cb(err);
        }else{
            var width=op.width;
            var height=op.height;
            var targetFile=pngFile+".targetpng";
            var args={
                "srcPath":pngFile,
                "dstPath":targetFile
            }
            if (width<height){
                args['height']=maximumWH;
                im.resize(args,function(err){
                    cb(err,targetFile);
                });
            }else{
                args['width']=maximumWH;
                im.resize(args,function(err){
                    cb(err,targetFile);
                });
            }
        }
    });
}
function _getDimension(pngFile,cb){
    im.identify(pngFile,cb);
}
function _getBaseName(pdfFile){
    var ext=path.extname(pdfFile);
    if (ext===".PDF"){
        return path.basename(pdfFile,".PDF");    
    }else{
        return path.basename(pdfFile,".pdf");
    }
    
}
