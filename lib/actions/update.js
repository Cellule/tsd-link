var utils = require("../utils");
var _ = require("lodash");

var ActionUpdate = (function () {
    function ActionUpdate() {
    }
    ActionUpdate.prototype.run = function (config) {
        var tsdFile = utils.readConfigFile(config.configFile);
        var tsd = tsdFile.content;

        var mode = config.update.mode;

        // update owner
        if ((mode == 'o' || mode == 'a') && _.isObject(tsd.owned)) {
            var ownedFiles = Object.keys(tsd.owned);
            ownedFiles.forEach(function (fileName) {
                utils.ownFile(config.tsdHome, tsdFile.definitionPath, fileName);
            });
        }
        if ((mode == 'd' || mode == 'a') && _.isObject(tsd.dependencies)) {
            var depFiles = Object.keys(tsd.dependencies);
            depFiles.forEach(function (fileName) {
                utils.dependFile(config.tsdHome, tsdFile.definitionPath, fileName);
            });
        }
        return true;
    };
    return ActionUpdate;
})();

var actionUpdate = new ActionUpdate();
module.exports = actionUpdate;
