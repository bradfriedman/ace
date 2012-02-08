__ace_shadowed__.define('ace/mode/java', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../javascript', '../../../../../../tokenizer', '../../../../../java_highlight_rules'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var JavaScriptMode = require("./javascript").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var JavaHighlightRules = require("./java_highlight_rules").JavaHighlightRules;

var Mode = function() {
    JavaScriptMode.call(this);
    
    this.$tokenizer = new Tokenizer(new JavaHighlightRules().getRules());
};
oop.inherits(Mode, JavaScriptMode);

(function() {
    
    this.createWorker = function(session) {
        return null;
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
;
            (function() {
                __ace_shadowed__.require(["ace/ext/textarea"], function(a) {
                    if (!window.__ace_shadowed__)
                        window.__ace_shadowed__ = {};
                    for (var key in a) if (a.hasOwnProperty(key))
                        __ace_shadowed__[key] = a[key];
                });
            })();
        