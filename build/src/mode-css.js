define("ace/mode/css",["require","exports","module","../../../../../../lib/oop","../../../../../text","../../../../../../tokenizer","../../../../../css_highlight_rules","../../../../../matching_brace_outdent","../../../../../../worker/worker_client","../../../../../folding/cstyle"],function(a,b,c){"use strict";var d=a("../lib/oop"),e=a("./text").Mode,f=a("../tokenizer").Tokenizer,g=a("./css_highlight_rules").CssHighlightRules,h=a("./matching_brace_outdent").MatchingBraceOutdent,i=a("../worker/worker_client").WorkerClient,j=a("./folding/cstyle").FoldMode,k=function(){this.$tokenizer=new f((new g).getRules(),"i"),this.$outdent=new h,this.foldingRules=new j};d.inherits(k,e),function(){this.foldingRules="cStyle",this.getNextLineIndent=function(a,b,c){var d=this.$getIndent(b),e=this.$tokenizer.getLineTokens(b,a).tokens;if(e.length&&e[e.length-1].type=="comment")return d;var f=b.match(/^.*\{\s*$/);return f&&(d+=c),d},this.checkOutdent=function(a,b,c){return this.$outdent.checkOutdent(b,c)},this.autoOutdent=function(a,b,c){this.$outdent.autoOutdent(b,c)},this.createWorker=function(a){var b=new i(["ace"],"worker-css.js","ace/mode/css_worker","Worker");return b.attachToDocument(a.getDocument()),b.on("csslint",function(b){var c=[];b.data.forEach(function(a){c.push({row:a.line-1,column:a.col-1,text:a.message,type:a.type,lint:a})}),a.setAnnotations(c)}),b}}.call(k.prototype),b.Mode=k}),function(){window.require(["ace/ace"],function(a){window.ace||(window.ace={});for(var b in a)a.hasOwnProperty(b)&&(ace[b]=a[b])})}()