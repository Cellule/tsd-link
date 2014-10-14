import utils = require("../utils");
var _ = require("lodash");


class ActionLink implements TsdLink.IAction {
  run(config: TsdLink.Configuration) {
    var tsdFile = utils.readConfigFile(config.configFile);
    var tsd = tsdFile.content;
    var owning = config.link.owning;
    var fileNames = config.link.files;

    if(owning){
      var owned = _.isObject(tsd.owned) && tsd.owned || {};
      fileNames.forEach(function(fileName){
        if(utils.ownFile(config.tsdHome, tsdFile.definitionPath, fileName)) {
          owned[fileName] = {};
        }
      });

      tsd.owned = owned;
    } else {
      var dependencies = _.isObject(tsd.dependencies) && tsd.dependencies || {};

      fileNames.forEach(function(fileName){
        if(utils.dependFile(config.tsdHome, tsdFile.definitionPath,fileName)) {
          dependencies[fileName] = {};
        }
      });

      tsd.dependencies = dependencies;
    }
    utils.updateConfigFile(tsdFile);
    return true;
  }
}

var actionLink: TsdLink.IAction = new ActionLink();
export = actionLink;
