var fs = require("fs");
var json = require("json5");
var config = require("./tsd-link-config");
var path = require("path");
var actionLink = require("./actions/link");
var actionUpdate = require("./actions/update");

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
        }
    }
}
exports.run = run;
