

declare module asynceach {
  export interface doneCallback<T> {
    (error? : any, transformedItem? : T) : void;
  }
  export interface nextCallback<T> {
    (item: T, callback: doneCallback<T> ) : void;
  }
}

declare module "async-each" {

  function each<T>(items: T[], next: asynceach.nextCallback<T>, callback? : (err:any, transformed: T[]) => void );

  export = each;
}
