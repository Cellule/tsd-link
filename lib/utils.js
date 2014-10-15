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
    fs.symlink(from, to, "junction", function () {
        var linkList = [to];
        var lstatCb = function (file, err, stats) {
            if (err) {
                console.error("Link target %s not found", file);
                return;
            }
            if (stats.isSymbolicLink()) {
                fs.readlink(file, function (err, linkString) {
                    linkList.push(linkString);
                    fs.lstat(linkString, lstatCb.bind(null, linkString));
                });
            } else {
                console.log(linkList.join(" -> "));
            }
        };
        fs.lstat(to, lstatCb.bind(null, to));
    });
}
exports.makeLink = makeLink;

function makePathToDefFile(root, fileName) {
    return path.resolve(root, fileName);
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
        console.error("Unable to find folder %s", srcPath);
        return false;
    }
    exports.makeLink(srcPath, dstPath);
    return true;
}
exports.makeLinkBase = makeLinkBase;

function makeTsdConfigFileBase(pathToFile) {
    var resolvedPath = path.resolve(pathToFile);
    var defPath = "typings";
    var dir = path.dirname(resolvedPath);

    var tsdConfigFile = {
        fileName: path.basename(resolvedPath),
        dir: dir,
        path: resolvedPath,
        content: {},
        definitionPath: path.resolve(dir, defPath)
    };
    return tsdConfigFile;
}
exports.makeTsdConfigFileBase = makeTsdConfigFileBase;

function readConfigFile(pathToFile, dontThrowOnError) {
    var resolvedPath = path.resolve(pathToFile);
    var tsdFile;
    try  {
        tsdFile = fs.readFileSync(resolvedPath, 'utf8');
    } catch (e) {
        if (!dontThrowOnError)
            throw e;
        return null;
    }
    var content = json.parse(tsdFile) || {};

    var tsdConfigFile = exports.makeTsdConfigFileBase(pathToFile);
    tsdConfigFile.content = content;
    if (content.path) {
        tsdConfigFile.definitionPath = path.resolve(tsdConfigFile.dir, content.path);
    }

    return tsdConfigFile;
}
exports.readConfigFile = readConfigFile;

function updateConfigFile(tsdConfigFile) {
    fs.writeFileSync(tsdConfigFile.path, beautify(json.stringify(tsdConfigFile.content), { indent_size: 2 }));
}
exports.updateConfigFile = updateConfigFile;
