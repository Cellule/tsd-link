var utils = require("../utils");
var _ = require("lodash");

var ActionLink = (function () {
    function ActionLink() {
    }
    ActionLink.prototype.run = function (config) {
        var tsdFile = utils.readConfigFile(config.configFile);
        var tsd = tsdFile.content;
        var owning = config.link.owning;
        var fileNames = config.link.files;

        if (owning) {
            var owned = _.isObject(tsd.owned) && tsd.owned || {};
            fileNames.forEach(function (fileName) {
                if (utils.ownFile(config.tsdHome, tsdFile.definitionPath, fileName)) {
                    owned[fileName] = {};
                }
            });

            tsd.owned = owned;
        } else {
            var dependencies = _.isObject(tsd.dependencies) && tsd.dependencies || {};

            fileNames.forEach(function (fileName) {
                if (utils.dependFile(config.tsdHome, tsdFile.definitionPath, fileName)) {
                    dependencies[fileName] = {};
                }
            });

            tsd.dependencies = dependencies;
        }
        utils.updateConfigFile(tsdFile);
        return true;
    };
    return ActionLink;
})();

var actionLink = new ActionLink();
module.exports = actionLink;
