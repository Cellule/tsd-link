


declare module TsdLink {

  export interface LinkedFiles {
    [filename: string] : {};
  }

  export interface OwnedFiles extends LinkedFiles {}
  export interface DependentFiles extends LinkedFiles {}

  export interface TsdConfigFile {
    fileName: string;
    dir: string;
    path: string;
    definitionPath: string;
    content: any;
  }

  export interface TsdDefinitionFile extends TsdConfigFile {
    content: {
      repo? : string;
      path? : string;
      installed? : {[filename: string] : {commit: string}};
      owned? : OwnedFiles;
      dependencies? : DependentFiles;
    }
  }

  export interface TsdGroupFile extends TsdConfigFile {
    content: {
      [groupName: string] : string[];
    }
  }

  export interface Configuration {
    action: string;
    link? : { owning: boolean; files: string[] };
    update? : { mode: string };
    group? : { groupName: string; action: string; };
    configFile: string;
    isWindows: boolean;
    home: string;
    tsdHome: string;
  }

  export interface IAction {
    run : (config: Configuration) => boolean;
  }
  export interface ActionUpdate extends IAction {
    doUpdate: (
      configFile: string,
       mode: string,
       tsdHome: string,
       updateDoneCallback: Function
     ) => boolean;
  }
}

