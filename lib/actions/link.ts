import utils = require("../utils");
import _ = require("lodash");
import each = require("async-each");

class ActionLink implements TsdLink.IAction {
  run(config: TsdLink.Configuration) {
    var tsdFile = <TsdLink.TsdDefinitionFile>utils.readConfigFile(config.configFile);
    var tsd = tsdFile.content;
    var owning = config.link.owning;
    var fileNames: string[] = config.link.files;

    var anyLinkDone = false;
    var target;
    var operation: (s1: string, s2: string, s3: string, cb: Function) => void;
    if(owning){
      target = "owned";
      operation = utils.ownFile;
    } else {
      target = "dependencies";
      operation = utils.dependFile;
    }

    var targetObj = _.isObject(tsd[target]) && tsd[target] || {};
    each(fileNames, function(fileName, cb){
      operation(config.tsdHome, tsdFile.definitionPath, fileName, function(err){
        if(!err){
          targetObj[fileName] = {};
          anyLinkDone = true;
        }
        cb();
      });
    }, function(err){
      if(anyLinkDone){
        tsd[target] = targetObj;
        utils.updateConfigFile(tsdFile);
      }
    });

    return true;
  }
}

var actionLink: TsdLink.IAction = new ActionLink();
export = actionLink;
