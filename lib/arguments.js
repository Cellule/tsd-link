//valid_arguments: [{name: regex, callback: function, expected: regex}]
// config : noMatch : (value, defaultCallback(value)) : boolean (stop on false)
//          invalid: (argument, value, expectedValue)
//          after: ()
this.parse = function(valid_arguments, config){
  var error, argument, valid_argument
      ,invalid_syntax = true
      ,options_callbacks = []
      ,callbacks_finished_count = 0
      ,args = process.argv.slice(2);

  notMatchCallback = config.noMatch ?
    config.noMatch : defaultNotMatchCallback;
  invalidCallback = config.invalid ?
    config.invalid : defaultInvalidArgumentCallback;
  afterParseCallback =  config.after ?
    config.after : defaultAfterParseCallback;

  if (args.length == 0) { afterParseCallback(); return true; }
  for (i=0; i<args.length; i++){
    invalid_syntax = true;
    argument = args[i];
    next_argument = args[i+1];
    for (j=0;j<valid_arguments.length;j++){
      valid_argument = valid_arguments[j];
      if (valid_argument['name'].test(argument)){
        invalid_syntax = false;
        if (valid_argument['expected']){
          i++;
          if (
            (!next_argument) && (next_argument="") ||
            (!valid_argument['expected'].test(next_argument))
          ){
            invalidCallback(argument, next_argument,valid_argument['expected']);
            break;
          }
        }
        if (valid_argument['callback']) {
          options_callbacks.push({
            'callback': valid_argument['callback']
            ,'argument': valid_argument['expected'] ? next_argument : null
          });
        }
        continue;
      }
    }
    if (invalid_syntax) { if(!notMatchCallback(argument, defaultNotMatchCallback)) break; }
  }
  callbacks_finished_count = options_callbacks.length;
  if (callbacks_finished_count == 0){
    afterParseCallback();
  }
  options_callbacks.forEach(function(item){
    item['callback'](function(){
      callbacks_finished_count --;
      if (callbacks_finished_count == 0){
        afterParseCallback();
      }
    }, item['argument']);
  });
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
