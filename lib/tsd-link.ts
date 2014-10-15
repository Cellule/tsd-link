import config = require("./tsd-link-config");
import actionLink = require("./actions/link");
import actionUpdate = require("./actions/update");
import actionGroup = require("./actions/group");

export function run(){

  var parser = new config.ConfigParser();
  parser.parseArguments(main);

  function main(config: TsdLink.Configuration){
    switch(config.action){
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
        throw "Unhandled action: "+config.action;
    }
  }

}
