


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
    content: {
      repo? : string;
      path? : string;
      installed? : {[filename: string] : {commit: string}};
      owned? : OwnedFiles;
      dependencies? : DependentFiles;
    }
  }

  export interface Configuration {
    action: string;
    link? : { owning: boolean; files: string[] };
    update? : { mode: string };

    configFile: string;
    isWindows: boolean;
    home: string;
    tsdHome: string;
  }

  export interface IAction {
    run : (config: Configuration) => boolean;
  }

}
