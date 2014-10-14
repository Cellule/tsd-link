var fs = require("fs");
var json = require("json5");
import config = require("./tsd-link-config");
var path = require("path");
import actionLink = require("./actions/link");
import actionUpdate = require("./actions/update");


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
    }
  }

}
