define("ace/mode/scss",["require","exports","module","../../../../../../lib/oop","../../../../../text","../../../../../../tokenizer","../../../../../scss_highlight_rules","../../../../../matching_brace_outdent","../../../../../folding/cstyle"],function(a,b,c){"use strict";var d=a("../lib/oop"),e=a("./text").Mode,f=a("../tokenizer").Tokenizer,g=a("./scss_highlight_rules").ScssHighlightRules,h=a("./matching_brace_outdent").MatchingBraceOutdent,i=a("./folding/cstyle").FoldMode,j=function(){this.$tokenizer=new f((new g).getRules(),"i"),this.$outdent=new h,this.foldingRules=new i};d.inherits(j,e),function(){this.getNextLineIndent=function(a,b,c){var d=this.$getIndent(b),e=this.$tokenizer.getLineTokens(b,a).tokens;if(e.length&&e[e.length-1].type=="comment")return d;var f=b.match(/^.*\{\s*$/);return f&&(d+=c),d},this.checkOutdent=function(a,b,c){return this.$outdent.checkOutdent(b,c)},this.autoOutdent=function(a,b,c){this.$outdent.autoOutdent(b,c)}}.call(j.prototype),b.Mode=j}),function(){window.require(["ace/ace"],function(a){window.ace||(window.ace={});for(var b in a)a.hasOwnProperty(b)&&(ace[b]=a[b])})}()