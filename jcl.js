/* 
playground: https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-custom-languages
*/

const jclDebug = true;
const JCL_KEYWORDS = "(CNTL|DD|EXEC|EXPORT|JOB|INCLUDE|JCLLIB|OUTPUT|PROC|SCHEDULE|SET|XMIT|COMMAND|JOBGROUP|GJOB|JOBSET|SJOB|ENDSET|AFTER|BEFORE|CONCURRENT|ENDGROUP)";
const JCL_KWS_END = new RegExp(JCL_KEYWORDS + " *$");
const JCL_KWS_SPCS = new RegExp(JCL_KEYWORDS + " +");

// Register a new language
monaco.languages.register({ id: 'JCL' });

// Register a tokens provider for the language
monaco.languages.setMonarchTokensProvider('JCL', {
    brackets: [ 
        ['(',')','jcl-delimiter'], 
        ],
  tokenizer: {
    root: [
      [/^\/\/\*.*$/, {token: 'jcl-comment', ...jclDebug && {log: '[$S0] <comment> -> --- \'$0\''}} ], //Comment begins with //*, lasts until end of line
      [/, *$/, { token: 'jcl-delimiter', next: '@operands2', ...jclDebug && {log: '[$S0] <delimiter> -> operands2 \'$0\'' }}], //Checks for end of line with a ','
      [/ *\n| *$/, { token: 'jcl-default', next: '@popall', ...jclDebug && {log: '[$S0] <default> -> popall \'$0\'' }}], //Checks for end of line without a ','
      [/,( +)[0-9]+$/, { token: 'jcl-delimiter', next: '@operands2', ...jclDebug && {log: '[$S0] <delimiter> -> operands2 \'$0\'' }}], //Checks for ',' + linenumber + linebreak (continuation of statement)
      [/( *)[0-9]+$/, { token: 'jcl-default', ...jclDebug && {log: '[$S0] <default> -> --- \'$0\'' }}], //Checks for linenumber + linebreak (new JCL statement)
      [/( +)/, { token: 'whitespace', ...jclDebug && {log: '[$S0] <whitespace> ->  --- \'$0\'' }}], //Removes any previous line spaces
      [/^\/\*[ ]*$/, { token: 'jcl-statement', ...jclDebug && {log: '[$S0] <statement> -> ---' }}],  //Starts with /* followed by end or spaces and end
      [/^\/\*[ ]/, { token: 'jcl-statement', next: '@comments', ...jclDebug && {log: '[$S0] <statement> -> comments \'$0\'' }}], //Statements begin with /*space ...
      [/^\/\*/, { token: 'jcl-statement', next: '@nameFirstChar', ...jclDebug && {log: '[$S0] <statement> -> nameFirstChar \'$0\'' }}], //Statements begin with /* ...
      [/^\/\//, { token: 'jcl-statement', next: '@nameFirstChar', ...jclDebug && {log: '[$S0] <statement> -> nameFirstChar \'$0\'' }}], // or //
      [/.*/, { token: 'jcl-none', ...jclDebug && {log: '[$S0] <none> -> --- \'$0\'' }}], //When a token doesn't match, the line is blue
    ],
    nameFirstChar: [
      [/[ ]/, { token: 'jcl-default', next: '@operator', ...jclDebug && {log: '[$S0] <default> -> operator \'$0\'' }}], //Name must start with capital or national symbols
      [/[A-Z|@|#|$| ]/, { token: 'jcl-default', next: '@name', ...jclDebug && {log: '[$S0] <default> -> name \'$0\'' }}], //Name must start with capital or national symbols (space is for 1 letter label)
      [/./, { token: 'jcl-invalid', next: '@name', ...jclDebug && {log: '[$S0] <invalid> -> name \'$0\'' }}], //For everything else
    ],
    name: [ 
      [/[A-Z|@|#|$|\.|0-9]{0,16}/, { token: 'jcl-default', next: '@invalidName', ...jclDebug && {log: '[$S0] <default> -> invalidName \'$0\'' }}], //Name must be between {0, 16} characters
      [/, *$/, { token: 'jcl-delimiter', next: '@operands2', ...jclDebug && {log: '[$S0] <delimiter> -> operands2 \'$0\'' }}], //Checks for end of line with a ','
      [/ *\n| *$/, { token: 'jcl-default', next: '@popall', ...jclDebug && {log: '[$S0] <default> -> popall \'$0\'' }}], //Checks for end of line without a ','
      [/,( +)[0-9]+$/, { token: 'jcl-delimiter', next: '@operands2', ...jclDebug && {log: '[$S0] <delimiter> -> operands2 \'$0\'' }}], //Checks for ',' + linenumber + linebreak (continuation of statement)
      [/( *)[0-9]+$/, { token: 'jcl-default', next: '@popall', ...jclDebug && {log: '[$S0] <default> -> popall \'$0\'' }}], //Checks for linenumber + linebreak (new JCL statement)
      [/( +)/, { token: 'whitespace', next: '@operator', ...jclDebug && {log: '[$S0] <whitespace> -> operator \'$0\'' }}], //Spaces(s) designate when to check for operator keywords after name
      [/'.*'/, { token: 'jcl-string', next: '@strings', ...jclDebug && {log: '[$S0] <string> -> string \'$0\'' }}],
      [/[^A-Z|@|#|$|0-9]/, { token: 'jcl-invalid', ...jclDebug && {log: '[$S0] <invalid> -> ---\'$0\'' }}], // Checks for invalid JCL characters in names
      [/./, { token: 'jcl-default', ...jclDebug && {log: '[$S0] <default> -> --- \'$0\'' }}]
    ],

    invalidName: [
      [/ *\n| *$/, { token: 'jcl-default', next: '@popall', ...jclDebug && {log: '[$S0] <default> -> popall \'$0\'' }}], //Checks for end of line without a ','
      [/( +)/, { token: 'jcl-invalid', next: '@operator', ...jclDebug && {log: '[$S0] <invalid> -> operator \'$0\'' }}], //Name must be between {0, 8} characters
      [/./, { token: 'jcl-invalid', ...jclDebug && {log: '[$S0] <invalid> -> --- \'$0\'' }}], //Name must be between {0, 8} characters
    ],
    operator: [
      [/, *$/, { token: 'jcl-delimiter', next: '@operands2', ...jclDebug && {log: '[$S0] <delimiter> -> operands2 \'$0\'' }}], //Checks for end of line with a ','
      [/ *\n| *$/, { token: 'jcl-default', next: '@popall', ...jclDebug && {log: '[$S0] <default> -> popall \'$0\'' }}], //Checks for end of line without a ','
      [/!/, { token: 'jcl-invalid', next: '@operands', ...jclDebug && {log: '[$S0] <invalid> -> operands \'$0\'' }}], // Checks for invalid JCL characters
      [/[a-z]+/, { token: 'jcl-invalid', next: '@operands', ...jclDebug && {log: '[$S0] <invalid> -> operands \'$0\'' }}], // Checks for invalid lowercase JCL
      [/(,|&|=|\^)/, { token: 'jcl-delimiter', next: '@operands', ...jclDebug && {log: '[$S0] <delimiter> -> operands \'$0\'' }}],
      [/'/, { token: 'jcl-string', next: '@strings', ...jclDebug && {log: '[$S0] <string> -> string \'$0\'' }}],
      [/[()]/, '@brackets' ],
      [/(IF)/, { token: 'jcl-operator', next: '@if', ...jclDebug && {log: '[$S0] <operator> -> if \'$0\'' }}], //If is special, gets its own logic
      [JCL_KWS_END, { token: 'jcl-operator', next: '@popall', ...jclDebug && {log: '[$S0] <operator> -> popall \'$0\'' }}],
      [JCL_KWS_SPCS, { token: 'jcl-operator', next: '@operands', ...jclDebug && {log: '[$S0] <operator> -> operands \'$0\'' }}],
      [/(ENDCNTL|ELSE|ENDIF|PEND|THEN) *$/, { token: 'jcl-operator', next: '@popall', ...jclDebug && {log: '[$S0] <operator> -> popall \'$0\'' }}],
      [/(ENDCNTL|ELSE|ENDIF|PEND|THEN) +/, { token: 'jcl-operator', next: '@comments', ...jclDebug && {log: '[$S0] <operator> -> comments \'$0\'' }}],
      [/[^\s\\a-z(,|&|=|\^)]+/, { token: 'jcl-default', next: '@operands', ...jclDebug && {log: '[$S0] <default> -> operands \'$0\'' }}], //Matches the rest
    ],
    if: [
      [/, *$/, { token: 'jcl-delimiter', next: '@operands2', ...jclDebug && {log: '[$S0] <delimiter> -> operands2 \'$0\'' }}], //Checks for end of line with a ','
      [/ *\n| *$/, { token: 'jcl-default', next: '@popall', ...jclDebug && {log: '[$S0] <default> -> popall \'$0\'' }}], //Checks for end of line without a ','
      [/(THEN )/, { token: 'jcl-operator', next: '@comments', ...jclDebug && {log: '[$S0] <operator> -> comments \'$0\'' }}],
      [/./, { token: 'jcl-variable', ...jclDebug && {log: '[$S0] <variable> -> --- \'$0\'' }}],
    ],
    operands: [
      [/,( +)[0-9]+$/, { token: 'jcl-delimiter', next: '@operands2', ...jclDebug && {log: '[$S0] <delimiter> -> operands2 \'$0\'' }}], //Checks for ',' + linenumber + linebreak (continuation of statement)
      [/( *)[0-9]+$/, { token: 'jcl-default', next: '@popall', ...jclDebug && {log: '[$S0] <default> -> popall \'$0\'' }}], //Checks for linenumber + linebreak (new JCL statement)
      [/, *$/, { token: 'jcl-delimiter', next: '@operands2', ...jclDebug && {log: '[$S0] <delimiter> -> operands2 \'$0\'' }}], //Checks for end of line with a ','
      [/ *\n| *$/, { token: 'jcl-default', next: '@popall', ...jclDebug && {log: '[$S0] <default> -> popall \'$0\'' }}], //Checks for end of line without a ','
      [/, /, { token: 'jcl-delimiter', next: '@comments', ...jclDebug && {log: '[$S0] <delimiter> -> comments \'$0\'' }}], //Checks for , + space (leads to comment)
      [/'/, { token: 'jcl-string', next: '@strings', ...jclDebug && {log: '[$S0] <string> -> string \'$0\'' }}],
      [/!/, { token: 'jcl-invalid', ...jclDebug && {log: '[$S0] <invalid> -> --- \'$0\'' }}], // Checks for invalid JCL characters
      [/[a-z]+/, { token: 'jcl-invalid', ...jclDebug && {log: '[$S0] <invalid> -> --- \'$0\'' }}], // Checks for invalid lowercase JCL
      [/(,|&|=|\^)/, { token: 'jcl-delimiter', ...jclDebug && {log: '[$S0] <delimiter> -> --- \'$0\'' }}],
      [/[)]$/, {token: 'jcl-delimiter', next:'@popall', ...jclDebug && {log: '[$S0] <delimiter> -> popall' }}],
      [/[()]/, '@brackets' ],
      [/ /, { token: 'jcl-variable', next: '@comments', ...jclDebug && {log: '[$S0] <variable> -> comments \'$0\'' }}],//Space leads to comments
      [/\*$/, { token: 'jcl-variable', next: '@popall', ...jclDebug && {log: '[$S0] <variable> -> popall \'$0\'' }}], //(*) as last char
      [/.$/, { token: 'jcl-variable', next: '@popall', ...jclDebug && {log: '[$S0] <variable> -> popall \'$0\'' }}], //For end 
      [/./, { token: 'jcl-variable', ...jclDebug && {log: '[$S0] <variable> -> --- \'$0\'' }}], //For everything else
      
    ],
    operands2: [ //JCL has a behavior where it will accept two sets of operands before detecting comments
                //for certain conditions, usually when statements are continued via a ','
      [/, *$/, { token: 'jcl-delimiter', next: '@operands2', ...jclDebug && {log: '[$S0] <delimiter> -> operands2 \'$0\'' }}], //Checks for end of line with a ','
      [/ *\n| *$/, { token: 'jcl-default', next: '@popall', ...jclDebug && {log: '[$S0] <default> -> popall \'$0\'' }}], //Checks for end of line without a ','
      [/,( +)[0-9]+$/, { token: 'jcl-delimiter', next: '@operands2', ...jclDebug && {log: '[$S0] <delimiter> -> operands2 \'$0\'' }}], //Checks for ',' + linenumber + linebreak (continuation of statement)
      [/( *)[0-9]+$/, { token: 'jcl-default', next: '@popall', ...jclDebug && {log: '[$S0] <default> -> popall \'$0\'' }}], //Checks for linenumber + linebreak (new JCL statement)
      [/, /, { token: 'jcl-delimiter', next: '@comments', ...jclDebug && {log: '[$S0] <delimiter> -> comments \'$0\'' }}], //Checks for , + space (leads to comment)
      [/'/, { token: 'jcl-string', next: '@strings', ...jclDebug && {log: '[$S0] <string> -> string \'$0\'' }}],
      [/!/, { token: 'jcl-invalid', ...jclDebug && {log: '[$S0] <invalid> -> --- \'$0\'' }}], // Checks for invalid JCL characters
      [/[a-z]+/, { token: 'jcl-invalid', ...jclDebug && {log: '[$S0] <invalid> -> --- \'$0\'' }}], // Checks for invalid lowercase JCL
      [/(,|&|=|\^)/, { token: 'jcl-delimiter', ...jclDebug && {log: '[$S0] <delimiter> -> --- \'$0\'' }}],
      [/[()]/, '@brackets' ],
      [/ +/, { token: 'jcl-variable', next: '@operands', ...jclDebug && {log: '10. [$S0] <variable> -> operands \'$0\'' }}],//Space leads to next operand
      [/\//, { token: 'jcl-variable', ...jclDebug && {log: '[$S0] <variable> -> --- \'$0\'' }}],
      [/^.*/, { token: 'jcl-none', ...jclDebug && {log: '[$S0] <none> -> --- \'$0\'' }}], //When a token doesn't match, the line is blue
      [/./, { token: 'jcl-variable', ...jclDebug && {log: '[$S0] <variable> -> --- \'$0\'' }}],//For everything else
    ],
    comments: [
      [/.*/, { token: 'jcl-comment', next: '@popall', ...jclDebug && {log: '[$S0] <comment> -> popall \'$0\'' }}],
      [/ *\n| *$/, { token: 'jcl-default', next: '@popall', ...jclDebug && {log: '[$S0] <default> -> --- \'$0\'' }}],
    ],
    strings: [ //Strings get their own category because Monaco doesn't seem to deal with pattern matching
              //over line breaks, even with multiline flags. This way, we just put strings into their own loop.
      [/.*' *$/, { token: 'jcl-string', next: '@popall', ...jclDebug && {log: '[$S0] <string> -> popall \'$0\'' }}],  // (') character ending line -> we are done here
      [/.*' /, { token: 'jcl-string', next: '@comments', ...jclDebug && {log: '[$S0] <string> -> comments \'$0\'' }}], // Space after the ending (') character is a comment
      [/.*' */, { token: 'jcl-string', next: '@operands', ...jclDebug && {log: '[$S0] <string> -> operands \'$0\'' }}], // Covers all characters in string until ending (') character
      [/.*/, { token: 'jcl-string', ...jclDebug && {log: '[$S0] <string> -> --- \'$0\'' }}],
    ]
  }
});

// Define a new theme that contains only rules that match this language
monaco.editor.defineTheme('myCoolTheme', {
  base: 'vs',
  inherit: false,
  rules: [
        { token: 'jcl-comment', foreground: '20e5e6' }, // Light blue
        { token: 'jcl-statement', foreground: '50eb24' }, // Green
        { token: 'jcl-operator', foreground: 'eb2424' }, // Red
        { token: 'jcl-delimiter', foreground: 'fffd23' }, // Yellow
        { token: 'jcl-string', foreground: 'fdfdfd' }, // White
        { token: 'jcl-variable', foreground: '50eb24' }, // Green
        { token: 'jcl-invalid', foreground: 'ffadc7', background: 'ff8173', fontStyle: 'bold' }, // Light red, background is supposed to be "highlight" 
        //of text but it doesn't seem to work?
        { token: 'jcl-none', foreground: '75abff' }, // Blue
        { token: 'jcl-default', foreground: '50eb24' }, // Green
  ],
  colors: {
    'editor.background': '#202020',
        'editorCursor.foreground': '#000000'
  }
});

// Register a completion item provider for the new language
monaco.languages.registerCompletionItemProvider('JCL', {
  provideCompletionItems: () => {
    var suggestions = [
      {
        label: 'simpleText',
        kind: monaco.languages.CompletionItemKind.Text,
        insertText: 'simpleText'
      },
      {
        label: 'testing',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: 'testing(${1:condition})',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
      },
      {
        label: 'ifelse',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: ['if (${1:condition}) {', '\t\'$0\'', '} else {', '\t', '}'].join('\n'),
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'If-Else Statement'
      }
    ];
    return { suggestions: suggestions };
  }
});

monaco.editor.create(document.getElementById('container'), {
  theme: 'myCoolTheme',
  value: getCode(),
  language: 'JCL'
});

function getCode() {
    var jclNums = [];
    console.clear();
    const jclIn = [
      
      '//EX0     EXEC PGM=IEFBR14',                                            
      '//SYSIN   DD   DISP=SHR,',                                              
      '//             DSN=SYS1.MACLIB(CVT)',                                   
      '//EX1     EXEC PGM=IEFBR14,PARM=\'XXXXXXXXXXXXXXXXXXXXXXXXXXXX',        
      '//                XXXXXXXXXX\'',                                        
      '//EX2     EXEC PGM=IEFBR14,PARM=(\'A=1\',       Useful comment A=1',    
      '//             \'B=2\')                         and B=2',               
      '//DATA    DD   *',                                                      
      ' Data line 1',                                                          
      ' Data line 2',                                                          
      '/*',                                                                    
      '//IEFBR#14.DATAINPT DD   *',                                            
      '  The possible longest label is procname.label',                                   
      '  procname and label up to 8 chars each plus dot -> 17 chars',
      '/*',                                                                    
      '//**************************************************************'       

    ];

    jclStrip = jclIn.map(line => line.trimEnd());
    
    jclSpace1 = jclStrip.join(' \n');
    
    jclSpace2 = jclStrip.join('  \n');

    for (var i = 0; i < jclStrip.length; i++) {
        if (jclStrip[i].length < 72) { jclNums[i] = jclStrip[i].padEnd(72, ' ') + (Math.floor(Math.random() * 9000) + 1000) }
        else                         { jclNums[i] = jclStrip[i] }
    }
    
    //return jclStrip.join('\n');
    //return jclSpace1 + '\n';
    //return jclSpace2 + '\n';
    //return jclNums.join('\n');

    //return jclStrip.join('\n') + '\n' + jclSpace1 + '\n';
    //return jclStrip.join('\n') + '\n' + jclSpace1 + '\n' + jclSpace2 + '\n';
    return jclStrip.join('\n') + '\n' + jclSpace1 + '\n' + jclSpace2 + '\n' + jclNums.join('\n');
}
