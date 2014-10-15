var utils = require("../utils");
var _ = require("lodash");

var ActionUpdate = (function () {
    function ActionUpdate() {
    }
    ActionUpdate.prototype.run = function (config) {
        return this.doUpdate(config.configFile, config.update.mode, config.tsdHome);
    };

    ActionUpdate.prototype.doUpdate = function (configFile, mode, tsdHome) {
        var tsdFile = utils.readConfigFile(configFile);
        var tsd = tsdFile.content;

        // update owner
        if ((mode == 'o' || mode == 'a') && _.isObject(tsd.owned)) {
            var ownedFiles = Object.keys(tsd.owned);
            ownedFiles.forEach(function (fileName) {
                utils.ownFile(tsdHome, tsdFile.definitionPath, fileName);
            });
        }
        if ((mode == 'd' || mode == 'a') && _.isObject(tsd.dependencies)) {
            var depFiles = Object.keys(tsd.dependencies);
            depFiles.forEach(function (fileName) {
                utils.dependFile(tsdHome, tsdFile.definitionPath, fileName);
            });
        }
        return true;
    };
    return ActionUpdate;
})();

var actionUpdate = new ActionUpdate();
module.exports = actionUpdate;
