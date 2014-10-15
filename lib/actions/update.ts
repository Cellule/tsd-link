import utils = require("../utils");
import _ = require("lodash");
import each = require("async-each");
var chain = require("slide").chain;

class ActionUpdate implements TsdLink.ActionUpdate {

  run(config: TsdLink.Configuration) {
    return this.doUpdate(config.configFile, config.update.mode, config.tsdHome, function(){});
  }

  doUpdate(configFile: string, mode: string, tsdHome: string, updateDoneCallback: Function){
    var tsdFile = <TsdLink.TsdDefinitionFile>utils.readConfigFile(configFile);
    var tsd = tsdFile.content;
    var doOwnedFiles = (mode == 'o' || mode == 'a') && _.isObject(tsd.owned);
    var doDependentFiles = (mode == 'd' || mode == 'a') && _.isObject(tsd.dependencies);

    var update = function(target, fnc, next){
      var depFiles = Object.keys(tsd[target]);
      each(depFiles, function(fileName, cb){
        fnc(tsdHome, tsdFile.definitionPath,fileName, function(){
          // do next even if an error occured
          cb();
        });
      }, function(){
        next();
      });
    }

    chain([
      doOwnedFiles && [update, "owned", utils.ownFile],
      doDependentFiles && [update, "dependencies", utils.dependFile],
    ], updateDoneCallback)

    return true;
  }
}

var actionUpdate: TsdLink.ActionUpdate = new ActionUpdate();
export = actionUpdate;

