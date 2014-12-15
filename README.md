tsd-link
========

Create links between typescript definition files (*.d.ts) accross multiple project on a local machine `npm link` style.
Use when definition files can change often. Otherwise simply use tsd.

A owned definition is a definition updated by this project.
A dependent definition is a definition require by this project and maintained by an other

```
Usage: tsd-link [action] [-c tsd.json] [-h]
  link: link [-o] definitionName[], default action
    creates a dependency between a distant definition and this project
      -o : --own, own a definition file, the distant link will point here
      definitionName[]: list of definitions to own
  
  update: update [a|o|d]
    update links to definition
      a|all : update owned and dependent definitions links
      o|own : update only owned definitions
      d|dep : update only dependent definitions
      
  group: group [u|update|s|save|d|delete] default: save
    Allows to add projects to a group
    save: add tsd.json from this directory to the group
    update: will update all owned definition before dependencies
    delete: remove the group
      -g : --groupname, group name used. Default: "default"
      
  
  -c : --config, define a config file to use. Default: tsd.json
  
  -h : --help, display this help
```
