var mkdirp = require("mkdirp");
var rmdir = require("rimraf");
var fs = require("fs");
var path = require("path");
var json = require("json5");
var beautify = require('js-beautify').js_beautify;
var chain = require("slide").chain;
var error = require("error/option");

function existsChain(to, stopOnFalse, cb) {
    fs.exists(to, function (exists) {
        cb(stopOnFalse && !exists, exists);
    });
}

function makeLink(from, to, cb) {
    var dir = path.dirname(to);

    var printLink = function (err, res) {
        if (err) {
            console.error(err);
            cb(err);
            return;
        }

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
                cb(null);
            }
        };
        fs.lstat(to, lstatCb.bind(null, to));
    };

    chain([
        [existsChain, dir, false],
        [function (exists, cb) {
                if (exists) {
                    chain([
                        [existsChain, to, true],
                        [fs, "lstat", to],
                        [function (stat, cb) {
                                if (!stat.isSymbolicLink()) {
                                    rmdir(to, function (err) {
                                        cb(err, true);
                                    });
                                } else {
                                    fs.unlink(to, function (err) {
                                        cb(err, true);
                                    });
                                }
                            }, chain.last]
                    ], function () {
                        cb();
                    });
                    return;
                }
                mkdirp(dir, function (err) {
                    cb(err);
                });
            }, chain.last],
        [fs, "symlink", from, to, "junction"]
    ], printLink);
}
exports.makeLink = makeLink;

function makePathToDefFile(root, fileName) {
    return path.resolve(root, fileName);
}
exports.makePathToDefFile = makePathToDefFile;

function ownFile(tsdHome, tsdDefRoot, fileName, cb) {
    exports.makeLinkBase(tsdDefRoot, tsdHome, fileName, cb);
}
exports.ownFile = ownFile;

function dependFile(tsdHome, tsdDefRoot, fileName, cb) {
    exports.makeLinkBase(tsdHome, tsdDefRoot, fileName, cb);
}
exports.dependFile = dependFile;

function makeLinkBase(srcRoot, destRoot, fileName, cb) {
    var srcPath = exports.makePathToDefFile(srcRoot, fileName);
    var dstPath = exports.makePathToDefFile(destRoot, fileName);

    if (!fs.existsSync(srcPath)) {
        console.error("Unable to find folder %s", srcPath);
        cb(error());
    }
    exports.makeLink(srcPath, dstPath, cb);
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
    if (!fs.existsSync(tsdConfigFile.dir)) {
        mkdirp.sync(tsdConfigFile.dir);
    }
    fs.writeFileSync(tsdConfigFile.path, beautify(json.stringify(tsdConfigFile.content), { indent_size: 2 }));
}
exports.updateConfigFile = updateConfigFile;
