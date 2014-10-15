import utils = require("../utils");
var _ = require("lodash");


class ActionUpdate implements TsdLink.ActionUpdate {

  run(config: TsdLink.Configuration) {
    return this.doUpdate(config.configFile, config.update.mode, config.tsdHome);
  }

  doUpdate(configFile: string, mode: string, tsdHome: string){
    var tsdFile = <TsdLink.TsdDefinitionFile>utils.readConfigFile(configFile);
    var tsd = tsdFile.content;

    // update owner
    if(
      (mode == 'o' || mode == 'a') &&
      _.isObject(tsd.owned)
    ){
      var ownedFiles = Object.keys(tsd.owned);
      ownedFiles.forEach(function(fileName){
        utils.ownFile(tsdHome, tsdFile.definitionPath, fileName)
      });
    }
    if(
      (mode == 'd' || mode == 'a') &&
      _.isObject(tsd.dependencies)
    ){
      var depFiles = Object.keys(tsd.dependencies);
      depFiles.forEach(function(fileName){
        utils.dependFile(tsdHome, tsdFile.definitionPath,fileName)
      });
    }
    return true;
  }
}

var actionUpdate: TsdLink.ActionUpdate = new ActionUpdate();
export = actionUpdate;

