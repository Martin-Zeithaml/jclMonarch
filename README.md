# Simple JCL syntax (Monarch)
## Usage
Copy the ```jcl.js``` to the [monaco editor playground](https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-custom-languages).
Change the variable ```jclIn``` to the JCL you want to test, ideally with no line numbers. By default, each input JCL code is used four times for the testing:
1. Lines are stripped (trailing spaces)
2. Lines end with one space
3. Lines end with two spaces
4. Lines end with line number

## Fixed/updated
* Missing keywords (job sets and groups)
* Added/modified some line endings
* Logging
* Long label (partially)

## Debugging
To see how the syntax is processed, use the dev console. The output is ```[state] <token> -> "next rule" 'regex match'```:
```
JCL: JCL: [root] <statement> -> nameFirstChar '//'
JCL: JCL: [nameFirstChar] <default> -> name 'E'
JCL: JCL: [name] <default> -> invalidName 'X0'
```
Debug logs are controlled by variable ```jclDebug```.

## Known problems
### Label :heavy_exclamation_mark:
You can define label, which is compound, for example for HLASMCLG - "compile, link and go":
```
//* To differ between SYSIN for "Compile"
//C.SYSIN    DD DSN=SOME.DATASET
//* And for "Go"
//G.SYSIN    DD DSN=OTHER.DATASET
```
This was partially solved by changing the ```Name``` rule to accept 16 chars (dot included). But also e.g. ```A..A.A``` is marked as fine (same as in ISPF).

### Multiline comment :x:
Need to recognize char on position 72
```
//IEFBR14  EXEC PGM=IEFBR14            Comment                         X
//                                     Comment                          
```
### User defined DLM :x:
Problem with saving the delimiter to be able to recognize the end of in-stream data
```
//IEFBR14  EXEC PGM=IEFBR14
//DATA     DD   *,DLM=@#@
Data line 1
Data line 2
@#@
//* That's all
```
