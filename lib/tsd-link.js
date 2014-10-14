var fs = require("fs");
var json = require("json5");
var argParser = require("./arguments");
var path = require("path");
var _ = require("lodash");
var beautify = require('js-beautify').js_beautify;
var mkdirp = require('mkdirp');

function run() {
    var fileNames = [];
    var owning = false;
    var config = "tsd.json";
    var isWindows = process.platform === 'win32';

    var home = isWindows ? process.env.USERPROFILE : process.env.HOME;

    var cacheRoot = process.platform === "win32" && process.env.APPDATA || home;
    var tsdHome = path.resolve(cacheRoot, "tsd");
    if (!fs.existsSync(tsdHome)) {
        fs.mkdirSync(tsdHome);
    }

    var tsdFile = fs.readFileSync(config, 'utf8');
    var tsd = json.parse(tsdFile);
    var tsdPath = tsd.path = tsd.path || "typings";

    function ownType(fileName) {
        var defPath = path.resolve(tsdPath, fileName, fileName + ".d.ts");
        var profileDefPath = path.resolve(tsdHome, fileName, fileName + ".d.ts");
        if (!fs.existsSync(defPath)) {
            console.error("Unable to find file %s", defPath);
            return false;
        }
        makeLink(defPath, profileDefPath);
        return true;
    }

    function dependFile(fileName) {
        var defPath = path.resolve(tsdPath, fileName, fileName + ".d.ts");
        var profileDefPath = path.resolve(tsdHome, fileName, fileName + ".d.ts");

        if (!fs.existsSync(profileDefPath)) {
            console.error("Unable to find file %s", profileDefPath);
            return false;
        }
        makeLink(profileDefPath, defPath);
        return true;
    }

    var options = {
        config: "tsd.json",
        owning: false
    };

    function setOption(name, value) {
        if (value === null)
            value = true;
        options[name] = value;
    }

    function main() {
        if (owning) {
            var owned = _.isObject(tsd.owned) && tsd.owned || {};
            fileNames.forEach(function (fileName) {
                if (ownType(fileName))
                    owned[fileName] = {};
            });

            tsd.owned = owned;
        } else {
            var dependencies = _.isObject(tsd.dependencies) && tsd.dependencies || {};

            fileNames.forEach(function (fileName) {
                if (dependFile(fileName))
                    dependencies[fileName] = {};
            });

            tsd.dependencies = dependencies;
        }
        fs.writeFileSync(config, beautify(json.stringify(tsd), { indent_size: 2 }));
    }

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

    argParser.parse([
        {
            'name': /^(-u|--update)$/,
            'expected': /^(a|all|o|own|d|dep|dependencies)?$/,
            'callback': function (option) {
                if (!option)
                    option = 'a';
                setOption("update", option[0]);
            }
        },
        {
            'name': /^(-h|--help|)$/,
            'expected': null,
            'callback': printHelp
        },
        {
            'name': /^(-o|--own)$/,
            'expected': null,
            'callback': setOption.bind(null, "owning")
        },
        {
            'name': /^(-c|--config)$/,
            'expected': /^\w[\w\-_\d]*(\.json)?$/i,
            'callback': function (file) {
                setOption("config", file + file.endsWith('.json') ? "" : ".json");
            }
        }
    ], {
        after: main,
        noMatch: fileNameCallback
    });

    function printHelp() {
        var l = console.log;
        l("Create links between typescript definition files (*.d.ts)");
        l("  accross multiple project on a local machine.");
        l("  Use when definition files can change often. Otherwise simply use tsd.");
        l("  ");
        l("  A owned definition is a definition updated by this project.");
        l("  A dependent definition is a definition require by this ");
        l("  project and maintained by an other");
        l("  ");

        l("Usage: tsd-link [action] [-c tsd.json] [-h]");
        l("  link: link [-o] definitionName[]");
        l("    creates a dependency between a distant definition and this project");
        l("      -o : --own, own a definition file, the distant link will point here");
        l("      definitionName[]: list of definitions to own");
        l("  ");
        l("  update: update [a|o|d]");
        l("    update links to definition");
        l("      a|all : update owned and dependent definitions links");
        l("      o|own : update only owned definitions");
        l("      d|dep : update only dependent definitions");
        l("  ");
        l("  -c : --config, define a config file to use. Default: tsd.json");
        l("  ");
        l("  -h : --help, display this help");
        process.exit(0);
    }

    function updateParam(option) {
        // update owner
        if (option == 'o' || option == 'a') {
            var ownedFiles = Object.keys(tsd.owned);
            ownedFiles.forEach(function (fileName) {
                ownType(fileName);
            });
        }
        if (option == 'd' || option == 'a') {
            var depFiles = Object.keys(tsd.dependencies);
            depFiles.forEach(function (fileName) {
                dependFile(fileName);
            });
        }
    }

    function fileNameCallback(name, defaultCallback) {
        if (/^\w[\w\-_\d]*$/.test(name)) {
            fileNames.push(name);
            return true;
        }
        defaultCallback(name);
        return false;
    }
}
exports.run = run;
