ace.define("ace/mode/coffee",["require","exports","module","../../../../../../tokenizer","../../../../../coffee_highlight_rules","../../../../../matching_brace_outdent","../../../../../folding/pythonic","../../../../../../range","../../../../../text","../../../../../../worker/worker_client","../../../../../../lib/oop"],function(a,b,c){function l(){this.$tokenizer=new d((new e).getRules()),this.$outdent=new f,this.foldingRules=new g("=|=>|->|\\s*class [^#]*")}"use strict";var d=a("../tokenizer").Tokenizer,e=a("./coffee_highlight_rules").CoffeeHighlightRules,f=a("./matching_brace_outdent").MatchingBraceOutdent,g=a("./folding/pythonic").FoldMode,h=a("../range").Range,i=a("./text").Mode,j=a("../worker/worker_client").WorkerClient,k=a("../lib/oop");k.inherits(l,i),function(){var a=/(?:[({[=:]|[-=]>|\b(?:else|switch|try|catch(?:\s*[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)?|finally))\s*$/,b=/^(\s*)#/,c=/^\s*###(?!#)/,d=/^\s*/;this.getNextLineIndent=function(b,c,d){var e=this.$getIndent(c),f=this.$tokenizer.getLineTokens(c,b).tokens;return(!f.length||f[f.length-1].type!=="comment")&&b==="start"&&a.test(c)&&(e+=d),e},this.toggleCommentLines=function(a,e,f,g){console.log("toggle");var i=new h(0,0,0,0);for(var j=f;j<=g;++j){var k=e.getLine(j);if(c.test(k))continue;b.test(k)?k=k.replace(b,"$1"):k=k.replace(d,"$&#"),i.end.row=i.start.row=j,i.end.column=k.length+1,e.replace(i,k)}},this.checkOutdent=function(a,b,c){return this.$outdent.checkOutdent(b,c)},this.autoOutdent=function(a,b,c){this.$outdent.autoOutdent(b,c)},this.createWorker=function(a){var b=new j(["ace"],"worker-coffee.js","ace/mode/coffee_worker","Worker");return b.attachToDocument(a.getDocument()),b.on("error",function(b){a.setAnnotations([b.data])}),b.on("ok",function(b){a.clearAnnotations()}),b}}.call(l.prototype),b.Mode=l}),function(){ace.require(["ace/ace"],function(a){window.ace||(window.ace={});for(var b in a)a.hasOwnProperty(b)&&(ace[b]=a[b])})}()