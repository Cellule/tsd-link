export class ValidArguments {
  name: RegExp;
  callback: (value: string) => boolean;
  expected: RegExp;
  constructor(name: RegExp, callback: (value: string) => boolean, expected?: RegExp){
    this.name = name;
    this.callback = callback;
    this.expected = expected || null;
  }
}

export interface ParserConfig {
  noMatch?: (value: string, cb?: (value: string) => boolean) => boolean;
  invalid?: (argument: string, value: string, expectedValue: string) => void;
  after? : () => void;
}

export function parseArguments(valid_arguments: ValidArguments[], config: ParserConfig): boolean {
  var error, argument, valid_argument
      ,argNotFound = true
      ,options_callbacks = []
      ,callbacks_finished_count = 0
      ,args = process.argv.slice(2);

  var notMatchCallback = config.noMatch ?
    config.noMatch : defaultNotMatchCallback;
  var invalidCallback = config.invalid ?
    config.invalid : defaultInvalidArgumentCallback;
  var afterParseCallback =  config.after ?
    config.after : defaultAfterParseCallback;

  if (args.length == 0) { afterParseCallback(); return true; }
  args: for (var i=0; i<args.length; i++){
    argNotFound = true;
    argument = args[i];
    var next_argument = args[i+1];

    for (var j=0;j<valid_arguments.length;j++){
      valid_argument = valid_arguments[j];
      if (valid_argument['name'].test(argument)){
        argNotFound = false;
        if (valid_argument['expected']){
          i++;
          if (
            ((!next_argument) && (next_argument="")) ||
            (!valid_argument['expected'].test(next_argument))
          ){
            if(valid_argument['expected'].test("")){
              next_argument = null;
              --i;
            } else {
              invalidCallback(argument, next_argument,valid_argument['expected']);
              return false;
            }
          }
        }
        if (valid_argument['callback']) {
          options_callbacks.push({
            'callback': valid_argument['callback']
            ,'argument': valid_argument['expected'] ? next_argument : null
          });
        }
        continue args;
      }
    }
    if (argNotFound) {
      if(!notMatchCallback(argument, defaultNotMatchCallback))
        return false;
    }
  }
  callbacks_finished_count = options_callbacks.length;
  for(var i in options_callbacks){
    var item = options_callbacks[i];
    if(!item['callback'](item['argument'])){
      return false;
    }
  }
  afterParseCallback();
  return true;
}

var defaultAfterParseCallback = function(){
  // console.log('[node-arguments] : All callbacks related with command line arguments finished executing.');
}
var defaultNotMatchCallback = function(value){
  console.log('[node-arguments] : invalid argument %s', value );
  return false;
}

var defaultInvalidArgumentCallback = function(arg, value, expected){
  console.log('[node-arguments] : the argument %s %s%s, %s expected.',
    arg,
    (value? 'is not valid':'expects a value'),
    (value? ', '+value+' given':''),
    expected
  )
}
