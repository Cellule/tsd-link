var fs = require("fs");
var json = require("json5");
var arguments = require("./arguments");
var osenv = require("osenv");
var path = require("path");
var _ = require("lodash");
var chain = require("slide").chain;
var beautify = require('js-beautify').js_beautify

var fileNames = [];
var owning = false;
var config = "tsd.json";

function printHelp(end){
  console.log('----------\nA pretty help message.');
  end();
}

function ownTypingFile(end){
  owning = true;
  end();
}

function setConfigFile(end, file){
  config = file + file.endsWith('.json') ? "" : ".json";

  end();
}

function fileNameCallback(name, defaultCallback){

  if(/^\w[\w\-\d]*$/.test(name)){
    fileNames.push(name);
    return true;
  }
  defaultCallback(name);
  return false;
}

var home = osenv.home()
var cacheRoot = process.platform === "win32" && process.env.APPDATA || home
var tsdHome = path.resolve(cacheRoot,"tsd");
if(!fs.existsSync(tsdHome)){
  fs.mkdirSync(tsdHome);
}

var tsdFile = fs.readFileSync(config,'utf8');
var tsd = json.parse(tsdFile);
var tsdPath = tsd.path = tsd.path || "typings";

function main(){

  if(owning){
    var owners = _.isObject(tsd.owners) && tsd.owners || {};
    fileNames.forEach(function(fileName){
      var defPath = path.resolve(tsdPath,fileName,fileName+".d.ts");
      var profileDefPath = path.resolve(tsdHome,fileName,fileName+".d.ts");
      if(!fs.existsSync(defPath)){
        console.error("Unable to find file %s", defPath);
        return;
      }
      makeLink(defPath,profileDefPath);
      owners[fileName] = {};
    });

    tsd.owners = owners;
  } else {
    var dependencies = _.isObject(tsd.dependencies) && tsd.dependencies || {};

    fileNames.forEach(function(fileName){
      var defPath = path.resolve(tsdPath,fileName,fileName+".d.ts");
      var profileDefPath = path.resolve(tsdHome,fileName,fileName+".d.ts");

      if(!fs.existsSync(profileDefPath)){
        console.error("Unable to find file %s", profileDefPath);
        return;
      }
      makeLink(profileDefPath,defPath);
      dependencies[fileName] = {};
    });


    tsd.dependencies = dependencies;
  }
  fs.writeFileSync(config, beautify(json.stringify(tsd), { indent_size: 2}) );
}

function makeLink(from, to){
  var dir = path.dirname(to);
  if(fs.existsSync(dir)){
    if(fs.existsSync(to)){
      fs.unlinkSync(to);
    }
  } else {
    fs.mkdirSync(dir);
  }
  fs.link(from,to);
}


arguments.parse([
     {'name': /^(-h|--help|)$/, 'expected': null, 'callback': printHelp}
    ,{'name': /^(-o|--own)$/, 'expected': null, 'callback': ownTypingFile}
    ,{'name': /^(-c|--config)$/, 'expected': /^\w[\w\-\d]*(\.json)?$/i, 'callback': setConfigFile}
  ], {
    after:main,
    noMatch:fileNameCallback
  });



