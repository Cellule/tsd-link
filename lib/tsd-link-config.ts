import argParser = require("./argParser");
import _ = require("lodash");
var path = require("path");
require('string.prototype.endswith');

export class ConfigParser {
  public config: TsdLink.Configuration;
  constructor(){
    var isWindows = process.platform === 'win32';
    var home = isWindows ?
      process.env.USERPROFILE
    : process.env.HOME;
    home = process.platform === "win32" && process.env.APPDATA || home
    var tsdHome = path.resolve(home,"tsd");

    this.config = {
      action: "link",
      link: {
        owning: false,
        files: []
      },
      isWindows: isWindows,
      home: home,
      tsdHome: tsdHome,
      configFile: "tsd.json"
    };
  }

  parseArguments(cb: (config: TsdLink.Configuration) => void){
    var res = argParser.parseArguments([
      new argParser.ValidArguments(
        /^link$/,
        this.setAction.bind(this,"link")
      ),
      new argParser.ValidArguments(
        /^update$/,
        this.setAction.bind(this,"update"),
        /^(a|all|o|own|d|dep|dependencies)?$/
      ),
      new argParser.ValidArguments(
        /^(-h|--help|help)$/,
        this.printHelp
      ),
      new argParser.ValidArguments(
        /^(-o|--own)$/,
        this.setConfig.bind(this,["link","owning"])
      ),
      new argParser.ValidArguments(
        /^(-c|--config)$/,
        this.setConfig.bind(this,["configFile"]),
        /^\w[\w\-_\d]*(\.json)?$/i
      ),

    ], {
      noMatch:this.fileNameCallback.bind(this)
    });
    if(!res) return null;
    cb(this.config);
  }

  private setConfig(optionPath: string[], arg) {
    if(arg === null) arg = true;

    var config = this.config;
    var l = optionPath.length;
    for(var i = 0; i<l-1; ++i){
      var opt = optionPath[i];

      if(!_.isObject(config[opt])){
        config[opt] = {};
      }

      config = config[opt];
    }
    config[optionPath.pop()] = arg;

    return true;
  }

  private setAction(action, arg) {

    this.config.action = action;
    switch(action){
      case "link":
      break;
      case "update":
        this.config.update = {
          mode: arg ? arg[0] : 'a'
        }
      break;
    }
    return true;
  }

  private fileNameCallback(name, defaultCallback){
    if(/^\w[\w\-_\d]*$/.test(name)){
      this.config.link.files.push(name);
      return true;
    }
    defaultCallback(name);
    return false;
  }

  printHelp() {
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
    return false;
  }
}
