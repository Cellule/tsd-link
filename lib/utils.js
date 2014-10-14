var mkdirp = require('mkdirp');
var fs = require("fs");
var path = require("path");
var json = require("json5");
var beautify = require('js-beautify').js_beautify;

function makeLink(from, to) {
    var dir = path.dirname(to);
    if (fs.existsSync(dir)) {
        if (fs.existsSync(to)) {
            fs.unlinkSync(to);
        }
    } else {
        mkdirp.sync(dir);
    }
    fs.link(from, to);
    console.log(from, " -> ", to);
}
exports.makeLink = makeLink;

function makePathToDefFile(root, fileName) {
    return path.resolve(root, fileName, fileName + ".d.ts");
}
exports.makePathToDefFile = makePathToDefFile;

function ownFile(tsdHome, tsdDefRoot, fileName) {
    return exports.makeLinkBase(tsdDefRoot, tsdHome, fileName);
}
exports.ownFile = ownFile;

function dependFile(tsdHome, tsdDefRoot, fileName) {
    return exports.makeLinkBase(tsdHome, tsdDefRoot, fileName);
}
exports.dependFile = dependFile;

function makeLinkBase(srcRoot, destRoot, fileName) {
    var srcPath = exports.makePathToDefFile(srcRoot, fileName);
    var dstPath = exports.makePathToDefFile(destRoot, fileName);

    if (!fs.existsSync(srcPath)) {
        console.error("Unable to find file %s", srcPath);
        return false;
    }
    exports.makeLink(srcPath, dstPath);
    return true;
}
exports.makeLinkBase = makeLinkBase;

function readConfigFile(pathToFile) {
    var resolvedPath = path.resolve(pathToFile);
    var tsdFile;
    try  {
        tsdFile = fs.readFileSync(resolvedPath, 'utf8');
    } catch (e) {
        return null;
    }
    var content = json.parse(tsdFile);
    var defPath = content.path = content.path || "typings";
    var dir = path.dirname(resolvedPath);

    var tsdConfigFile = {
        fileName: path.basename(resolvedPath),
        dir: dir,
        path: resolvedPath,
        content: content,
        definitionPath: path.resolve(dir, defPath)
    };
    return tsdConfigFile;
}
exports.readConfigFile = readConfigFile;

function updateConfigFile(tsdConfigFile) {
    fs.writeFileSync(tsdConfigFile.path, beautify(json.stringify(tsdConfigFile.content), { indent_size: 2 }));
}
exports.updateConfigFile = updateConfigFile;
