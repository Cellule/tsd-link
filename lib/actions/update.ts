import utils = require("../utils");
var _ = require("lodash");


class ActionUpdate implements TsdLink.IAction {
  owning: boolean;
  run(config: TsdLink.Configuration) {
    var tsdFile = <TsdLink.TsdDefinitionFile>utils.readConfigFile(config.configFile);
    var tsd = tsdFile.content;

    var mode = config.update.mode;
    // update owner
    if(
      (mode == 'o' || mode == 'a') &&
      _.isObject(tsd.owned)
    ){
      var ownedFiles = Object.keys(tsd.owned);
      ownedFiles.forEach(function(fileName){
        utils.ownFile(config.tsdHome, tsdFile.definitionPath, fileName)
      });
    }
    if(
      (mode == 'd' || mode == 'a') &&
      _.isObject(tsd.dependencies)
    ){
      var depFiles = Object.keys(tsd.dependencies);
      depFiles.forEach(function(fileName){
        utils.dependFile(config.tsdHome, tsdFile.definitionPath,fileName)
      });
    }
    return true;
  }
}

var actionUpdate: TsdLink.IAction = new ActionUpdate();
export = actionUpdate;

