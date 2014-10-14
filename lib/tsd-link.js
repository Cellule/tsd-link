var fs = require("fs");
var json = require("json5");
var arguments = require("./arguments");
var path = require("path");
var _ = require("lodash");
var beautify = require('js-beautify').js_beautify
var mkdirp = require('mkdirp');

var fileNames = [];
var owning = false;
var config = "tsd.json";



var isWindows = process.platform === 'win32';

var home = isWindows ?
  process.env.USERPROFILE
: process.env.HOME;

var cacheRoot = process.platform === "win32" && process.env.APPDATA || home
var tsdHome = path.resolve(cacheRoot,"tsd");
if(!fs.existsSync(tsdHome)){
  fs.mkdirSync(tsdHome);
}

var tsdFile = fs.readFileSync(config,'utf8');
var tsd = json.parse(tsdFile);
var tsdPath = tsd.path = tsd.path || "typings";

function ownType(fileName){
  var defPath = path.resolve(tsdPath,fileName,fileName+".d.ts");
  var profileDefPath = path.resolve(tsdHome,fileName,fileName+".d.ts");
  if(!fs.existsSync(defPath)){
    console.error("Unable to find file %s", defPath);
    return false;
  }
  makeLink(defPath,profileDefPath);
  return true;
}

function dependFile(fileName){
  var defPath = path.resolve(tsdPath,fileName,fileName+".d.ts");
  var profileDefPath = path.resolve(tsdHome,fileName,fileName+".d.ts");

  if(!fs.existsSync(profileDefPath)){
    console.error("Unable to find file %s", profileDefPath);
    return false;
  }
  makeLink(profileDefPath,defPath);
  return true;
}

function main(){

  if(owning){
    var owned = _.isObject(tsd.owned) && tsd.owned || {};
    fileNames.forEach(function(fileName){
      if(ownType(fileName)) owned[fileName] = {};
    });

    tsd.owned = owned;
  } else {
    var dependencies = _.isObject(tsd.dependencies) && tsd.dependencies || {};

    fileNames.forEach(function(fileName){
      if(dependFile(fileName)) dependencies[fileName] = {};
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
    mkdirp.sync(dir);
  }
  fs.link(from,to);
  console.log(from, " -> ", to);
}


arguments.parse([
     {'name': /^(-u|--update)$/, 'expected': /^(a|all|o|own|d|dep|dependencies)?$/, 'callback': updateParam}
    ,{'name': /^(-h|--help|)$/, 'expected': null, 'callback': printHelp}
    ,{'name': /^(-o|--own)$/, 'expected': null, 'callback': ownTypingFile}
    ,{'name': /^(-c|--config)$/, 'expected': /^\w[\w\-_\d]*(\.json)?$/i, 'callback': setConfigFile}
  ], {
    after:main,
    noMatch:fileNameCallback
  });

function printHelp(end){
  var l = console.log;
  l("Create links between typescript definition files (*.d.ts)");
  l("  accross multiple project on a local machine.");
  l("  Use when definition files can change often. Otherwise simply use tsd.");
  l("  ");
  l("  A owned definition is a definition updated by this project.");
  l("  A dependent definition is a definition require by this ");
  l("  project and maintained by an other");
  l("  ");

  l("Usage: tsd-link [-u [a|o|d]] [-o definitionName[]] [-c tsd.json] [-h]");
  l("  -u : --update, update links to definition");
  l("       a|all : update owned and dependent definitions links");
  l("       o|own : update only owned definitions");
  l("       d|dep : update only dependent definitions");
  l("  ");
  l("  -o : --own, own a definition file, create a distant link to this file");
  l("       definitionName[]: list of definitions to own");
  l("  ");
  l("  no option: creates a dependency between a distant definition and this project");
  l("       definitionName[]: list of definitions to own");
  l("  ");
  l("  -c : --config, define a config file to use. Default: tsd.json");
  l("  ");
  l("  -h : --help, display this help");
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

function updateParam(end, option){
  if(!option) option = 'a';
  option = option[0];

  // update owner
  if(option == 'o' || option == 'a'){
    var ownedFiles = Object.keys(tsd.owned);
    ownedFiles.forEach(function(fileName){
      ownType(fileName);
    });
  }
  if(option == 'd' || option == 'a'){
    var depFiles = Object.keys(tsd.dependencies);
    depFiles.forEach(function(fileName){
      dependFile(fileName);
    });
  }
}

function fileNameCallback(name, defaultCallback){

  if(/^\w[\w\-_\d]*$/.test(name)){
    fileNames.push(name);
    return true;
  }
  defaultCallback(name);
  return false;
}


