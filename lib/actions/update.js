var utils = require("../utils");
var _ = require("lodash");
var each = require("async-each");
var chain = require("slide").chain;

var ActionUpdate = (function () {
    function ActionUpdate() {
    }
    ActionUpdate.prototype.run = function (config) {
        return this.doUpdate(config.configFile, config.update.mode, config.tsdHome, function () {
        });
    };

    ActionUpdate.prototype.doUpdate = function (configFile, mode, tsdHome, updateDoneCallback) {
        var tsdFile = utils.readConfigFile(configFile);
        var tsd = tsdFile.content;
        var doOwnedFiles = (mode == 'o' || mode == 'a') && _.isObject(tsd.owned);
        var doDependentFiles = (mode == 'd' || mode == 'a') && _.isObject(tsd.dependencies);

        var update = function (target, fnc, next) {
            var depFiles = Object.keys(tsd[target]);
            each(depFiles, function (fileName, cb) {
                fnc(tsdHome, tsdFile.definitionPath, fileName, function () {
                    // do next even if an error occured
                    cb();
                });
            }, function () {
                next();
            });
        };

        chain([
            doOwnedFiles && [update, "owned", utils.ownFile],
            doDependentFiles && [update, "dependencies", utils.dependFile]
        ], updateDoneCallback);

        return true;
    };
    return ActionUpdate;
})();

var actionUpdate = new ActionUpdate();
module.exports = actionUpdate;
