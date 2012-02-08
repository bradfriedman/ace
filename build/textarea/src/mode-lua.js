/* ***** BEGIN LICENSE BLOCK *****
* Version: MPL 1.1/GPL 2.0/LGPL 2.1
*
* The contents of this file are subject to the Mozilla Public License Version
* 1.1 (the "License"); you may not use this file except in compliance with
* the License. You may obtain a copy of the License at
* http://www.mozilla.org/MPL/
*
* Software distributed under the License is distributed on an "AS IS" basis,
* WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
* for the specific language governing rights and limitations under the
* License.
*
* The Original Code is Ajax.org Code Editor (ACE).
*
* The Initial Developer of the Original Code is
* Ajax.org B.V.
* Portions created by the Initial Developer are Copyright (C) 2010
* the Initial Developer. All Rights Reserved.
*
* Contributor(s):
*      Fabian Jakobs <fabian AT ajax DOT org>
*      Colin Gourlay <colin DOT j DOT gourlay AT gmail DOT com>
*      Lee Gao
*
* Alternatively, the contents of this file may be used under the terms of
* either the GNU General Public License Version 2 or later (the "GPL"), or
* the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
* in which case the provisions of the GPL or the LGPL are applicable instead
* of those above. If you wish to allow use of your version of this file only
* under the terms of either the GPL or the LGPL, and not to allow others to
* use your version of this file under the terms of the MPL, indicate your
* decision by deleting the provisions above and replace them with the notice
* and other provisions required by the GPL or the LGPL. If you do not delete
* the provisions above, a recipient may use your version of this file under
* the terms of any one of the MPL, the GPL or the LGPL.
*
* ***** END LICENSE BLOCK ***** */

__ace_shadowed__.define('ace/mode/lua', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../lua_highlight_rules'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var LuaHighlightRules = require("./lua_highlight_rules").LuaHighlightRules;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new LuaHighlightRules().getRules());
};
oop.inherits(Mode, TextMode);

(function() {
    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
	
        var chunks = ["function", "then", "do", "repeat"];
        
        if (state == "start") {
            var match = line.match(/^.*[\{\(\[]\s*$/);
            if (match) {
                indent += tab;
            } else {
                for (var i in tokens){
                    var token = tokens[i];
                    if (token.type != "keyword") continue;
                    var chunk_i = chunks.indexOf(token.value);
                    if (chunk_i != -1){
                        indent += tab;
                        break;
                    }
                }
            }
        } 

        return indent;
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
        