var mkdirp = require("mkdirp");
var rmdir = require("rimraf");
var fs = require("fs");
var path = require("path");
var json = require("json5");
var beautify = require('js-beautify').js_beautify
var chain = require("slide").chain;
var error = require("error/option");

function existsChain(to, stopOnFalse, cb){
  fs.exists(to, function(exists){
    cb(stopOnFalse && !exists, exists);
  })
}

export function makeLink(from, to, cb){

  var dir = path.dirname(to);

  var printLink = function(err, res){
    if(err) {
      cb(err);
      return;
    }

    var linkList = [to];
    var lstatCb =  function(file, err, stats){
      if(err){
        console.error("Link target %s not found", file);
        return;
      }
      if(stats.isSymbolicLink()){
        fs.readlink(file, function(err, linkString){
          linkList.push(linkString);
          fs.lstat(linkString, lstatCb.bind(null,linkString));
        });
      } else {
        console.log(linkList.join(" -> "));
        cb(null);
      }
    }
    fs.lstat(to,lstatCb.bind(null,to));

  }

  chain([
    [existsChain, dir, false],
    [function(exists, cb){
      if(exists){
        chain([
          [existsChain, to, true],
          [fs, "lstat", to],
          [function(stat, cb){
            if(!stat.isSymbolicLink()){
              rmdir(to, function(err){
                cb(err,true);
              });
            } else {
              fs.unlink(to, function(err){
                cb(err,true);
              });
            }
          }, chain.last]
        ], function(){cb();} );
        return;
      }
      mkdirp(dir, function(err){
        cb(err);
      });
    }, chain.last],
    [fs, "symlink", from, to, "junction"]
  ], printLink);

}

export function makePathToDefFile(root: string, fileName: string){
  return path.resolve(root,fileName);
}

export function ownFile(tsdHome: string, tsdDefRoot: string, fileName: string, cb: Function){
  makeLinkBase(tsdDefRoot, tsdHome, fileName, cb);
}

export function dependFile(tsdHome: string, tsdDefRoot: string, fileName: string, cb: Function){
  makeLinkBase(tsdHome, tsdDefRoot, fileName, cb);
}

export function makeLinkBase(srcRoot: string, destRoot: string, fileName: string, cb: Function){
  var srcPath = makePathToDefFile(srcRoot, fileName);
  var dstPath = makePathToDefFile(destRoot, fileName);

  if(!fs.existsSync(srcPath)){
    console.error("Unable to find folder %s", srcPath);
    cb(error())
  }
  makeLink(srcPath,dstPath, cb);
}

export function makeTsdConfigFileBase(pathToFile: string){
  var resolvedPath = path.resolve(pathToFile);
  var defPath = "typings";
  var dir = path.dirname(resolvedPath);

  var tsdConfigFile: TsdLink.TsdConfigFile = {
    fileName: path.basename(resolvedPath),
    dir: dir,
    path: resolvedPath,
    content: {},
    definitionPath: path.resolve(dir,defPath),
  }
  return tsdConfigFile;
}

export function readConfigFile(pathToFile: string, dontThrowOnError?: boolean){
  var resolvedPath = path.resolve(pathToFile);
  var tsdFile;
  try {
    tsdFile = fs.readFileSync(resolvedPath,'utf8');
  } catch(e) {
    if(!dontThrowOnError) throw e;
    return null;
  }
  var content = json.parse(tsdFile) || {};

  var tsdConfigFile = makeTsdConfigFileBase(pathToFile);
  tsdConfigFile.content = content;
  if(content.path){
    tsdConfigFile.definitionPath = path.resolve(tsdConfigFile.dir,content.path);
  }

  return tsdConfigFile;
}

export function updateConfigFile(tsdConfigFile: TsdLink.TsdConfigFile){
  fs.writeFileSync(tsdConfigFile.path, beautify(json.stringify(tsdConfigFile.content), { indent_size: 2}) );
}
