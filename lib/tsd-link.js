var config = require("./tsd-link-config");
var actionLink = require("./actions/link");
var actionUpdate = require("./actions/update");
var actionGroup = require("./actions/group");

function run() {
    var parser = new config.ConfigParser();
    parser.parseArguments(main);

    function main(config) {
        switch (config.action) {
            case "link":
                actionLink.run(config);
                break;
            case "update":
                actionUpdate.run(config);
                break;
            case "group":
                actionGroup.run(config);
                break;
            default:
                throw "Unhandled action: " + config.action;
        }
    }
}
exports.run = run;
