var utils = require("../utils");
var _ = require("lodash");
var each = require("async-each");

var ActionLink = (function () {
    function ActionLink() {
    }
    ActionLink.prototype.run = function (config) {
        var tsdFile = utils.readConfigFile(config.configFile);
        var tsd = tsdFile.content;
        var owning = config.link.owning;
        var fileNames = config.link.files;

        var anyLinkDone = false;
        var target;
        var operation;
        if (owning) {
            target = "owned";
            operation = utils.ownFile;
        } else {
            target = "dependencies";
            operation = utils.dependFile;
        }

        var targetObj = _.isObject(tsd[target]) && tsd[target] || {};
        each(fileNames, function (fileName, cb) {
            operation(config.tsdHome, tsdFile.definitionPath, fileName, function (err) {
                if (!err) {
                    targetObj[fileName] = {};
                    anyLinkDone = true;
                }
                cb();
            });
        }, function (err) {
            if (anyLinkDone) {
                tsd[target] = targetObj;
                utils.updateConfigFile(tsdFile);
            }
        });

        return true;
    };
    return ActionLink;
})();

var actionLink = new ActionLink();
module.exports = actionLink;
