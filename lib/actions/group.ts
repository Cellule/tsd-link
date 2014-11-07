import utils = require("../utils");
import _ = require("lodash");
import actionUpdate = require("./update");
import each = require("async-each");

var path = require("path");
var fs = require("fs");

class ActionGroup implements TsdLink.IAction {
  run(config: TsdLink.Configuration) {
    var groupFile = path.resolve(config.tsdHome,"tsd.json");
    var tsdFile = <TsdLink.TsdGroupFile>utils.readConfigFile(groupFile, true);
    if(!tsdFile) {
      tsdFile = utils.makeTsdConfigFileBase(groupFile);
    }

    var tsd = tsdFile.content;
    var groupName = config.group.groupName;
    var action = config.group.action;

    if(action === 's') {
      var configFilePath = path.resolve(config.configFile);
      if(fs.existsSync(configFilePath)) {
        if(!tsd[groupName]) tsd[groupName] = [];
        if(~tsd[groupName].indexOf(configFilePath)) {
          console.error("Config file %s already part of group %s", configFilePath, groupName);
          return false;
        }
        tsd[groupName].push(configFilePath);
        utils.updateConfigFile(tsdFile);
        console.log("Added file %s to group %s",configFilePath, groupName);
        return true;
      }

      console.error("Unable to find file %s", configFilePath);
    } else if(action === 'u') {
      // Updating
      var list = tsd[groupName];
      if(!list || !_.isArray(list) || _.isEmpty(list)) {
        console.error("Unable to find group %s", groupName);
        return false;
      }


      each(list,function(configFile, cb){
        actionUpdate.doUpdate(configFile,'o',config.tsdHome, function(){
          cb();
        });
      }, function(){
        each(list,function(configFile, cb){
          actionUpdate.doUpdate(configFile,'d',config.tsdHome, function(){
            cb();
          });
        });
      });
      return true;
    } else if(action === 'd') {
      if(tsd[groupName]) {
        delete tsd[groupName];
        utils.updateConfigFile(tsdFile);
        console.log("Group %s cleared", groupName);
        return true;
      }
      console.error("Group %s doesn't exist");
      return false;
    }

    return false;
  }
}

var actionGroup: TsdLink.IAction = new ActionGroup();
export = actionGroup;
