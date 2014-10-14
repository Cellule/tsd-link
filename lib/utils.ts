var mkdirp = require('mkdirp');
var fs = require("fs");
var path = require("path");
var json = require("json5");
var beautify = require('js-beautify').js_beautify

export function makeLink(from, to){
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

export function makePathToDefFile(root: string, fileName: string){
  return path.resolve(root,fileName,fileName+".d.ts");
}

export function ownFile(tsdHome: string, tsdDefRoot: string, fileName: string){
  return makeLinkBase(tsdDefRoot, tsdHome, fileName);
}

export function dependFile(tsdHome: string, tsdDefRoot: string, fileName: string){
  return makeLinkBase(tsdHome, tsdDefRoot, fileName);
}

export function makeLinkBase(srcRoot: string, destRoot: string, fileName: string){
  var srcPath = makePathToDefFile(srcRoot, fileName);
  var dstPath = makePathToDefFile(destRoot, fileName);

  if(!fs.existsSync(srcPath)){
    console.error("Unable to find file %s", srcPath);
    return false;
  }
  makeLink(srcPath,dstPath);
  return true;
}

export function readConfigFile(pathToFile: string){
  var resolvedPath = path.resolve(pathToFile);
  var tsdFile;
  try {
    tsdFile = fs.readFileSync(resolvedPath,'utf8');
  } catch(e) {
    return null;
  }
  var content = json.parse(tsdFile);
  var defPath = content.path = content.path || "typings";
  var dir = path.dirname(resolvedPath);

  var tsdConfigFile: TsdLink.TsdConfigFile = {
    fileName: path.basename(resolvedPath),
    dir: dir,
    path: resolvedPath,
    content: content,
    definitionPath: path.resolve(dir,defPath),
  }
  return tsdConfigFile;
}

export function updateConfigFile(tsdConfigFile: TsdLink.TsdConfigFile){
  fs.writeFileSync(tsdConfigFile.path, beautify(json.stringify(tsdConfigFile.content), { indent_size: 2}) );
}
