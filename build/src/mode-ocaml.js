define("ace/mode/ocaml",["require","exports","module","../../../../../../lib/oop","../../../../../text","../../../../../../tokenizer","../../../../../ocaml_highlight_rules","../../../../../matching_brace_outdent","../../../../../../range"],function(a,b,c){"use strict";var d=a("../lib/oop"),e=a("./text").Mode,f=a("../tokenizer").Tokenizer,g=a("./ocaml_highlight_rules").OcamlHighlightRules,h=a("./matching_brace_outdent").MatchingBraceOutdent,i=a("../range").Range,j=function(){this.$tokenizer=new f((new g).getRules()),this.$outdent=new h};d.inherits(j,e);var k=/(?:[({[=:]|[-=]>|\b(?:else|try|with))\s*$/;((function(){this.toggleCommentLines=function(a,b,c,d){var e,f,g=!0,h=/^\s*\(\*(.*)\*\)/;for(e=c;e<=d;e++)if(!h.test(b.getLine(e))){g=!1;break}var j=new i(0,0,0,0);for(e=c;e<=d;e++)f=b.getLine(e),j.start.row=e,j.end.row=e,j.end.column=f.length,b.replace(j,g?f.match(h)[1]:"(*"+f+"*)")},this.getNextLineIndent=function(a,b,c){var d=this.$getIndent(b),e=this.$tokenizer.getLineTokens(b,a).tokens;return(!e.length||e[e.length-1].type!=="comment")&&a==="start"&&k.test(b)&&(d+=c),d},this.checkOutdent=function(a,b,c){return this.$outdent.checkOutdent(b,c)},this.autoOutdent=function(a,b,c){this.$outdent.autoOutdent(b,c)}})).call(j.prototype),b.Mode=j}),function(){window.require(["ace/ace"],function(a){window.ace||(window.ace={});for(var b in a)a.hasOwnProperty(b)&&(ace[b]=a[b])})}()