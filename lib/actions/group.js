var utils = require("../utils");
var _ = require("lodash");
var actionUpdate = require("./update");

var path = require("path");
var fs = require("fs");

var ActionGroup = (function () {
    function ActionGroup() {
    }
    ActionGroup.prototype.run = function (config) {
        var groupFile = path.resolve(config.tsdHome, "tsd.json");
        var tsdFile = utils.readConfigFile(groupFile, true);
        if (!tsdFile) {
            tsdFile = utils.makeTsdConfigFileBase(groupFile);
        }

        var tsd = tsdFile.content;
        var groupName = config.group.groupName;
        var action = config.group.action;

        if (action === 's') {
            var configFilePath = path.resolve(config.configFile);
            if (fs.existsSync(configFilePath)) {
                if (!tsd[groupName])
                    tsd[groupName] = [];
                if (~tsd[groupName].indexOf(configFilePath)) {
                    console.error("Config file %s already part of group %s", configFilePath, groupName);
                    return false;
                }
                tsd[groupName].push(configFilePath);
                utils.updateConfigFile(tsdFile);
                console.log("Added file %s to group %s", configFilePath, groupName);
                return true;
            }

            console.error("Unable to find file %s", configFilePath);
        } else {
            // Updating
            var list = tsd[groupName];
            if (!list || !_.isArray(list) || _.isEmpty(list)) {
                console.error("Unable to find group %s", groupName);
                return false;
            }

            list.forEach(function (configFile) {
                actionUpdate.doUpdate(configFile, 'o', config.tsdHome);
            });

            list.forEach(function (configFile) {
                actionUpdate.doUpdate(configFile, 'd', config.tsdHome);
            });
            return true;
        }

        return false;
    };
    return ActionGroup;
})();

var actionGroup = new ActionGroup();
module.exports = actionGroup;
