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

/**
 * Define a module along with a payload
 * @param module a name for the payload
 * @param payload a function to call with (require, exports, module) params
 */
 
(function() {

var ACE_NAMESPACE = "";

var global = (function() {
    return this;
})();

if (typeof requirejs !== "undefined")
    return;

var _define = function(module, deps, payload) {
    if (typeof module !== 'string') {
        if (_define.original)
            _define.original.apply(window, arguments);
        else {
            console.error('dropping module because define wasn\'t a string.');
            console.trace();
        }
        return;
    }

    if (arguments.length == 2)
        payload = deps;

    if (!_define.modules)
        _define.modules = {};
        
    _define.modules[module] = payload;
};

/**
 * Get at functionality define()ed using the function above
 */
var _require = function(parentId, module, callback) {
    if (Object.prototype.toString.call(module) === "[object Array]") {
        var params = [];
        for (var i = 0, l = module.length; i < l; ++i) {
            var dep = lookup(parentId, module[i]);
            if (!dep && _require.original)
                return _require.original.apply(window, arguments);
            params.push(dep);
        }
        if (callback) {
            callback.apply(null, params);
        }
    }
    else if (typeof module === 'string') {
        var payload = lookup(parentId, module);
        if (!payload && _require.original)
            return _require.original.apply(window, arguments);
        
        if (callback) {
            callback();
        }
    
        return payload;
    }
    else {
        if (_require.original)
            return _require.original.apply(window, arguments);
    }
};

var normalizeModule = function(parentId, moduleName) {
    // normalize plugin requires
    if (moduleName.indexOf("!") !== -1) {
        var chunks = moduleName.split("!");
        return normalizeModule(parentId, chunks[0]) + "!" + normalizeModule(parentId, chunks[1]);
    }
    // normalize relative requires
    if (moduleName.charAt(0) == ".") {
        var base = parentId.split("/").slice(0, -1).join("/");
        moduleName = base + "/" + moduleName;
        
        while(moduleName.indexOf(".") !== -1 && previous != moduleName) {
            var previous = moduleName;
            moduleName = moduleName.replace(/\/\.\//, "/").replace(/[^\/]+\/\.\.\//, "");
        }
    }
    
    return moduleName;
};

/**
 * Internal function to lookup moduleNames and resolve them by calling the
 * definition function if needed.
 */
var lookup = function(parentId, moduleName) {

    moduleName = normalizeModule(parentId, moduleName);

    var module = _define.modules[moduleName];
    if (!module) {
        return null;
    }

    if (typeof module === 'function') {
        var exports = {};
        var mod = {
            id: moduleName, 
            uri: '',
            exports: exports,
            packaged: true
        };
        
        var req = function(module, callback) {
            return _require(moduleName, module, callback);
        };
        
        var returnValue = module(req, exports, mod);
        exports = returnValue || mod.exports;
            
        // cache the resulting module object for next time
        _define.modules[moduleName] = exports;
        return exports;
    }

    return module;
};

function exportAce(ns) {
    var require = function(module, callback) {
        return _require("", module, callback);
    };
    require.packaged = true;
    
    var root = global;
    if (ns) {
        if (!global[ns])
            global[ns] = {};
        root = global[ns];
    }
        
    if (root.define)
        _define.original = root.define;
    
    root.define = _define;

    if (root.require)
        _require.original = root.require;
    
    root.require = require;
}

exportAce(ACE_NAMESPACE);

})();/* ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is Mozilla Skywriter.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *      Fabian Jakobs <fabian AT ajax DOT org>
 *      Kevin Dangoor (kdangoor@mozilla.com)
 *      Julian Viereck <julian DOT viereck AT gmail DOT com>
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


define('kitchen-sink/demo', ['require', 'exports', 'module' , 'ace/lib/fixoldbrowsers', 'ace/lib/net', 'ace/lib/event', 'ace/theme/textmate', 'ace/edit_session', 'ace/undomanager', 'ace/keyboard/keybinding/vim', 'ace/keyboard/keybinding/emacs', 'ace/keyboard/hash_handler', 'ace/mode/c_cpp', 'ace/mode/clojure', 'ace/mode/coffee', 'ace/mode/coldfusion', 'ace/mode/csharp', 'ace/mode/css', 'ace/mode/groovy', 'ace/mode/haxe', 'ace/mode/html', 'ace/mode/java', 'ace/mode/javascript', 'ace/mode/json', 'ace/mode/latex', 'ace/mode/lua', 'ace/mode/markdown', 'ace/mode/ocaml', 'ace/mode/perl', 'ace/mode/pgsql', 'ace/mode/php', 'ace/mode/powershell', 'ace/mode/python', 'ace/mode/scala', 'ace/mode/scss', 'ace/mode/ruby', 'ace/mode/sql', 'ace/mode/SVG', 'ace/mode/text', 'ace/mode/textile', 'ace/mode/xml', 'text!../../../../../docs/plaintext.txt', 'text!../../../../../docs/javascript.js', 'text!../../../../../docs/coffeescript.coffee', 'text!../../../../../docs/json.json', 'text!../../../../../docs/css.css', 'text!../../../../../docs/scss.scss', 'text!../../../../../docs/html.html', 'text!../../../../../docs/xml.xml', 'text!../../../../../docs/svg.svg', 'text!../../../../../docs/php.php', 'text!../../../../../docs/coldfusion.cfm', 'text!../../../../../docs/python.py', 'text!../../../../../docs/ruby.rb', 'text!../../../../../docs/perl.pl', 'text!../../../../../docs/ocaml.ml', 'text!../../../../../docs/lua.lua', 'text!../../../../../docs/java.java', 'text!../../../../../docs/clojure.clj', 'text!../../../../../docs/groovy.groovy', 'text!../../../../../docs/scala.scala', 'text!../../../../../docs/csharp.cs', 'text!../../../../../docs/powershell.ps1', 'text!../../../../../docs/cpp.cpp', 'text!../../../../../docs/Haxe.hx', 'text!../../../../../docs/markdown.md', 'text!../../../../../docs/textile.textile', 'text!../../../../../docs/latex.tex', 'text!../../../../../docs/sql.sql', 'text!../../../../../docs/pgsql.pgsql', 'ace/split'], function(require, exports, module) {

require("ace/lib/fixoldbrowsers");
var env = {};
    
var net = require("ace/lib/net");
var event = require("ace/lib/event");
var theme = require("ace/theme/textmate");
var EditSession = require("ace/edit_session").EditSession;
var UndoManager = require("ace/undomanager").UndoManager;

var vim = require("ace/keyboard/keybinding/vim").Vim;
var emacs = require("ace/keyboard/keybinding/emacs").Emacs;
var HashHandler = require("ace/keyboard/hash_handler").HashHandler;


var modesByName;

var Doc = function(name, desc, file) {
    this.name = name;
    this.desc = desc;
    this.doc = new EditSession(file);
    this.doc.setMode(modesByName[name].mode);
    this.doc.setUndoManager(new UndoManager());
};

var WrappedDoc = function(name, desc, file) {
    Doc.apply(this, arguments);
    
    this.doc.setUseWrapMode(true);
    this.doc.setWrapLimitRange(80, 80);
};

var Mode = function(name, desc, clazz, extensions) {
    this.name = name;
    this.desc = desc;
    this.clazz = clazz;
    this.mode = new clazz();
    this.mode.name = name;
    
    this.extRe = new RegExp("^.*\\.(" + extensions.join("|") + ")$", "g");
};

Mode.prototype.supportsFile = function(filename) {
    return filename.match(this.extRe);
};

var themes = {};
function loadTheme(name, callback) {
    if (themes[name])
        return callback();
        
    themes[name] = 1;
    var base = name.split("/").pop();
    var fileName = "demo/kitchen-sink/theme-" + base + "-uncompressed.js";
    net.loadScript(fileName, callback);
}

var modes = [
    new Mode("c_cpp", "C/C++", require("ace/mode/c_cpp").Mode, ["c", "cpp", "cxx", "h", "hpp"]),
    new Mode("clojure", "Clojure", require("ace/mode/clojure").Mode, ["clj"]),
    new Mode("coffee", "CoffeeScript", require("ace/mode/coffee").Mode, ["coffee"]),
    new Mode("coldfusion", "ColdFusion", require("ace/mode/coldfusion").Mode, ["cfm"]),
    new Mode("csharp", "C#", require("ace/mode/csharp").Mode, ["cs"]),
    new Mode("css", "CSS", require("ace/mode/css").Mode, ["css"]),
    new Mode("groovy", "Groovy", require("ace/mode/groovy").Mode, ["groovy"]),
    new Mode("haxe", "haXe", require("ace/mode/haxe").Mode, ["hx"]),
    new Mode("html", "HTML", require("ace/mode/html").Mode, ["html", "htm"]),
    new Mode("java", "Java", require("ace/mode/java").Mode, ["java"]),
    new Mode("javascript", "JavaScript", require("ace/mode/javascript").Mode, ["js"]),
    new Mode("json", "JSON", require("ace/mode/json").Mode, ["json"]),
    new Mode("latex", "LaTeX", require("ace/mode/latex").Mode, ["tex"]),
    new Mode("lua", "Lua", require("ace/mode/lua").Mode, ["lua"]),
    new Mode("markdown", "Markdown", require("ace/mode/markdown").Mode, ["md", "markdown"]),
    new Mode("ocaml", "OCaml", require("ace/mode/ocaml").Mode, ["ml", "mli"]),
    new Mode("perl", "Perl", require("ace/mode/perl").Mode, ["pl", "pm"]),
    new Mode("pgsql", "pgSQL",require("ace/mode/pgsql").Mode, ["pgsql", "sql"]),
    new Mode("php", "PHP",require("ace/mode/php").Mode, ["php"]),
    new Mode("powershell", "Powershell", require("ace/mode/powershell").Mode, ["ps1"]),
    new Mode("python", "Python", require("ace/mode/python").Mode, ["py"]),
    new Mode("scala", "Scala", require("ace/mode/scala").Mode, ["scala"]),
    new Mode("scss", "SCSS", require("ace/mode/scss").Mode, ["scss"]),
    new Mode("ruby", "Ruby", require("ace/mode/ruby").Mode, ["rb"]),
    new Mode("sql", "SQL", require("ace/mode/sql").Mode, ["sql"]),
    new Mode("svg", "SVG", require("ace/mode/SVG").Mode, ["svg"]),
    new Mode("text", "Text", require("ace/mode/text").Mode, ["txt"]),
    new Mode("textile", "Textile", require("ace/mode/textile").Mode, ["textile"]),
    new Mode("xml", "XML", require("ace/mode/xml").Mode, ["xml"])
];

modesByName = {};
modes.forEach(function(m) {
    modesByName[m.name] = m;
});

var loreIpsum = require("text!./docs/plaintext.txt");
for (var i = 0; i < 5; i++) {
    loreIpsum += loreIpsum;
}

var docs = [
    new Doc(
        "javascript", "JavaScript",
        require("text!./docs/javascript.js")
    ),
    new WrappedDoc("text", "Plain Text", loreIpsum),
    new Doc(
        "coffee", "Coffeescript",
        require("text!./docs/coffeescript.coffee")
    ),
    new Doc(
        "json", "JSON",
        require("text!./docs/json.json")
    ),
    new Doc(
        "css", "CSS",
        require("text!./docs/css.css")
    ),
    new Doc(
        "scss", "SCSS",
        require("text!./docs/scss.scss")
    ),
    new Doc(
        "html", "HTML",
        require("text!./docs/html.html")
    ),
    new Doc(
        "xml", "XML",
        require("text!./docs/xml.xml")
    ),
    new Doc(
        "svg", "SVG",
        require("text!./docs/svg.svg")
    ),
    new Doc(
        "php", "PHP",
        require("text!./docs/php.php")
    ),
    new Doc(
        "coldfusion", "ColdFusion",
        require("text!./docs/coldfusion.cfm")
    ),
    new Doc(
        "python", "Python",
        require("text!./docs/python.py")
    ),
    new Doc(
        "ruby", "Ruby",
        require("text!./docs/ruby.rb")
    ),
    new Doc(
        "perl", "Perl",
        require("text!./docs/perl.pl")
    ),
    new Doc(
        "ocaml", "OCaml",
        require("text!./docs/ocaml.ml")
    ),
    new Doc(
        "lua", "Lua",
        require("text!./docs/lua.lua")
    ),
    new Doc(
        "java", "Java",
        require("text!./docs/java.java")
    ),
    new Doc(
        "clojure", "Clojure",
        require("text!./docs/clojure.clj")
    ),
    new Doc(
        "groovy", "Groovy",
        require("text!./docs/groovy.groovy")
    ),
    new Doc(
        "scala", "Scala",
        require("text!./docs/scala.scala")
    ),
    new Doc(
        "csharp", "C#",
        require("text!./docs/csharp.cs")
    ),
    new Doc(
        "powershell", "Powershell",
        require("text!./docs/powershell.ps1")
    ),
    new Doc(
        "c_cpp", "C/C++",
        require("text!./docs/cpp.cpp")
    ),
    new Doc(
        "haxe", "haXe",
        require("text!./docs/Haxe.hx")
    ),
    new WrappedDoc(
        "markdown", "Markdown",
        require("text!./docs/markdown.md")
    ),
    new WrappedDoc(
        "textile", "Textile",
        require("text!./docs/textile.textile")
    ),
    new WrappedDoc(
        "latex", "LaTeX",
        require("text!./docs/latex.tex")
    ),
    new WrappedDoc(
        "sql", "SQL",
        require("text!./docs/sql.sql")
    ),
    new WrappedDoc(
        "pgsql", "pgSQL",
        require("text!./docs/pgsql.pgsql")
    )
];

var docsByName = {};
docs.forEach(function(d) {
    docsByName[d.name] = d;
});

var keybindings = {
    // Null = use "default" keymapping
    ace: null,
    vim: vim,
    emacs: emacs,
    // This is a way to define simple keyboard remappings
    custom: new HashHandler({
        "gotoright":      "Tab",
        "indent":         "]",
        "outdent":        "[",
        "gotolinestart":  "^",
        "gotolineend":    "$"
     })
};

var container = document.getElementById("editor");

// Splitting.
var Split = require("ace/split").Split;
var split = new Split(container, theme, 1);
env.editor = split.getEditor(0);
split.on("focus", function(editor) {
    env.editor = editor;
    updateUIEditorOptions();
});
env.split = split;
window.env = env;
window.ace = env.editor;

var docEl = document.getElementById("doc");
var modeEl = document.getElementById("mode");
var wrapModeEl = document.getElementById("soft_wrap");
var themeEl = document.getElementById("theme");
var foldingEl = document.getElementById("folding");
var selectStyleEl = document.getElementById("select_style");
var highlightActiveEl = document.getElementById("highlight_active");
var showHiddenEl = document.getElementById("show_hidden");
var showGutterEl = document.getElementById("show_gutter");
var showPrintMarginEl = document.getElementById("show_print_margin");
var highlightSelectedWordE = document.getElementById("highlight_selected_word");
var showHScrollEl = document.getElementById("show_hscroll");
var softTabEl = document.getElementById("soft_tab");
var behavioursEl = document.getElementById("enable_behaviours");

docs.forEach(function(doc) {
    var option = document.createElement("option");
    option.setAttribute("value", doc.name);
    option.innerHTML = doc.desc;
    docEl.appendChild(option);
});

modes.forEach(function(mode) {
    var option = document.createElement("option");
    option.setAttribute("value", mode.name);
    option.innerHTML = mode.desc;
    modeEl.appendChild(option);
});

bindDropdown("doc", function(value) {
    var doc = docsByName[value].doc;
    var session = env.split.setSession(doc);
    session.name = doc.name;

    updateUIEditorOptions();

    env.editor.focus();
});

function updateUIEditorOptions() {
    var editor = env.editor;
    var session = editor.session;

    docEl.value = session.name;
    modeEl.value = session.getMode().name || "text";

    session.setFoldStyle(foldingEl.value);

    if (!session.getUseWrapMode()) {
        wrapModeEl.value = "off";
    } else {
        wrapModeEl.value = session.getWrapLimitRange().min || "free";
    }

    selectStyleEl.checked = editor.getSelectionStyle() == "line";
    themeEl.value = editor.getTheme();
    highlightActiveEl.checked = editor.getHighlightActiveLine();
    showHiddenEl.checked = editor.getShowInvisibles();
    showGutterEl.checked = editor.renderer.getShowGutter();
    showPrintMarginEl.checked = editor.renderer.getShowPrintMargin();
    highlightSelectedWordE.checked = editor.getHighlightSelectedWord();
    showHScrollEl.checked = editor.renderer.getHScrollBarAlwaysVisible();
    softTabEl.checked = session.getUseSoftTabs();
    behavioursEl.checked = editor.getBehavioursEnabled();
}

bindDropdown("mode", function(value) {
    env.editor.getSession().setMode(modesByName[value].mode || modesByName.text.mode);
});

bindDropdown("theme", function(value) {
    if (module.packaged) {
        loadTheme(value, function() {
            env.editor.setTheme(value);
        });
    }
    else {
        env.editor.setTheme(value);
    }
});

bindDropdown("keybinding", function(value) {
    env.editor.setKeyboardHandler(keybindings[value]);
});

bindDropdown("fontsize", function(value) {
    env.split.setFontSize(value);
});

bindDropdown("folding", function(value) {
    env.editor.getSession().setFoldStyle(value);
    env.editor.setShowFoldWidgets(value !== "manual");
});

bindDropdown("soft_wrap", function(value) {
    var session = env.editor.getSession();
    var renderer = env.editor.renderer;
    switch (value) {
        case "off":
            session.setUseWrapMode(false);
            renderer.setPrintMarginColumn(80);
            break;
        case "40":
            session.setUseWrapMode(true);
            session.setWrapLimitRange(40, 40);
            renderer.setPrintMarginColumn(40);
            break;
        case "80":
            session.setUseWrapMode(true);
            session.setWrapLimitRange(80, 80);
            renderer.setPrintMarginColumn(80);
            break;
        case "free":
            session.setUseWrapMode(true);
            session.setWrapLimitRange(null, null);
            renderer.setPrintMarginColumn(80);
            break;
    }
});

bindCheckbox("select_style", function(checked) {
    env.editor.setSelectionStyle(checked ? "line" : "text");
});

bindCheckbox("highlight_active", function(checked) {
    env.editor.setHighlightActiveLine(checked);
});

bindCheckbox("show_hidden", function(checked) {
    env.editor.setShowInvisibles(checked);
});

bindCheckbox("show_gutter", function(checked) {
    env.editor.renderer.setShowGutter(checked);
});

bindCheckbox("show_print_margin", function(checked) {
    env.editor.renderer.setShowPrintMargin(checked);
});

bindCheckbox("highlight_selected_word", function(checked) {
    env.editor.setHighlightSelectedWord(checked);
});

bindCheckbox("show_hscroll", function(checked) {
    env.editor.renderer.setHScrollBarAlwaysVisible(checked);
});

bindCheckbox("soft_tab", function(checked) {
    env.editor.getSession().setUseSoftTabs(checked);
});

bindCheckbox("enable_behaviours", function(checked) {
    env.editor.setBehavioursEnabled(checked);
});

var secondSession = null;
bindDropdown("split", function(value) {
    var sp = env.split;
    if (value == "none") {
        if (sp.getSplits() == 2) {
            secondSession = sp.getEditor(1).session;
        }
        sp.setSplits(1);
    } else {
        var newEditor = (sp.getSplits() == 1);
        if (value == "below") {
            sp.setOrientation(sp.BELOW);
        } else {
            sp.setOrientation(sp.BESIDE);
        }
        sp.setSplits(2);

        if (newEditor) {
            var session = secondSession || sp.getEditor(0).session;
            var newSession = sp.setSession(session, 1);
            newSession.name = session.name;
        }
    }
});

function bindCheckbox(id, callback) {
    var el = document.getElementById(id);
    var onCheck = function() {
        callback(!!el.checked);
    };
    el.onclick = onCheck;
    onCheck();
}

function bindDropdown(id, callback) {
    var el = document.getElementById(id);
    var onChange = function() {
        callback(el.value);
    };
    el.onchange = onChange;
    onChange();
}

function onResize() {
    var left = env.split.$container.offsetLeft;
    var width = document.documentElement.clientWidth - left;
    container.style.width = width + "px";
    container.style.height = document.documentElement.clientHeight + "px";
    env.split.resize();
//        env.editor.resize();
}

window.onresize = onResize;
env.editor.renderer.onResize(true);

event.addListener(container, "dragover", function(e) {
    return event.preventDefault(e);
});

event.addListener(container, "drop", function(e) {
    var file;
    try {
        file = e.dataTransfer.files[0];
    } catch(err) {
        return event.stopEvent();
    }

    if (window.FileReader) {
        var reader = new FileReader();
        reader.onload = function() {
            env.editor.getSelection().selectAll();

            var mode = modesByName.text;
            for (var i = 0; i < modes.length; i++) {
                if (modes[i].supportsFile(file.name)) {
                    mode = modes[i];
                    break;
                }
            }

            env.editor.onTextInput(reader.result);

            modeEl.value = mode.name;
            env.editor.getSession().setMode(mode.mode);
        };
        reader.readAsText(file);
    }

    return event.preventDefault(e);
});

/**
 * This demonstrates how you can define commands and bind shortcuts to them.
 */

// Fake-Save, works from the editor and the command line.
var commands = env.editor.commands;

commands.addCommand({
    name: "save",
    bindKey: {
        win: "Ctrl-S",
        mac: "Command-S",
        sender: "editor"
    },
    exec: function() {
        alert("Fake Save File");
    }
});

// Fake-Print with custom lookup-sender-match function.
commands.addCommand({
    name: "print",
    bindKey: {
        win: "Ctrl-P",
        mac: "Command-P",
        sender: function(env, sender, hashId, keyString) {
            if (sender == "editor") {
                return true;
            } else {
                alert("Sorry, can only print from the editor");
            }
        }
    },
    exec: function() {
        alert("Fake Print File");
    }
});

});
// vim:set ts=4 sts=4 sw=4 st:
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- tlrobinson Tom Robinson Copyright (C) 2009-2010 MIT License (Narwhal Project)
// -- dantman Daniel Friesen Copyright(C) 2010 XXX No License Specified
// -- fschaefer Florian Schäfer Copyright (C) 2010 MIT License
// -- Irakli Gozalishvili Copyright (C) 2010 MIT License

/*!
    Copyright (c) 2009, 280 North Inc. http://280north.com/
    MIT License. http://github.com/280north/narwhal/blob/master/README.md
*/

define('ace/lib/fixoldbrowsers', ['require', 'exports', 'module' , '../../../../../regexp', '../../../../../es5-shim'], function(require, exports, module) {
"use strict";

require("./regexp");
require("./es5-shim");

});/**
 * based on code from:
 * 
 * @license RequireJS text 0.25.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
define('ace/lib/net', ['require', 'exports', 'module' ], function(require, exports, module) {
"use strict";

exports.get = function (url, callback) {
    var xhr = exports.createXhr();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function (evt) {
        //Do not explicitly handle errors, those should be
        //visible via console output in the browser.
        if (xhr.readyState === 4) {
            callback(xhr.responseText);
        }
    };
    xhr.send(null);
};

var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];

exports.createXhr = function() {
    //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
    var xhr, i, progId;
    if (typeof XMLHttpRequest !== "undefined") {
        return new XMLHttpRequest();
    } else {
        for (i = 0; i < 3; i++) {
            progId = progIds[i];
            try {
                xhr = new ActiveXObject(progId);
            } catch (e) {}

            if (xhr) {
                progIds = [progId];  // so faster next time
                break;
            }
        }
    }

    if (!xhr) {
        throw new Error("createXhr(): XMLHttpRequest not available");
    }

    return xhr;
};

exports.loadScript = function(path, callback) {
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('script');

    s.src = path;
    head.appendChild(s);
    
    s.onload = callback;
};

});/* ***** BEGIN LICENSE BLOCK *****
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

define('ace/lib/event', ['require', 'exports', 'module' , '../../../../../keys', '../../../../../useragent', '../../../../../dom'], function(require, exports, module) {
"use strict";

var keys = require("./keys");
var useragent = require("./useragent");
var dom = require("./dom");

exports.addListener = function(elem, type, callback) {
    if (elem.addEventListener) {
        return elem.addEventListener(type, callback, false);
    }
    if (elem.attachEvent) {
        var wrapper = function() {
            callback(window.event);
        };
        callback._wrapper = wrapper;
        elem.attachEvent("on" + type, wrapper);
    }
};

exports.removeListener = function(elem, type, callback) {
    if (elem.removeEventListener) {
        return elem.removeEventListener(type, callback, false);
    }
    if (elem.detachEvent) {
        elem.detachEvent("on" + type, callback._wrapper || callback);
    }
};

/**
* Prevents propagation and clobbers the default action of the passed event
*/
exports.stopEvent = function(e) {
    exports.stopPropagation(e);
    exports.preventDefault(e);
    return false;
};

exports.stopPropagation = function(e) {
    if (e.stopPropagation)
        e.stopPropagation();
    else
        e.cancelBubble = true;
};

exports.preventDefault = function(e) {
    if (e.preventDefault)
        e.preventDefault();
    else
        e.returnValue = false;
};

exports.getDocumentX = function(e) {
    if (e.clientX) {
        return e.clientX + dom.getPageScrollLeft();
    } else {
        return e.pageX;
    }
};

exports.getDocumentY = function(e) {
    if (e.clientY) {
        return e.clientY + dom.getPageScrollTop();
    } else {
        return e.pageY;
    }
};

/**
 * @return {Number} 0 for left button, 1 for middle button, 2 for right button
 */
exports.getButton = function(e) {
    if (e.type == "dblclick")
        return 0;
    else if (e.type == "contextmenu")
        return 2;

    // DOM Event
    if (e.preventDefault) {
        return e.button;
    }
    // old IE
    else {
        return {1:0, 2:2, 4:1}[e.button];
    }
};

if (document.documentElement.setCapture) {
    exports.capture = function(el, eventHandler, releaseCaptureHandler) {
        function onMouseMove(e) {
            eventHandler(e);
            return exports.stopPropagation(e);
        }

        var called = false;
        function onReleaseCapture(e) {
            eventHandler(e);

            if (!called) {
                called = true;
                releaseCaptureHandler(e);
            }

            exports.removeListener(el, "mousemove", eventHandler);
            exports.removeListener(el, "mouseup", onReleaseCapture);
            exports.removeListener(el, "losecapture", onReleaseCapture);

            el.releaseCapture();
        }

        exports.addListener(el, "mousemove", eventHandler);
        exports.addListener(el, "mouseup", onReleaseCapture);
        exports.addListener(el, "losecapture", onReleaseCapture);
        el.setCapture();
    };
}
else {
    exports.capture = function(el, eventHandler, releaseCaptureHandler) {
        function onMouseMove(e) {
            eventHandler(e);
            e.stopPropagation();
        }

        function onMouseUp(e) {
            eventHandler && eventHandler(e);
            releaseCaptureHandler && releaseCaptureHandler(e);

            document.removeEventListener("mousemove", onMouseMove, true);
            document.removeEventListener("mouseup", onMouseUp, true);

            e.stopPropagation();
        }

        document.addEventListener("mousemove", onMouseMove, true);
        document.addEventListener("mouseup", onMouseUp, true);
    };
}

exports.addMouseWheelListener = function(el, callback) {
    var max = 0;
    var listener = function(e) {
        if (e.wheelDelta !== undefined) {

            // some versions of Safari (e.g. 5.0.5) report insanely high
            // scroll values. These browsers require a higher factor
            if (Math.abs(e.wheelDeltaY) > max)
                max = Math.abs(e.wheelDeltaY);

            if (max > 5000)
                var factor = 400;
            else
                var factor = 8;

            if (e.wheelDeltaX !== undefined) {
                e.wheelX = -e.wheelDeltaX / factor;
                e.wheelY = -e.wheelDeltaY / factor;
            } else {
                e.wheelX = 0;
                e.wheelY = -e.wheelDelta / factor;
            }
        }
        else {
            if (e.axis && e.axis == e.HORIZONTAL_AXIS) {
                e.wheelX = (e.detail || 0) * 5;
                e.wheelY = 0;
            } else {
                e.wheelX = 0;
                e.wheelY = (e.detail || 0) * 5;
            }
        }
        callback(e);
    };
    exports.addListener(el, "DOMMouseScroll", listener);
    exports.addListener(el, "mousewheel", listener);
};

exports.addMultiMouseDownListener = function(el, button, count, timeout, callback) {
    var clicks = 0;
    var startX, startY;

    var listener = function(e) {
        clicks += 1;
        if (clicks == 1) {
            startX = e.clientX;
            startY = e.clientY;

            setTimeout(function() {
                clicks = 0;
            }, timeout || 600);
        }

        var isButton = exports.getButton(e) == button;
        if (!isButton || Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5)
            clicks = 0;

        if (clicks == count) {
            clicks = 0;
            callback(e);
        }

        if (isButton)
            return exports.preventDefault(e);
    };

    exports.addListener(el, "mousedown", listener);
    useragent.isOldIE && exports.addListener(el, "dblclick", listener);
};

function normalizeCommandKeys(callback, e, keyCode) {
    var hashId = 0;
    if (useragent.isOpera && useragent.isMac) {
        hashId = 0 | (e.metaKey ? 1 : 0) | (e.altKey ? 2 : 0)
            | (e.shiftKey ? 4 : 0) | (e.ctrlKey ? 8 : 0);
    } else {
        hashId = 0 | (e.ctrlKey ? 1 : 0) | (e.altKey ? 2 : 0)
            | (e.shiftKey ? 4 : 0) | (e.metaKey ? 8 : 0);
    }

    if (keyCode in keys.MODIFIER_KEYS) {
        switch (keys.MODIFIER_KEYS[keyCode]) {
            case "Alt":
                hashId = 2;
                break;
            case "Shift":
                hashId = 4;
                break;
            case "Ctrl":
                hashId = 1;
                break;
            default:
                hashId = 8;
                break;
        }
        keyCode = 0;
    }

    if (hashId & 8 && (keyCode == 91 || keyCode == 93)) {
        keyCode = 0;
    }

    // If there is no hashID and the keyCode is not a function key, then
    // we don't call the callback as we don't handle a command key here
    // (it's a normal key/character input).
    if (!hashId && !(keyCode in keys.FUNCTION_KEYS) && !(keyCode in keys.PRINTABLE_KEYS)) {
        return false;
    }
    return callback(e, hashId, keyCode);
}

exports.addCommandKeyListener = function(el, callback) {
    var addListener = exports.addListener;
    if (useragent.isOldGecko || useragent.isOpera) {
        // Old versions of Gecko aka. Firefox < 4.0 didn't repeat the keydown
        // event if the user pressed the key for a longer time. Instead, the
        // keydown event was fired once and later on only the keypress event.
        // To emulate the 'right' keydown behavior, the keyCode of the initial
        // keyDown event is stored and in the following keypress events the
        // stores keyCode is used to emulate a keyDown event.
        var lastKeyDownKeyCode = null;
        addListener(el, "keydown", function(e) {
            lastKeyDownKeyCode = e.keyCode;
        });
        addListener(el, "keypress", function(e) {
            return normalizeCommandKeys(callback, e, lastKeyDownKeyCode);
        });
    } else {
        var lastDown = null;

        addListener(el, "keydown", function(e) {
            lastDown = e.keyIdentifier || e.keyCode;
            return normalizeCommandKeys(callback, e, e.keyCode);
        });
    }
};

if (window.postMessage) {
    var postMessageId = 1;
    exports.nextTick = function(callback, win) {
        win = win || window;
        var messageName = "zero-timeout-message-" + postMessageId;            
        exports.addListener(win, "message", function listener(e) {
            if (e.data == messageName) {
                exports.stopPropagation(e);
                exports.removeListener(win, "message", listener);
                callback();
            }
        });
        win.postMessage(messageName, "*");
    };
}
else {
    exports.nextTick = function(callback, win) {
        win = win || window;
        window.setTimeout(callback, 0);
    };
}

});
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

define('ace/theme/textmate', ['require', 'exports', 'module' , '../../../../../../lib/dom'], function(require, exports, module) {
"use strict";

exports.isDark = false;
exports.cssClass = "ace-tm";
exports.cssText = ".ace-tm .ace_editor {\
  border: 2px solid rgb(159, 159, 159);\
}\
\
.ace-tm .ace_editor.ace_focus {\
  border: 2px solid #327fbd;\
}\
\
.ace-tm .ace_gutter {\
  background: #e8e8e8;\
  color: #333;\
}\
\
.ace-tm .ace_print_margin {\
  width: 1px;\
  background: #e8e8e8;\
}\
\
.ace-tm .ace_fold {\
    background-color: #6B72E6;\
}\
\
.ace-tm .ace_text-layer {\
  cursor: text;\
}\
\
.ace-tm .ace_cursor {\
  border-left: 2px solid black;\
}\
\
.ace-tm .ace_cursor.ace_overwrite {\
  border-left: 0px;\
  border-bottom: 1px solid black;\
}\
        \
.ace-tm .ace_line .ace_invisible {\
  color: rgb(191, 191, 191);\
}\
\
.ace-tm .ace_line .ace_keyword {\
  color: blue;\
}\
\
.ace-tm .ace_line .ace_constant.ace_buildin {\
  color: rgb(88, 72, 246);\
}\
\
.ace-tm .ace_line .ace_constant.ace_language {\
  color: rgb(88, 92, 246);\
}\
\
.ace-tm .ace_line .ace_constant.ace_library {\
  color: rgb(6, 150, 14);\
}\
\
.ace-tm .ace_line .ace_invalid {\
  background-color: rgb(153, 0, 0);\
  color: white;\
}\
\
.ace-tm .ace_line .ace_support.ace_function {\
  color: rgb(60, 76, 114);\
}\
\
.ace-tm .ace_line .ace_support.ace_constant {\
  color: rgb(6, 150, 14);\
}\
\
.ace-tm .ace_line .ace_support.ace_type,\
.ace-tm .ace_line .ace_support.ace_class {\
  color: rgb(109, 121, 222);\
}\
\
.ace-tm .ace_line .ace_keyword.ace_operator {\
  color: rgb(104, 118, 135);\
}\
\
.ace-tm .ace_line .ace_string {\
  color: rgb(3, 106, 7);\
}\
\
.ace-tm .ace_line .ace_comment {\
  color: rgb(76, 136, 107);\
}\
\
.ace-tm .ace_line .ace_comment.ace_doc {\
  color: rgb(0, 102, 255);\
}\
\
.ace-tm .ace_line .ace_comment.ace_doc.ace_tag {\
  color: rgb(128, 159, 191);\
}\
\
.ace-tm .ace_line .ace_constant.ace_numeric {\
  color: rgb(0, 0, 205);\
}\
\
.ace-tm .ace_line .ace_variable {\
  color: rgb(49, 132, 149);\
}\
\
.ace-tm .ace_line .ace_xml_pe {\
  color: rgb(104, 104, 91);\
}\
\
.ace-tm .ace_entity.ace_name.ace_function {\
  color: #0000A2;\
}\
\
.ace-tm .ace_markup.ace_markupine {\
    text-decoration:underline;\
}\
\
.ace-tm .ace_markup.ace_heading {\
  color: rgb(12, 7, 255);\
}\
\
.ace-tm .ace_markup.ace_list {\
  color:rgb(185, 6, 144);\
}\
\
.ace-tm .ace_marker-layer .ace_selection {\
  background: rgb(181, 213, 255);\
}\
\
.ace-tm .ace_marker-layer .ace_step {\
  background: rgb(252, 255, 0);\
}\
\
.ace-tm .ace_marker-layer .ace_stack {\
  background: rgb(164, 229, 101);\
}\
\
.ace-tm .ace_marker-layer .ace_bracket {\
  margin: -1px 0 0 -1px;\
  border: 1px solid rgb(192, 192, 192);\
}\
\
.ace-tm .ace_marker-layer .ace_active_line {\
  background: rgba(0, 0, 0, 0.07);\
}\
\
.ace-tm .ace_marker-layer .ace_selected_word {\
  background: rgb(250, 250, 255);\
  border: 1px solid rgb(200, 200, 250);\
}\
\
.ace-tm .ace_meta.ace_tag {\
  color:rgb(28, 2, 255);\
}\
\
.ace-tm .ace_string.ace_regex {\
  color: rgb(255, 0, 0)\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
/* vim:ts=4:sts=4:sw=4:
 * ***** BEGIN LICENSE BLOCK *****
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
 *      Mihai Sucan <mihai DOT sucan AT gmail DOT com>
 *      Julian Viereck <julian DOT viereck AT gmail DOT com>
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

define('ace/edit_session', ['require', 'exports', 'module' , '../../../../../lib/oop', '../../../../../lib/lang', '../../../../../lib/event_emitter', '../../../../../selection', '../../../../../mode/text', '../../../../../range', '../../../../../document', '../../../../../background_tokenizer', '../../../../../edit_session/folding', '../../../../../edit_session/bracket_match'], function(require, exports, module) {
"use strict";

var oop = require("./lib/oop");
var lang = require("./lib/lang");
var EventEmitter = require("./lib/event_emitter").EventEmitter;
var Selection = require("./selection").Selection;
var TextMode = require("./mode/text").Mode;
var Range = require("./range").Range;
var Document = require("./document").Document;
var BackgroundTokenizer = require("./background_tokenizer").BackgroundTokenizer;

var EditSession = function(text, mode) {
    this.$modified = true;
    this.$breakpoints = [];
    this.$frontMarkers = {};
    this.$backMarkers = {};
    this.$markerId = 1;
    this.$rowCache = [];
    this.$wrapData = [];
    this.$foldData = [];
    this.$undoSelect = true;
    this.$foldData.toString = function() {
        var str = "";
        this.forEach(function(foldLine) {
            str += "\n" + foldLine.toString();
        });
        return str;
    }

    if (text instanceof Document) {
        this.setDocument(text);
    } else {
        this.setDocument(new Document(text));
    }

    this.selection = new Selection(this);
    if (mode)
        this.setMode(mode);
    else
        this.setMode(new TextMode());
};


(function() {

    oop.implement(this, EventEmitter);

    this.setDocument = function(doc) {
        if (this.doc)
            throw new Error("Document is already set");

        this.doc = doc;
        doc.on("change", this.onChange.bind(this));
        this.on("changeFold", this.onChangeFold.bind(this));

        if (this.bgTokenizer) {
            this.bgTokenizer.setDocument(this.getDocument());
            this.bgTokenizer.start(0);
        }
    };

    this.getDocument = function() {
        return this.doc;
    };

    this.$resetRowCache = function(row) {
        if (row == 0) {
            this.$rowCache = [];
            return;
        }
        var rowCache = this.$rowCache;
        for (var i = 0; i < rowCache.length; i++) {
            if (rowCache[i].docRow >= row) {
                rowCache.splice(i, rowCache.length);
                return;
            }
        }
    };

    this.onChangeFold = function(e) {
        var fold = e.data;
        this.$resetRowCache(fold.start.row);
    };

    this.onChange = function(e) {
        var delta = e.data;
        this.$modified = true;

        this.$resetRowCache(delta.range.start.row);

        var removedFolds = this.$updateInternalDataOnChange(e);
        if (!this.$fromUndo && this.$undoManager && !delta.ignore) {
            this.$deltasDoc.push(delta);
            if (removedFolds && removedFolds.length != 0) {
                this.$deltasFold.push({
                    action: "removeFolds",
                    folds:  removedFolds
                });
            }

            this.$informUndoManager.schedule();
        }

        this.bgTokenizer.start(delta.range.start.row);
        this._emit("change", e);
    };

    this.setValue = function(text) {
        this.doc.setValue(text);
        this.selection.moveCursorTo(0, 0);
        this.selection.clearSelection();

        this.$resetRowCache(0);
        this.$deltas = [];
        this.$deltasDoc = [];
        this.$deltasFold = [];
        this.getUndoManager().reset();
    };

    this.getValue =
    this.toString = function() {
        return this.doc.getValue();
    };

    this.getSelection = function() {
        return this.selection;
    };

    this.getState = function(row) {
        return this.bgTokenizer.getState(row);
    };

    this.getTokens = function(firstRow, lastRow) {
        return this.bgTokenizer.getTokens(firstRow, lastRow);
    };

    this.getTokenAt = function(row, column) {
        var tokens = this.bgTokenizer.getTokens(row, row)[0].tokens;
        var token, c = 0;
        if (column == null) {
            i = tokens.length - 1;
            c = this.getLine(row).length;
        } else {
            for (var i = 0; i < tokens.length; i++) {
                c += tokens[i].value.length;
                if (c >= column)
                    break;
            }
        }
        token = tokens[i];
        if (!token)
            return null;
        token.index = i;
        token.start = c - token.value.length;
        return token;
    };

    this.setUndoManager = function(undoManager) {
        this.$undoManager = undoManager;
        this.$resetRowCache(0);
        this.$deltas = [];
        this.$deltasDoc = [];
        this.$deltasFold = [];

        if (this.$informUndoManager)
            this.$informUndoManager.cancel();

        if (undoManager) {
            var self = this;
            this.$syncInformUndoManager = function() {
                self.$informUndoManager.cancel();

                if (self.$deltasFold.length) {
                    self.$deltas.push({
                        group: "fold",
                        deltas: self.$deltasFold
                    });
                    self.$deltasFold = [];
                }

                if (self.$deltasDoc.length) {
                    self.$deltas.push({
                        group: "doc",
                        deltas: self.$deltasDoc
                    });
                    self.$deltasDoc = [];
                }

                if (self.$deltas.length > 0) {
                    undoManager.execute({
                        action: "aceupdate",
                        args: [self.$deltas, self]
                    });
                }

                self.$deltas = [];
            }
            this.$informUndoManager =
                lang.deferredCall(this.$syncInformUndoManager);
        }
    };

    this.$defaultUndoManager = {
        undo: function() {},
        redo: function() {},
        reset: function() {}
    };

    this.getUndoManager = function() {
        return this.$undoManager || this.$defaultUndoManager;
    },

    this.getTabString = function() {
        if (this.getUseSoftTabs()) {
            return lang.stringRepeat(" ", this.getTabSize());
        } else {
            return "\t";
        }
    };

    this.$useSoftTabs = true;
    this.setUseSoftTabs = function(useSoftTabs) {
        if (this.$useSoftTabs === useSoftTabs) return;

        this.$useSoftTabs = useSoftTabs;
    };

    this.getUseSoftTabs = function() {
        return this.$useSoftTabs;
    };

    this.$tabSize = 4;
    this.setTabSize = function(tabSize) {
        if (isNaN(tabSize) || this.$tabSize === tabSize) return;

        this.$modified = true;
        this.$tabSize = tabSize;
        this._emit("changeTabSize");
    };

    this.getTabSize = function() {
        return this.$tabSize;
    };

    this.isTabStop = function(position) {
        return this.$useSoftTabs && (position.column % this.$tabSize == 0);
    };

    this.$overwrite = false;
    this.setOverwrite = function(overwrite) {
        if (this.$overwrite == overwrite) return;

        this.$overwrite = overwrite;
        this._emit("changeOverwrite");
    };

    this.getOverwrite = function() {
        return this.$overwrite;
    };

    this.toggleOverwrite = function() {
        this.setOverwrite(!this.$overwrite);
    };

    this.getBreakpoints = function() {
        return this.$breakpoints;
    };

    this.setBreakpoints = function(rows) {
        this.$breakpoints = [];
        for (var i=0; i<rows.length; i++) {
            this.$breakpoints[rows[i]] = true;
        }
        this._emit("changeBreakpoint", {});
    };

    this.clearBreakpoints = function() {
        this.$breakpoints = [];
        this._emit("changeBreakpoint", {});
    };

    this.setBreakpoint = function(row) {
        this.$breakpoints[row] = true;
        this._emit("changeBreakpoint", {});
    };

    this.clearBreakpoint = function(row) {
        delete this.$breakpoints[row];
        this._emit("changeBreakpoint", {});
    };

    this.getBreakpoints = function() {
        return this.$breakpoints;
    };

    this.addMarker = function(range, clazz, type, inFront) {
        var id = this.$markerId++;

        var marker = {
            range : range,
            type : type || "line",
            renderer: typeof type == "function" ? type : null,
            clazz : clazz,
            inFront: !!inFront
        }

        if (inFront) {
            this.$frontMarkers[id] = marker;
            this._emit("changeFrontMarker")
        } else {
            this.$backMarkers[id] = marker;
            this._emit("changeBackMarker")
        }

        return id;
    };

    this.removeMarker = function(markerId) {
        var marker = this.$frontMarkers[markerId] || this.$backMarkers[markerId];
        if (!marker)
            return;

        var markers = marker.inFront ? this.$frontMarkers : this.$backMarkers;
        if (marker) {
            delete (markers[markerId]);
            this._emit(marker.inFront ? "changeFrontMarker" : "changeBackMarker");
        }
    };

    this.getMarkers = function(inFront) {
        return inFront ? this.$frontMarkers : this.$backMarkers;
    };

    /**
     * Error:
     *  {
     *    row: 12,
     *    column: 2, //can be undefined
     *    text: "Missing argument",
     *    type: "error" // or "warning" or "info"
     *  }
     */
    this.setAnnotations = function(annotations) {
        this.$annotations = {};
        for (var i=0; i<annotations.length; i++) {
            var annotation = annotations[i];
            var row = annotation.row;
            if (this.$annotations[row])
                this.$annotations[row].push(annotation);
            else
                this.$annotations[row] = [annotation];
        }
        this._emit("changeAnnotation", {});
    };

    this.getAnnotations = function() {
        return this.$annotations || {};
    };

    this.clearAnnotations = function() {
        this.$annotations = {};
        this._emit("changeAnnotation", {});
    };

    this.$detectNewLine = function(text) {
        var match = text.match(/^.*?(\r?\n)/m);
        if (match) {
            this.$autoNewLine = match[1];
        } else {
            this.$autoNewLine = "\n";
        }
    };

    this.getWordRange = function(row, column) {
        var line = this.getLine(row);

        var inToken = false;
        if (column > 0) {
            inToken = !!line.charAt(column - 1).match(this.tokenRe);
        }

        if (!inToken) {
            inToken = !!line.charAt(column).match(this.tokenRe);
        }

        var re = inToken ? this.tokenRe : this.nonTokenRe;

        var start = column;
        if (start > 0) {
            do {
                start--;
            }
            while (start >= 0 && line.charAt(start).match(re));
            start++;
        }

        var end = column;
        while (end < line.length && line.charAt(end).match(re)) {
            end++;
        }

        return new Range(row, start, row, end);
    };

    // Gets the range of a word including its right whitespace
    this.getAWordRange = function(row, column) {
        var wordRange = this.getWordRange(row, column);
        var line = this.getLine(wordRange.end.row);

        while (line.charAt(wordRange.end.column).match(/[ \t]/)) {
            wordRange.end.column += 1;
        }
        return wordRange;
    };

    this.setNewLineMode = function(newLineMode) {
        this.doc.setNewLineMode(newLineMode);
    };

    this.getNewLineMode = function() {
        return this.doc.getNewLineMode();
    };

    this.$useWorker = true;
    this.setUseWorker = function(useWorker) {
        if (this.$useWorker == useWorker)
            return;

        this.$useWorker = useWorker;

        this.$stopWorker();
        if (useWorker)
            this.$startWorker();
    };

    this.getUseWorker = function() {
        return this.$useWorker;
    };

    this.onReloadTokenizer = function(e) {
        var rows = e.data;
        this.bgTokenizer.start(rows.first);
        this._emit("tokenizerUpdate", e);
    };

    this.$mode = null;
    this.setMode = function(mode) {
        if (this.$mode === mode) return;
        this.$mode = mode;

        this.$stopWorker();

        if (this.$useWorker)
            this.$startWorker();

        var tokenizer = mode.getTokenizer();

        if(tokenizer.addEventListener !== undefined) {
            var onReloadTokenizer = this.onReloadTokenizer.bind(this);
            tokenizer.addEventListener("update", onReloadTokenizer);
        }

        if (!this.bgTokenizer) {
            this.bgTokenizer = new BackgroundTokenizer(tokenizer);
            var _self = this;
            this.bgTokenizer.addEventListener("update", function(e) {
                _self._emit("tokenizerUpdate", e);
            });
        } else {
            this.bgTokenizer.setTokenizer(tokenizer);
        }

        this.bgTokenizer.setDocument(this.getDocument());
        this.bgTokenizer.start(0);

        this.tokenRe = mode.tokenRe;
        this.nonTokenRe = mode.nonTokenRe;

        this.$setFolding(mode.foldingRules);

        this._emit("changeMode");
    };

    this.$stopWorker = function() {
        if (this.$worker)
            this.$worker.terminate();

        this.$worker = null;
    };

    this.$startWorker = function() {
        if (typeof Worker !== "undefined" && !require.noWorker) {
            try {
                this.$worker = this.$mode.createWorker(this);
            } catch (e) {
                console.log("Could not load worker");
                console.log(e);
                this.$worker = null;
            }
        }
        else
            this.$worker = null;
    };

    this.getMode = function() {
        return this.$mode;
    };
    
    this.$scrollTop = 0;
    this.setScrollTop = function(scrollTop) {
        scrollTop = Math.round(Math.max(0, scrollTop));
        if (this.$scrollTop === scrollTop)
            return;

        this.$scrollTop = scrollTop;
        this._emit("changeScrollTop", scrollTop);
    };

    this.getScrollTop = function() {
        return this.$scrollTop;
    };
    
    this.$scrollLeft = 0;
    this.setScrollLeft = function(scrollLeft) {
        scrollLeft = Math.round(Math.max(0, scrollLeft));
        if (this.$scrollLeft === scrollLeft)
            return;

        this.$scrollLeft = scrollLeft;
        this._emit("changeScrollLeft", scrollLeft);
    };

    this.getScrollLeft = function() {
        return this.$scrollLeft;
    };

    this.getWidth = function() {
        this.$computeWidth();
        return this.width;
    };

    this.getScreenWidth = function() {
        this.$computeWidth();
        return this.screenWidth;
    };

    this.$computeWidth = function(force) {
        if (this.$modified || force) {
            this.$modified = false;

            var lines = this.doc.getAllLines();
            var longestLine = 0;
            var longestScreenLine = 0;

            for ( var i = 0; i < lines.length; i++) {
                var foldLine = this.getFoldLine(i),
                    line, len;

                line = lines[i];
                if (foldLine) {
                    var end = foldLine.range.end;
                    line = this.getFoldDisplayLine(foldLine);
                    // Continue after the foldLine.end.row. All the lines in
                    // between are folded.
                    i = end.row;
                }
                len = line.length;
                longestLine = Math.max(longestLine, len);
                if (!this.$useWrapMode) {
                    longestScreenLine = Math.max(
                        longestScreenLine,
                        this.$getStringScreenWidth(line)[0]
                    );
                }
            }
            this.width = longestLine;

            if (this.$useWrapMode) {
                this.screenWidth = this.$wrapLimit;
            } else {
                this.screenWidth = longestScreenLine;
            }
        }
    };

    /**
     * Get a verbatim copy of the given line as it is in the document
     */
    this.getLine = function(row) {
        return this.doc.getLine(row);
    };

    this.getLines = function(firstRow, lastRow) {
        return this.doc.getLines(firstRow, lastRow);
    };

    this.getLength = function() {
        return this.doc.getLength();
    };

    this.getTextRange = function(range) {
        return this.doc.getTextRange(range);
    };

    this.insert = function(position, text) {
        return this.doc.insert(position, text);
    };

    this.remove = function(range) {
        return this.doc.remove(range);
    };

    this.undoChanges = function(deltas, dontSelect) {
        if (!deltas.length)
            return;

        this.$fromUndo = true;
        var lastUndoRange = null;
        for (var i = deltas.length - 1; i != -1; i--) {
            var delta = deltas[i];
            if (delta.group == "doc") {
                this.doc.revertDeltas(delta.deltas);
                lastUndoRange =
                    this.$getUndoSelection(delta.deltas, true, lastUndoRange);
            } else {
                delta.deltas.forEach(function(foldDelta) {
                    this.addFolds(foldDelta.folds);
                }, this);
            }
        }
        this.$fromUndo = false;
        lastUndoRange &&
            this.$undoSelect &&
            !dontSelect &&
            this.selection.setSelectionRange(lastUndoRange);
        return lastUndoRange;
    };

    this.redoChanges = function(deltas, dontSelect) {
        if (!deltas.length)
            return;

        this.$fromUndo = true;
        var lastUndoRange = null;
        for (var i = 0; i < deltas.length; i++) {
            var delta = deltas[i];
            if (delta.group == "doc") {
                this.doc.applyDeltas(delta.deltas);
                lastUndoRange =
                    this.$getUndoSelection(delta.deltas, false, lastUndoRange);
            }
        }
        this.$fromUndo = false;
        lastUndoRange &&
            this.$undoSelect &&
            !dontSelect &&
            this.selection.setSelectionRange(lastUndoRange);
        return lastUndoRange;
    };
    
    this.setUndoSelect = function(enable) {
        this.$undoSelect = enable;
    };

    this.$getUndoSelection = function(deltas, isUndo, lastUndoRange) {
        function isInsert(delta) {
            var insert =
                delta.action == "insertText" || delta.action == "insertLines";
            return isUndo ? !insert : insert;
        }

        var delta = deltas[0];
        var range, point;
        var lastDeltaIsInsert = false;
        if (isInsert(delta)) {
            range = delta.range.clone();
            lastDeltaIsInsert = true;
        } else {
            range = Range.fromPoints(delta.range.start, delta.range.start);
            lastDeltaIsInsert = false;
        }

        for (var i = 1; i < deltas.length; i++) {
            delta = deltas[i];
            if (isInsert(delta)) {
                point = delta.range.start;
                if (range.compare(point.row, point.column) == -1) {
                    range.setStart(delta.range.start);
                }
                point = delta.range.end;
                if (range.compare(point.row, point.column) == 1) {
                    range.setEnd(delta.range.end);
                }
                lastDeltaIsInsert = true;
            } else {
                point = delta.range.start;
                if (range.compare(point.row, point.column) == -1) {
                    range =
                        Range.fromPoints(delta.range.start, delta.range.start);
                }
                lastDeltaIsInsert = false;
            }
        }

        // Check if this range and the last undo range has something in common.
        // If true, merge the ranges.
        if (lastUndoRange != null) {
            var cmp = lastUndoRange.compareRange(range);
            if (cmp == 1) {
                range.setStart(lastUndoRange.start);
            } else if (cmp == -1) {
                range.setEnd(lastUndoRange.end);
            }
        }

        return range;
    },

    this.replace = function(range, text) {
        return this.doc.replace(range, text);
    };

    /**
     * Move a range of text from the given range to the given position.
     *
     * @param fromRange {Range} The range of text you want moved within the
     * document.
     * @param toPosition {Object} The location (row and column) where you want
     * to move the text to.
     * @return {Range} The new range where the text was moved to.
     */
    this.moveText = function(fromRange, toPosition) {
        var text = this.getTextRange(fromRange);
        this.remove(fromRange);

        var toRow = toPosition.row;
        var toColumn = toPosition.column;

        // Make sure to update the insert location, when text is removed in
        // front of the chosen point of insertion.
        if (!fromRange.isMultiLine() && fromRange.start.row == toRow &&
            fromRange.end.column < toColumn)
            toColumn -= text.length;

        if (fromRange.isMultiLine() && fromRange.end.row < toRow) {
            var lines = this.doc.$split(text);
            toRow -= lines.length - 1;
        }

        var endRow = toRow + fromRange.end.row - fromRange.start.row;
        var endColumn = fromRange.isMultiLine() ?
                        fromRange.end.column :
                        toColumn + fromRange.end.column - fromRange.start.column;

        var toRange = new Range(toRow, toColumn, endRow, endColumn);

        this.insert(toRange.start, text);

        return toRange;
    };

    this.indentRows = function(startRow, endRow, indentString) {
        indentString = indentString.replace(/\t/g, this.getTabString());
        for (var row=startRow; row<=endRow; row++)
            this.insert({row: row, column:0}, indentString);
    };

    this.outdentRows = function (range) {
        var rowRange = range.collapseRows();
        var deleteRange = new Range(0, 0, 0, 0);
        var size = this.getTabSize();

        for (var i = rowRange.start.row; i <= rowRange.end.row; ++i) {
            var line = this.getLine(i);

            deleteRange.start.row = i;
            deleteRange.end.row = i;
            for (var j = 0; j < size; ++j)
                if (line.charAt(j) != ' ')
                    break;
            if (j < size && line.charAt(j) == '\t') {
                deleteRange.start.column = j;
                deleteRange.end.column = j + 1;
            } else {
                deleteRange.start.column = 0;
                deleteRange.end.column = j;
            }
            this.remove(deleteRange);
        }
    };

    this.moveLinesUp = function(firstRow, lastRow) {
        if (firstRow <= 0) return 0;

        var removed = this.doc.removeLines(firstRow, lastRow);
        this.doc.insertLines(firstRow - 1, removed);
        return -1;
    };

    this.moveLinesDown = function(firstRow, lastRow) {
        if (lastRow >= this.doc.getLength()-1) return 0;

        var removed = this.doc.removeLines(firstRow, lastRow);
        this.doc.insertLines(firstRow+1, removed);
        return 1;
    };

    this.duplicateLines = function(firstRow, lastRow) {
        var firstRow = this.$clipRowToDocument(firstRow);
        var lastRow = this.$clipRowToDocument(lastRow);

        var lines = this.getLines(firstRow, lastRow);
        this.doc.insertLines(firstRow, lines);

        var addedRows = lastRow - firstRow + 1;
        return addedRows;
    };

    this.$clipRowToDocument = function(row) {
        return Math.max(0, Math.min(row, this.doc.getLength()-1));
    };

    this.$clipColumnToRow = function(row, column) {
        if (column < 0)
            return 0;
        return Math.min(this.doc.getLine(row).length, column);
    };

    this.$clipPositionToDocument = function(row, column) {
        column = Math.max(0, column);

        if (row < 0) {
            row = 0;
            column = 0;
        } else {
            var len = this.doc.getLength();
            if (row >= len) {
                row = len - 1;
                column = this.doc.getLine(len-1).length;
            } else {
                column = Math.min(this.doc.getLine(row).length, column);
            }
        }

        return {
            row: row,
            column: column
        };
    };

    this.$clipRangeToDocument = function(range) {
        if (range.start.row < 0) {
            range.start.row = 0;
            range.start.column = 0
        } else {
            range.start.column = this.$clipColumnToRow(
                range.start.row,
                range.start.column
            );
        }
        
        var len = this.doc.getLength() - 1;
        if (range.end.row > len) {
            range.end.row = len;
            range.end.column = this.doc.getLine(len).length;
        } else {
            range.end.column = this.$clipColumnToRow(
                range.end.row,
                range.end.column
            );
        }
        return range;
    };

    // WRAPMODE
    this.$wrapLimit = 80;
    this.$useWrapMode = false;
    this.$wrapLimitRange = {
        min : null,
        max : null
    };

    this.setUseWrapMode = function(useWrapMode) {
        if (useWrapMode != this.$useWrapMode) {
            this.$useWrapMode = useWrapMode;
            this.$modified = true;
            this.$resetRowCache(0);

            // If wrapMode is activaed, the wrapData array has to be initialized.
            if (useWrapMode) {
                var len = this.getLength();
                this.$wrapData = [];
                for (var i = 0; i < len; i++) {
                    this.$wrapData.push([]);
                }
                this.$updateWrapData(0, len - 1);
            }

            this._emit("changeWrapMode");
        }
    };

    this.getUseWrapMode = function() {
        return this.$useWrapMode;
    };

    // Allow the wrap limit to move freely between min and max. Either
    // parameter can be null to allow the wrap limit to be unconstrained
    // in that direction. Or set both parameters to the same number to pin
    // the limit to that value.
    this.setWrapLimitRange = function(min, max) {
        if (this.$wrapLimitRange.min !== min || this.$wrapLimitRange.max !== max) {
            this.$wrapLimitRange.min = min;
            this.$wrapLimitRange.max = max;
            this.$modified = true;
            // This will force a recalculation of the wrap limit
            this._emit("changeWrapMode");
        }
    };

    // This should generally only be called by the renderer when a resize
    // is detected.
    this.adjustWrapLimit = function(desiredLimit) {
        var wrapLimit = this.$constrainWrapLimit(desiredLimit);
        if (wrapLimit != this.$wrapLimit && wrapLimit > 0) {
            this.$wrapLimit = wrapLimit;
            this.$modified = true;
            if (this.$useWrapMode) {
                this.$updateWrapData(0, this.getLength() - 1);
                this.$resetRowCache(0)
                this._emit("changeWrapLimit");
            }
            return true;
        }
        return false;
    };

    this.$constrainWrapLimit = function(wrapLimit) {
        var min = this.$wrapLimitRange.min;
        if (min)
            wrapLimit = Math.max(min, wrapLimit);

        var max = this.$wrapLimitRange.max;
        if (max)
            wrapLimit = Math.min(max, wrapLimit);

        // What would a limit of 0 even mean?
        return Math.max(1, wrapLimit);
    };

    this.getWrapLimit = function() {
        return this.$wrapLimit;
    };

    this.getWrapLimitRange = function() {
        // Avoid unexpected mutation by returning a copy
        return {
            min : this.$wrapLimitRange.min,
            max : this.$wrapLimitRange.max
        };
    };

    this.$updateInternalDataOnChange = function(e) {
        var useWrapMode = this.$useWrapMode;
        var len;
        var action = e.data.action;
        var firstRow = e.data.range.start.row;
        var lastRow = e.data.range.end.row;
        var start = e.data.range.start;
        var end = e.data.range.end;
        var removedFolds = null;

        if (action.indexOf("Lines") != -1) {
            if (action == "insertLines") {
                lastRow = firstRow + (e.data.lines.length);
            } else {
                lastRow = firstRow;
            }
            len = e.data.lines ? e.data.lines.length : lastRow - firstRow;
        } else {
            len = lastRow - firstRow;
        }

        if (len != 0) {
            if (action.indexOf("remove") != -1) {
                useWrapMode && this.$wrapData.splice(firstRow, len);

                var foldLines = this.$foldData;
                removedFolds = this.getFoldsInRange(e.data.range);
                this.removeFolds(removedFolds);

                var foldLine = this.getFoldLine(end.row);
                var idx = 0;
                if (foldLine) {
                    foldLine.addRemoveChars(end.row, end.column, start.column - end.column);
                    foldLine.shiftRow(-len);

                    var foldLineBefore = this.getFoldLine(firstRow);
                    if (foldLineBefore && foldLineBefore !== foldLine) {
                        foldLineBefore.merge(foldLine);
                        foldLine = foldLineBefore;
                    }
                    idx = foldLines.indexOf(foldLine) + 1;
                }

                for (idx; idx < foldLines.length; idx++) {
                    var foldLine = foldLines[idx];
                    if (foldLine.start.row >= end.row) {
                        foldLine.shiftRow(-len);
                    }
                }

                lastRow = firstRow;
            } else {
                var args;
                if (useWrapMode) {
                    args = [firstRow, 0];
                    for (var i = 0; i < len; i++) args.push([]);
                    this.$wrapData.splice.apply(this.$wrapData, args);
                }

                // If some new line is added inside of a foldLine, then split
                // the fold line up.
                var foldLines = this.$foldData;
                var foldLine = this.getFoldLine(firstRow);
                var idx = 0;
                if (foldLine) {
                    var cmp = foldLine.range.compareInside(start.row, start.column)
                    // Inside of the foldLine range. Need to split stuff up.
                    if (cmp == 0) {
                        foldLine = foldLine.split(start.row, start.column);
                        foldLine.shiftRow(len);
                        foldLine.addRemoveChars(
                            lastRow, 0, end.column - start.column);
                    } else
                    // Infront of the foldLine but same row. Need to shift column.
                    if (cmp == -1) {
                        foldLine.addRemoveChars(firstRow, 0, end.column - start.column);
                        foldLine.shiftRow(len);
                    }
                    // Nothing to do if the insert is after the foldLine.
                    idx = foldLines.indexOf(foldLine) + 1;
                }

                for (idx; idx < foldLines.length; idx++) {
                    var foldLine = foldLines[idx];
                    if (foldLine.start.row >= firstRow) {
                        foldLine.shiftRow(len);
                    }
                }
            }
        } else {
            // Realign folds. E.g. if you add some new chars before a fold, the
            // fold should "move" to the right.
            len = Math.abs(e.data.range.start.column - e.data.range.end.column);
            if (action.indexOf("remove") != -1) {
                // Get all the folds in the change range and remove them.
                removedFolds = this.getFoldsInRange(e.data.range);
                this.removeFolds(removedFolds);

                len = -len;
            }
            var foldLine = this.getFoldLine(firstRow);
            if (foldLine) {
                foldLine.addRemoveChars(firstRow, start.column, len);
            }
        }

        if (useWrapMode && this.$wrapData.length != this.doc.getLength()) {
            console.error("doc.getLength() and $wrapData.length have to be the same!");
        }

        useWrapMode && this.$updateWrapData(firstRow, lastRow);

        return removedFolds;
    };

    this.$updateWrapData = function(firstRow, lastRow) {
        var lines = this.doc.getAllLines();
        var tabSize = this.getTabSize();
        var wrapData = this.$wrapData;
        var wrapLimit = this.$wrapLimit;
        var tokens;
        var foldLine;

        var row = firstRow;
        lastRow = Math.min(lastRow, lines.length - 1);
        while (row <= lastRow) {
            foldLine = this.getFoldLine(row, foldLine);
            if (!foldLine) {
                tokens = this.$getDisplayTokens(lang.stringTrimRight(lines[row]));
                wrapData[row] = this.$computeWrapSplits(tokens, wrapLimit, tabSize);
                row ++;
            } else {
                tokens = [];
                foldLine.walk(
                    function(placeholder, row, column, lastColumn) {
                        var walkTokens;
                        if (placeholder) {
                            walkTokens = this.$getDisplayTokens(
                                            placeholder, tokens.length);
                            walkTokens[0] = PLACEHOLDER_START;
                            for (var i = 1; i < walkTokens.length; i++) {
                                walkTokens[i] = PLACEHOLDER_BODY;
                            }
                        } else {
                            walkTokens = this.$getDisplayTokens(
                                lines[row].substring(lastColumn, column),
                                tokens.length);
                        }
                        tokens = tokens.concat(walkTokens);
                    }.bind(this),
                    foldLine.end.row,
                    lines[foldLine.end.row].length + 1
                );
                // Remove spaces/tabs from the back of the token array.
                while (tokens.length != 0 && tokens[tokens.length - 1] >= SPACE)
                    tokens.pop();

                wrapData[foldLine.start.row]
                    = this.$computeWrapSplits(tokens, wrapLimit, tabSize);
                row = foldLine.end.row + 1;
            }
        }
    };

    // "Tokens"
    var CHAR = 1,
        CHAR_EXT = 2,
        PLACEHOLDER_START = 3,
        PLACEHOLDER_BODY =  4,
        PUNCTUATION = 9,
        SPACE = 10,
        TAB = 11,
        TAB_SPACE = 12;

    this.$computeWrapSplits = function(tokens, wrapLimit) {
        if (tokens.length == 0) {
            return [];
        }

        var splits = [];
        var displayLength = tokens.length;
        var lastSplit = 0, lastDocSplit = 0;

        function addSplit(screenPos) {
            var displayed = tokens.slice(lastSplit, screenPos);

            // The document size is the current size - the extra width for tabs
            // and multipleWidth characters.
            var len = displayed.length;
            displayed.join("").
                // Get all the TAB_SPACEs.
                replace(/12/g, function() {
                    len -= 1;
                }).
                // Get all the CHAR_EXT/multipleWidth characters.
                replace(/2/g, function() {
                    len -= 1;
                });

            lastDocSplit += len;
            splits.push(lastDocSplit);
            lastSplit = screenPos;
        }

        while (displayLength - lastSplit > wrapLimit) {
            // This is, where the split should be.
            var split = lastSplit + wrapLimit;

            // If there is a space or tab at this split position, then making
            // a split is simple.
            if (tokens[split] >= SPACE) {
                // Include all following spaces + tabs in this split as well.
                while (tokens[split] >= SPACE) {
                    split ++;
                }
                addSplit(split);
                continue;
            }

            // === ELSE ===
            // Check if split is inside of a placeholder. Placeholder are
            // not splitable. Therefore, seek the beginning of the placeholder
            // and try to place the split beofre the placeholder's start.
            if (tokens[split] == PLACEHOLDER_START
                || tokens[split] == PLACEHOLDER_BODY)
            {
                // Seek the start of the placeholder and do the split
                // before the placeholder. By definition there always
                // a PLACEHOLDER_START between split and lastSplit.
                for (split; split != lastSplit - 1; split--) {
                    if (tokens[split] == PLACEHOLDER_START) {
                        // split++; << No incremental here as we want to
                        //  have the position before the Placeholder.
                        break;
                    }
                }

                // If the PLACEHOLDER_START is not the index of the
                // last split, then we can do the split
                if (split > lastSplit) {
                    addSplit(split);
                    continue;
                }

                // If the PLACEHOLDER_START IS the index of the last
                // split, then we have to place the split after the
                // placeholder. So, let's seek for the end of the placeholder.
                split = lastSplit + wrapLimit;
                for (split; split < tokens.length; split++) {
                    if (tokens[split] != PLACEHOLDER_BODY)
                    {
                        break;
                    }
                }

                // If spilt == tokens.length, then the placeholder is the last
                // thing in the line and adding a new split doesn't make sense.
                if (split == tokens.length) {
                    break;  // Breaks the while-loop.
                }

                // Finally, add the split...
                addSplit(split);
                continue;
            }

            // === ELSE ===
            // Search for the first non space/tab/placeholder/punctuation token backwards.
            var minSplit = Math.max(split - 10, lastSplit - 1);
            while (split > minSplit && tokens[split] < PLACEHOLDER_START) {
                split --;
            }
            while (split > minSplit && tokens[split] == PUNCTUATION) {
                split --;
            }
            // If we found one, then add the split.
            if (split > minSplit) {
                addSplit(++split);
                continue;
            }

            // === ELSE ===
            split = lastSplit + wrapLimit;
            // The split is inside of a CHAR or CHAR_EXT token and no space
            // around -> force a split.
            addSplit(split);
        }
        return splits;
    }

    /**
     * @param
     *   offset: The offset in screenColumn at which position str starts.
     *           Important for calculating the realTabSize.
     */
    this.$getDisplayTokens = function(str, offset) {
        var arr = [];
        var tabSize;
        offset = offset || 0;

        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            // Tab
            if (c == 9) {
                tabSize = this.getScreenTabSize(arr.length + offset);
                arr.push(TAB);
                for (var n = 1; n < tabSize; n++) {
                    arr.push(TAB_SPACE);
                }
            }
            // Space
            else if (c == 32) {
                arr.push(SPACE);
            } else if((c > 39 && c < 48) || (c > 57 && c < 64)) {
                arr.push(PUNCTUATION);
            }
            // full width characters
            else if (c >= 0x1100 && isFullWidth(c)) {
                arr.push(CHAR, CHAR_EXT);
            } else {
                arr.push(CHAR);
            }
        }
        return arr;
    }

    /**
     * Calculates the width of the a string on the screen while assuming that
     * the string starts at the first column on the screen.
     *
     * @param string str String to calculate the screen width of
     * @return array
     *      [0]: number of columns for str on screen.
     *      [1]: docColumn position that was read until (useful with screenColumn)
     */
    this.$getStringScreenWidth = function(str, maxScreenColumn, screenColumn) {
        if (maxScreenColumn == 0) {
            return [0, 0];
        }
        if (maxScreenColumn == null) {
            maxScreenColumn = screenColumn +
                str.length * Math.max(this.getTabSize(), 2);
        }
        screenColumn = screenColumn || 0;

        var c, column;
        for (column = 0; column < str.length; column++) {
            c = str.charCodeAt(column);
            // tab
            if (c == 9) {
                screenColumn += this.getScreenTabSize(screenColumn);
            }
            // full width characters
            else if (c >= 0x1100 && isFullWidth(c)) {
                screenColumn += 2;
            } else {
                screenColumn += 1;
            }
            if (screenColumn > maxScreenColumn) {
                break
            }
        }

        return [screenColumn, column];
    }

    /**
     * Returns the number of rows required to render this row on the screen
     */
    this.getRowLength = function(row) {
        if (!this.$useWrapMode || !this.$wrapData[row]) {
            return 1;
        } else {
            return this.$wrapData[row].length + 1;
        }
    }

    /**
     * Returns the height in pixels required to render this row on the screen
     **/
    this.getRowHeight = function(config, row) {
        return this.getRowLength(row) * config.lineHeight;
    }

    this.getScreenLastRowColumn = function(screenRow) {
        //return this.screenToDocumentColumn(screenRow, Number.MAX_VALUE / 10)
        return this.documentToScreenColumn(screenRow, this.doc.getLine(screenRow).length);
    };

    this.getDocumentLastRowColumn = function(docRow, docColumn) {
        var screenRow = this.documentToScreenRow(docRow, docColumn);
        return this.getScreenLastRowColumn(screenRow);
    };

    this.getDocumentLastRowColumnPosition = function(docRow, docColumn) {
        var screenRow = this.documentToScreenRow(docRow, docColumn);
        return this.screenToDocumentPosition(screenRow, Number.MAX_VALUE / 10);
    };

    this.getRowSplitData = function(row) {
        if (!this.$useWrapMode) {
            return undefined;
        } else {
            return this.$wrapData[row];
        }
    };

    /**
     * Returns the width of a tab character at screenColumn.
     */
    this.getScreenTabSize = function(screenColumn) {
        return this.$tabSize - screenColumn % this.$tabSize;
    };

    this.screenToDocumentRow = function(screenRow, screenColumn) {
        return this.screenToDocumentPosition(screenRow, screenColumn).row;
    };

    this.screenToDocumentColumn = function(screenRow, screenColumn) {
        return this.screenToDocumentPosition(screenRow, screenColumn).column;
    };

    this.screenToDocumentPosition = function(screenRow, screenColumn) {
        if (screenRow < 0) {
            return {
                row: 0,
                column: 0
            }
        }

        var line;
        var docRow = 0;
        var docColumn = 0;
        var column;
        var row = 0;
        var rowLength = 0;

        var rowCache = this.$rowCache;
        for (var i = 0; i < rowCache.length; i++) {
            if (rowCache[i].screenRow < screenRow) {
                row = rowCache[i].screenRow;
                docRow = rowCache[i].docRow;
            }
            else {
                break;
            }
        }
        var doCache = !rowCache.length || i == rowCache.length;

        var maxRow = this.getLength() - 1;
        var foldLine = this.getNextFoldLine(docRow);
        var foldStart = foldLine ? foldLine.start.row : Infinity;

        while (row <= screenRow) {
            rowLength = this.getRowLength(docRow);
            if (row + rowLength - 1 >= screenRow || docRow >= maxRow) {
                break;
            } else {
                row += rowLength;
                docRow++;
                if (docRow > foldStart) {
                    docRow = foldLine.end.row+1;
                    foldLine = this.getNextFoldLine(docRow, foldLine);
                    foldStart = foldLine ? foldLine.start.row : Infinity;
                }
            }
            if (doCache) {
                rowCache.push({
                    docRow: docRow,
                    screenRow: row
                });
            }
        }

        if (foldLine && foldLine.start.row <= docRow) {
            line = this.getFoldDisplayLine(foldLine);
            docRow = foldLine.start.row;
        } else if (row + rowLength <= screenRow || docRow > maxRow) {
            // clip at the end of the document
            return {
                row: maxRow,
                column: this.getLine(maxRow).length
            }
        } else {
            line = this.getLine(docRow);
            foldLine = null;
        }

        if (this.$useWrapMode) {
            var splits = this.$wrapData[docRow];
            if (splits) {
                column = splits[screenRow - row];
                if(screenRow > row && splits.length) {
                    docColumn = splits[screenRow - row - 1] || splits[splits.length - 1];
                    line = line.substring(docColumn);
                }
            }
        }

        docColumn += this.$getStringScreenWidth(line, screenColumn)[1];

        // Need to do some clamping action here.
        if (this.$useWrapMode) {
            if (docColumn >= column) {
                // We remove one character at the end such that the docColumn
                // position returned is not associated to the next row on the
                // screen.
                docColumn = column - 1;
            }
        } else {
            docColumn = Math.min(docColumn, line.length);
        }

        if (foldLine) {
            return foldLine.idxToPosition(docColumn);
        }

        return {
            row: docRow,
            column: docColumn
        }
    };

    this.documentToScreenPosition = function(docRow, docColumn) {
        // Normalize the passed in arguments.
        if (typeof docColumn === "undefined")
            var pos = this.$clipPositionToDocument(docRow.row, docRow.column);
        else
            pos = this.$clipPositionToDocument(docRow, docColumn);

        docRow = pos.row;
        docColumn = pos.column;

        var wrapData;
        // Special case in wrapMode if the doc is at the end of the document.
        if (this.$useWrapMode) {
            wrapData = this.$wrapData;
            if (docRow > wrapData.length - 1) {
                return {
                    row: this.getScreenLength(),
                    column: wrapData.length == 0
                        ? 0
                        : (wrapData[wrapData.length - 1].length - 1)
                };
            }
        }

        var screenRow = 0;
        var foldStartRow = null;
        var fold = null;

        // Clamp the docRow position in case it's inside of a folded block.
        fold = this.getFoldAt(docRow, docColumn, 1);
        if (fold) {
            docRow = fold.start.row;
            docColumn = fold.start.column;
        }

        var rowEnd, row = 0;
        var rowCache = this.$rowCache;

        for (var i = 0; i < rowCache.length; i++) {
            if (rowCache[i].docRow < docRow) {
                screenRow = rowCache[i].screenRow;
                row = rowCache[i].docRow;
            } else {
                break;
            }
        }
        var doCache = !rowCache.length || i == rowCache.length;

        var foldLine = this.getNextFoldLine(row);
        var foldStart = foldLine ?foldLine.start.row :Infinity;

        while (row < docRow) {
            if (row >= foldStart) {
                rowEnd = foldLine.end.row + 1;
                if (rowEnd > docRow)
                    break;
                foldLine = this.getNextFoldLine(rowEnd, foldLine);
                foldStart = foldLine ?foldLine.start.row :Infinity;
            }
            else {
                rowEnd = row + 1;
            }

            screenRow += this.getRowLength(row);
            row = rowEnd;

            if (doCache) {
                rowCache.push({
                    docRow: row,
                    screenRow: screenRow
                });
            }
        }

        // Calculate the text line that is displayed in docRow on the screen.
        var textLine = "";
        // Check if the final row we want to reach is inside of a fold.
        if (foldLine && row >= foldStart) {
            textLine = this.getFoldDisplayLine(foldLine, docRow, docColumn);
            foldStartRow = foldLine.start.row;
        } else {
            textLine = this.getLine(docRow).substring(0, docColumn);
            foldStartRow = docRow;
        }
        // Clamp textLine if in wrapMode.
        if (this.$useWrapMode) {
            var wrapRow = wrapData[foldStartRow];
            var screenRowOffset = 0;
            while (textLine.length >= wrapRow[screenRowOffset]) {
                screenRow ++;
                screenRowOffset++;
            }
            textLine = textLine.substring(
                wrapRow[screenRowOffset - 1] || 0, textLine.length
            );
        }

        return {
            row: screenRow,
            column: this.$getStringScreenWidth(textLine)[0]
        };
    };

    this.documentToScreenColumn = function(row, docColumn) {
        return this.documentToScreenPosition(row, docColumn).column;
    };

    this.documentToScreenRow = function(docRow, docColumn) {
        return this.documentToScreenPosition(docRow, docColumn).row;
    };

    this.getScreenLength = function() {
        var screenRows = 0;
        var fold = null;
        if (!this.$useWrapMode) {
            screenRows = this.getLength();

            // Remove the folded lines again.
            var foldData = this.$foldData;
            for (var i = 0; i < foldData.length; i++) {
                fold = foldData[i];
                screenRows -= fold.end.row - fold.start.row;
            }
        } else {
            var lastRow = this.$wrapData.length;
            var row = 0, i = 0;
            var fold = this.$foldData[i++];
            var foldStart = fold ? fold.start.row :Infinity;

            while (row < lastRow) {
                screenRows += this.$wrapData[row].length + 1;
                row ++;
                if (row > foldStart) {
                    row = fold.end.row+1;
                    fold = this.$foldData[i++];
                    foldStart = fold ?fold.start.row :Infinity;
                }
            }
        }

        return screenRows;
    }

    // For every keystroke this gets called once per char in the whole doc!!
    // Wouldn't hurt to make it a bit faster for c >= 0x1100
    function isFullWidth(c) {
        if (c < 0x1100)
            return false;
        return c >= 0x1100 && c <= 0x115F ||
               c >= 0x11A3 && c <= 0x11A7 ||
               c >= 0x11FA && c <= 0x11FF ||
               c >= 0x2329 && c <= 0x232A ||
               c >= 0x2E80 && c <= 0x2E99 ||
               c >= 0x2E9B && c <= 0x2EF3 ||
               c >= 0x2F00 && c <= 0x2FD5 ||
               c >= 0x2FF0 && c <= 0x2FFB ||
               c >= 0x3000 && c <= 0x303E ||
               c >= 0x3041 && c <= 0x3096 ||
               c >= 0x3099 && c <= 0x30FF ||
               c >= 0x3105 && c <= 0x312D ||
               c >= 0x3131 && c <= 0x318E ||
               c >= 0x3190 && c <= 0x31BA ||
               c >= 0x31C0 && c <= 0x31E3 ||
               c >= 0x31F0 && c <= 0x321E ||
               c >= 0x3220 && c <= 0x3247 ||
               c >= 0x3250 && c <= 0x32FE ||
               c >= 0x3300 && c <= 0x4DBF ||
               c >= 0x4E00 && c <= 0xA48C ||
               c >= 0xA490 && c <= 0xA4C6 ||
               c >= 0xA960 && c <= 0xA97C ||
               c >= 0xAC00 && c <= 0xD7A3 ||
               c >= 0xD7B0 && c <= 0xD7C6 ||
               c >= 0xD7CB && c <= 0xD7FB ||
               c >= 0xF900 && c <= 0xFAFF ||
               c >= 0xFE10 && c <= 0xFE19 ||
               c >= 0xFE30 && c <= 0xFE52 ||
               c >= 0xFE54 && c <= 0xFE66 ||
               c >= 0xFE68 && c <= 0xFE6B ||
               c >= 0xFF01 && c <= 0xFF60 ||
               c >= 0xFFE0 && c <= 0xFFE6;
    };

}).call(EditSession.prototype);

require("./edit_session/folding").Folding.call(EditSession.prototype);
require("./edit_session/bracket_match").BracketMatch.call(EditSession.prototype);

exports.EditSession = EditSession;
});
/* vim:ts=4:sts=4:sw=4:
 * ***** BEGIN LICENSE BLOCK *****
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
 *      Mihai Sucan <mihai DOT sucan AT gmail DOT com>
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

define('ace/undomanager', ['require', 'exports', 'module' ], function(require, exports, module) {
"use strict";

var UndoManager = function() {
    this.reset();
};

(function() {

    this.execute = function(options) {
        var deltas = options.args[0];
        this.$doc  = options.args[1];
        this.$undoStack.push(deltas);
        this.$redoStack = [];
    };

    this.undo = function(dontSelect) {
        var deltas = this.$undoStack.pop();
        var undoSelectionRange = null;
        if (deltas) {
            undoSelectionRange =
                this.$doc.undoChanges(deltas, dontSelect);
            this.$redoStack.push(deltas);
        }
        return undoSelectionRange;
    };

    this.redo = function(dontSelect) {
        var deltas = this.$redoStack.pop();
        var redoSelectionRange = null;
        if (deltas) {
            redoSelectionRange =
                this.$doc.redoChanges(deltas, dontSelect);
            this.$undoStack.push(deltas);
        }
        return redoSelectionRange;
    };

    this.reset = function() {
        this.$undoStack = [];
        this.$redoStack = [];
    };

    this.hasUndo = function() {
        return this.$undoStack.length > 0;
    };

    this.hasRedo = function() {
        return this.$redoStack.length > 0;
    };

}).call(UndoManager.prototype);

exports.UndoManager = UndoManager;
});
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
 * The Original Code is Mozilla Skywriter.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Julian Viereck (julian.viereck@gmail.com)
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

define('ace/keyboard/keybinding/vim', ['require', 'exports', 'module' , '../../../../../../state_handler'], function(require, exports, module) {
"use strict";

var StateHandler = require("../state_handler").StateHandler;
var matchCharacterOnly =  require("../state_handler").matchCharacterOnly;

var vimcommand = function(key, exec, then) {
    return {
        regex:  [ "([0-9]*)", key ],
        exec:   exec,
        params: [
            {
                name:     "times",
                match:    1,
                type:     "number",
                defaultValue:     1
            }
        ],
        then:   then
    }
}

var vimStates = {
    start: [
        {
            key:    "i",
            then:   "insertMode"
        },
        {
            key:    "d",
            then:   "deleteMode"
        },
        {
            key:    "a",
            exec:   "gotoright",
            then:   "insertMode"
        },
        {
            key:    "shift-i",
            exec:   "gotolinestart",
            then:   "insertMode"
        },
        {
            key:    "shift-a",
            exec:   "gotolineend",
            then:   "insertMode"
        },
        {
            key:    "shift-c",
            exec:   "removetolineend",
            then:   "insertMode"
        },
        {
            key:    "shift-r",
            exec:   "overwrite",
            then:   "replaceMode"
        },
        vimcommand("(k|up)", "golineup"),
        vimcommand("(j|down)", "golinedown"),
        vimcommand("(l|right)", "gotoright"),
        vimcommand("(h|left)", "gotoleft"),
        {
            key:    "shift-g",
            exec:   "gotoend"
        },
        vimcommand("b", "gotowordleft"),
        vimcommand("e", "gotowordright"),
        vimcommand("x", "del"),
        vimcommand("shift-x", "backspace"),
        vimcommand("shift-d", "removetolineend"),
        vimcommand("u", "undo"), // [count] on this may/may not work, depending on browser implementation...
        {
            comment:    "Catch some keyboard input to stop it here",
            match:      matchCharacterOnly
        }
    ],
    insertMode: [
        {
            key:      "esc",
            then:     "start"
        }
    ],
    replaceMode: [
        {
            key:      "esc",
            exec:     "overwrite",
            then:     "start"
        }
    ],
    deleteMode: [
        {
            key:      "d",
            exec:     "removeline",
            then:     "start"
        }
    ]
};

exports.Vim = new StateHandler(vimStates);

});
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
 * The Original Code is Mozilla Skywriter.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Julian Viereck (julian.viereck@gmail.com)
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

define('ace/keyboard/keybinding/emacs', ['require', 'exports', 'module' , '../../../../../../state_handler'], function(require, exports, module) {
"use strict";

var StateHandler = require("../state_handler").StateHandler;
var matchCharacterOnly =  require("../state_handler").matchCharacterOnly;

var emacsState = {
    start: [
        {
            key:    "ctrl-x",
            then:   "c-x"
        },
        {
            regex:  [ "(?:command-([0-9]*))*", "(down|ctrl-n)" ],
            exec:   "golinedown",
            params: [
                {
                    name: "times",
                    match: 1,
                    type: "number",
                    defaultValue: 1
                }
            ]
        },
        {
            regex: [ "(?:command-([0-9]*))*", "(right|ctrl-f)" ],
            exec: "gotoright",
            params: [
                {
                    name: "times",
                    match: 1,
                    type: "number",
                    defaultValue: 1
                }
            ]
        },
        {
            regex: [ "(?:command-([0-9]*))*", "(up|ctrl-p)" ],
            exec: "golineup",
            params: [
                {
                    name: "times",
                    match: 1,
                    type: "number",
                    defaultValue: 1
                }
            ]
        },
        {
            regex: [ "(?:command-([0-9]*))*", "(left|ctrl-b)" ],
            exec: "gotoleft",
            params: [
                {
                    name: "times",
                    match: 1,
                    type: "number",
                    defaultValue: 1
                }
            ]
        },
        {
            comment: "This binding matches all printable characters except numbers as long as they are no numbers and print them n times.",
            regex:  [ "(?:command-([0-9]*))", "([^0-9]+)*" ],
            match:  matchCharacterOnly,
            exec:   "inserttext",
            params: [
                {
                    name: "times",
                    match: 1,
                    type: "number",
                    defaultValue: "1"
                },
                {
                    name: "text",
                    match: 2
                }
            ]
        },
        {
            comment: "This binding matches numbers as long as there is no meta_number in the buffer.",
            regex:  [ "(command-[0-9]*)*", "([0-9]+)" ],
            match:  matchCharacterOnly,
            disallowMatches:  [ 1 ],
            exec:   "inserttext",
            params: [
                {
                    name: "text",
                    match: 2,
                    type: "text"
                }
            ]
        },
        {
            regex: [ "command-([0-9]*)", "(command-[0-9]|[0-9])" ],
            comment: "Stops execution if the regex /meta_[0-9]+/ matches to avoid resetting the buffer."
        }
    ],
    "c-x": [
        {
            key: "ctrl-g",
            then: "start"
        },
        {
            key: "ctrl-s",
            exec: "save",
            then: "start"
        }
    ]
};

exports.Emacs = new StateHandler(emacsState);

});
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
 * The Original Code is Mozilla Skywriter.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Fabian Jakobs <fabian AT ajax DOT org>
 *   Julian Viereck (julian.viereck@gmail.com)
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

define('ace/keyboard/hash_handler', ['require', 'exports', 'module' , '../../../../../../lib/keys'], function(require, exports, module) {
"use strict";

var keyUtil  = require("../lib/keys");

function HashHandler(config) {
    this.setConfig(config);
}

(function() {
    function splitSafe(s, separator, limit, bLowerCase) {
        return (bLowerCase && s.toLowerCase() || s)
            .replace(/(?:^\s+|\n|\s+$)/g, "")
            .split(new RegExp("[\\s ]*" + separator + "[\\s ]*", "g"), limit || 999);
    }

    function parseKeys(keys, val, ret) {
        var key,
            hashId = 0,
            parts  = splitSafe(keys, "\\-", null, true),
            i      = 0,
            l      = parts.length;

        for (; i < l; ++i) {
            if (keyUtil.KEY_MODS[parts[i]])
                hashId = hashId | keyUtil.KEY_MODS[parts[i]];
            else
                key = parts[i] || "-"; //when empty, the splitSafe removed a '-'
        }

        (ret[hashId] || (ret[hashId] = {}))[key] = val;
        return ret;
    }

    function objectReverse(obj, keySplit) {
        var i, j, l, key,
            ret = {};
        for (i in obj) {
            key = obj[i];
            if (keySplit && typeof key == "string") {
                key = key.split(keySplit);
                for (j = 0, l = key.length; j < l; ++j)
                    parseKeys.call(this, key[j], i, ret);
            }
            else {
                parseKeys.call(this, key, i, ret);
            }
        }
        return ret;
    }

    this.setConfig = function(config) {
        this.$config = config;
        if (typeof this.$config.reverse == "undefined")
            this.$config.reverse = objectReverse.call(this, this.$config, "|");
    };

    /**
     * This function is called by keyBinding.
     */
    this.handleKeyboard = function(data, hashId, textOrKey, keyCode) {
        // Figure out if a commandKey was pressed or just some text was insert.
        if (hashId != 0 || keyCode != 0) {
            return {
                command: (this.$config.reverse[hashId] || {})[textOrKey]
            }
        } else {
            return {
                command: "inserttext",
                args: {
                    text: textOrKey
                }
            }
        }
    }
}).call(HashHandler.prototype)

exports.HashHandler = HashHandler;
});
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
 *      Gastón Kleiman <gaston.kleiman AT gmail DOT com>
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

define('ace/mode/c_cpp', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../c_cpp_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../../range', '../../../../../behaviour/cstyle', '../../../../../folding/cstyle'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var c_cppHighlightRules = require("./c_cpp_highlight_rules").c_cppHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var Range = require("../range").Range;
var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new c_cppHighlightRules().getRules());
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        var outdent = true;
        var re = /^(\s*)\/\//;

        for (var i=startRow; i<= endRow; i++) {
            if (!re.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        if (outdent) {
            var deleteRange = new Range(0, 0, 0, 0);
            for (var i=startRow; i<= endRow; i++)
            {
                var line = doc.getLine(i);
                var m = line.match(re);
                deleteRange.start.row = i;
                deleteRange.end.row = i;
                deleteRange.end.column = m[0].length;
                doc.replace(deleteRange, m[1]);
            }
        }
        else {
            doc.indentRows(startRow, endRow, "//");
        }
    };

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
        var endState = tokenizedLine.state;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        if (state == "start") {
            var match = line.match(/^.*[\{\(\[]\s*$/);
            if (match) {
                indent += tab;
            }
        } else if (state == "doc-start") {
            if (endState == "start") {
                return "";
            }
            var match = line.match(/^\s*(\/?)\*/);
            if (match) {
                if (match[1]) {
                    indent += " ";
                }
                indent += "* ";
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
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
 *      Shlomo Zalman Heigh <shlomozalmanheigh AT gmail DOT com>
 *      Carin Meier
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

define('ace/mode/clojure', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../clojure_highlight_rules', '../../../../../matching_parens_outdent', '../../../../../../range'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var ClojureHighlightRules = require("./clojure_highlight_rules").ClojureHighlightRules;
var MatchingParensOutdent = require("./matching_parens_outdent").MatchingParensOutdent;
var Range = require("../range").Range;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new ClojureHighlightRules().getRules());
    this.$outdent = new MatchingParensOutdent();
};
oop.inherits(Mode, TextMode);

(function() {

    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        var outdent = true;
        var re = /^(\s*)#/;

        for (var i=startRow; i<= endRow; i++) {
            if (!re.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        if (outdent) {
            var deleteRange = new Range(0, 0, 0, 0);
            for (var i=startRow; i<= endRow; i++)
            {
                var line = doc.getLine(i);
                var m = line.match(re);
                deleteRange.start.row = i;
                deleteRange.end.row = i;
                deleteRange.end.column = m[0].length;
                doc.replace(deleteRange, m[1]);
            }
        }
        else {
            doc.indentRows(startRow, endRow, ";");
        }
    };

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }
        
        if (state == "start") {
            var match = line.match(/[\(\[]/);
            if (match) {
                indent += "  ";
            }
            match = line.match(/[\)]/);
            if (match) {
              indent = "";
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
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
 *      Satoshi Murakami <murky.satyr AT gmail DOT com>
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

define('ace/mode/coffee', ['require', 'exports', 'module' , '../../../../../../tokenizer', '../../../../../coffee_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../folding/pythonic', '../../../../../../range', '../../../../../text', '../../../../../../worker/worker_client', '../../../../../../lib/oop'], function(require, exports, module) {
"use strict";

var Tokenizer = require("../tokenizer").Tokenizer;
var Rules = require("./coffee_highlight_rules").CoffeeHighlightRules;
var Outdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var PythonFoldMode = require("./folding/pythonic").FoldMode;
var Range = require("../range").Range;
var TextMode = require("./text").Mode;
var WorkerClient = require("../worker/worker_client").WorkerClient;
var oop = require("../lib/oop");

function Mode() {
    this.$tokenizer = new Tokenizer(new Rules().getRules());
    this.$outdent   = new Outdent();
    this.foldingRules = new PythonFoldMode("=|=>|->|\\s*class [^#]*");
}

oop.inherits(Mode, TextMode);

(function() {
    
    var indenter = /(?:[({[=:]|[-=]>|\b(?:else|switch|try|catch(?:\s*[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)?|finally))\s*$/;
    var commentLine = /^(\s*)#/;
    var hereComment = /^\s*###(?!#)/;
    var indentation = /^\s*/;
    
    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);
        var tokens = this.$tokenizer.getLineTokens(line, state).tokens;
    
        if (!(tokens.length && tokens[tokens.length - 1].type === 'comment') &&
            state === 'start' && indenter.test(line))
            indent += tab;
        return indent;
    };
    
    this.toggleCommentLines = function(state, doc, startRow, endRow){
        console.log("toggle");
        var range = new Range(0, 0, 0, 0);
        for (var i = startRow; i <= endRow; ++i) {
            var line = doc.getLine(i);
            if (hereComment.test(line))
                continue;
                
            if (commentLine.test(line))
                line = line.replace(commentLine, '$1');
            else
                line = line.replace(indentation, '$&#');
    
            range.end.row = range.start.row = i;
            range.end.column = line.length + 1;
            doc.replace(range, line);
        }
    };
    
    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };
    
    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };
    
    this.createWorker = function(session) {
        var worker = new WorkerClient(["ace"], "worker-coffee.js", "ace/mode/coffee_worker", "Worker");
        worker.attachToDocument(session.getDocument());
        
        worker.on("error", function(e) {
            session.setAnnotations([e.data]);
        });
        
        worker.on("ok", function(e) {
            session.clearAnnotations();
        });
        
        return worker;
    };

}).call(Mode.prototype);

exports.Mode = Mode;

});/* ***** BEGIN LICENSE BLOCK *****
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

define('ace/mode/coldfusion', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../xml', '../../../../../javascript', '../../../../../css', '../../../../../../tokenizer', '../../../../../coldfusion_highlight_rules'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var XmlMode = require("./xml").Mode;
var JavaScriptMode = require("./javascript").Mode;
var CssMode = require("./css").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var ColdfusionHighlightRules = require("./coldfusion_highlight_rules").ColdfusionHighlightRules;

var Mode = function() {
    XmlMode.call(this);
    
    var highlighter = new ColdfusionHighlightRules();
    this.$tokenizer = new Tokenizer(highlighter.getRules());
    
    this.$embeds = highlighter.getEmbeds();
    this.createModeDelegates({
      "js-": JavaScriptMode,
      "css-": CssMode
    });
};
oop.inherits(Mode, XmlMode);

(function() {

    this.getNextLineIndent = function(state, line, tab) {
        return this.$getIndent(line);
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
define('ace/mode/csharp', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../csharp_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../behaviour/cstyle', '../../../../../folding/cstyle'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var CSharpHighlightRules = require("./csharp_highlight_rules").CSharpHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new CSharpHighlightRules().getRules());
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {
    
    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);
  
        var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
  
        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }
    
        if (state == "start") {
            var match = line.match(/^.*[\{\(\[]\s*$/);
            if (match) {
                indent += tab;
            }
        }
  
        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };
  
    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };


    this.createWorker = function(session) {
        return null;
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
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

define('ace/mode/css', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../css_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../../worker/worker_client', '../../../../../folding/cstyle'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var CssHighlightRules = require("./css_highlight_rules").CssHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var WorkerClient = require("../worker/worker_client").WorkerClient;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new CssHighlightRules().getRules(), "i");
    this.$outdent = new MatchingBraceOutdent();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.foldingRules = "cStyle";

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        // ignore braces in comments
        var tokens = this.$tokenizer.getLineTokens(line, state).tokens;
        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        var match = line.match(/^.*\{\s*$/);
        if (match) {
            indent += tab;
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };
    
    this.createWorker = function(session) {
        var worker = new WorkerClient(["ace"], "worker-css.js", "ace/mode/css_worker", "Worker");
        worker.attachToDocument(session.getDocument());
        
        worker.on("csslint", function(e) {
            var errors = [];
            e.data.forEach(function(message) {
                errors.push({
                    row: message.line - 1,
                    column: message.col - 1,
                    text: message.message,
                    type: message.type,
                    lint: message
                });
            });
            
            session.setAnnotations(errors);
        });
        return worker;
    };

}).call(Mode.prototype);

exports.Mode = Mode;

});
define('ace/mode/groovy', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../javascript', '../../../../../../tokenizer', '../../../../../groovy_highlight_rules'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var JavaScriptMode = require("./javascript").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var GroovyHighlightRules = require("./groovy_highlight_rules").GroovyHighlightRules;

var Mode = function() {
    JavaScriptMode.call(this);
    this.$tokenizer = new Tokenizer(new GroovyHighlightRules().getRules());
};
oop.inherits(Mode, JavaScriptMode);

(function() {

    this.createWorker = function(session) {
        return null;
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
define('ace/mode/haxe', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../haxe_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../behaviour/cstyle', '../../../../../folding/cstyle'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var HaxeHighlightRules = require("./haxe_highlight_rules").HaxeHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new HaxeHighlightRules().getRules());
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

      this.getNextLineIndent = function(state, line, tab) {
          var indent = this.$getIndent(line);

          var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
          var tokens = tokenizedLine.tokens;

          if (tokens.length && tokens[tokens.length-1].type == "comment") {
              return indent;
          }

          if (state == "start") {
              var match = line.match(/^.*[\{\(\[]\s*$/);
              if (match) {
                  indent += tab;
              }
          }

          return indent;
      };

      this.checkOutdent = function(state, line, input) {
          return this.$outdent.checkOutdent(line, input);
      };

      this.autoOutdent = function(state, doc, row) {
          this.$outdent.autoOutdent(doc, row);
      };


    this.createWorker = function(session) {
        return null;
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
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

define('ace/mode/html', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../javascript', '../../../../../css', '../../../../../../tokenizer', '../../../../../html_highlight_rules', '../../../../../behaviour/xml', '../../../../../folding/html'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var JavaScriptMode = require("./javascript").Mode;
var CssMode = require("./css").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var HtmlHighlightRules = require("./html_highlight_rules").HtmlHighlightRules;
var XmlBehaviour = require("./behaviour/xml").XmlBehaviour;
var HtmlFoldMode = require("./folding/html").FoldMode;

var Mode = function() {
    var highlighter = new HtmlHighlightRules();
    this.$tokenizer = new Tokenizer(highlighter.getRules());
    this.$behaviour = new XmlBehaviour();
    
    this.$embeds = highlighter.getEmbeds();
    this.createModeDelegates({
        "js-": JavaScriptMode,
        "css-": CssMode
    });
    
    this.foldingRules = new HtmlFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    
    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        return 0;
    };

    this.getNextLineIndent = function(state, line, tab) {
        return this.$getIndent(line);
    };

    this.checkOutdent = function(state, line, input) {
        return false;
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
define('ace/mode/java', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../javascript', '../../../../../../tokenizer', '../../../../../java_highlight_rules'], function(require, exports, module) {
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

define('ace/mode/javascript', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../javascript_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../../range', '../../../../../../worker/worker_client', '../../../../../behaviour/cstyle', '../../../../../folding/cstyle'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var JavaScriptHighlightRules = require("./javascript_highlight_rules").JavaScriptHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var Range = require("../range").Range;
var WorkerClient = require("../worker/worker_client").WorkerClient;
var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new JavaScriptHighlightRules().getRules());
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {


    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        var outdent = true;
        var re = /^(\s*)\/\//;

        for (var i=startRow; i<= endRow; i++) {
            if (!re.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        if (outdent) {
            var deleteRange = new Range(0, 0, 0, 0);
            for (var i=startRow; i<= endRow; i++)
            {
                var line = doc.getLine(i);
                var m = line.match(re);
                deleteRange.start.row = i;
                deleteRange.end.row = i;
                deleteRange.end.column = m[0].length;
                doc.replace(deleteRange, m[1]);
            }
        }
        else {
            doc.indentRows(startRow, endRow, "//");
        }
    };

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
        var endState = tokenizedLine.state;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }
        
        if (state == "start" || state == "regex_allowed") {
            var match = line.match(/^.*(?:\bcase\b.*\:|[\{\(\[])\s*$/);
            if (match) {
                indent += tab;
            }
        } else if (state == "doc-start") {
            if (endState == "start" || state == "regex_allowed") {
                return "";
            }
            var match = line.match(/^\s*(\/?)\*/);
            if (match) {
                if (match[1]) {
                    indent += " ";
                }
                indent += "* ";
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };
    
    this.createWorker = function(session) {
        var worker = new WorkerClient(["ace"], "worker-javascript.js", "ace/mode/javascript_worker", "JavaScriptWorker");
        worker.attachToDocument(session.getDocument());
            
        worker.on("jslint", function(results) {
            var errors = [];
            for (var i=0; i<results.data.length; i++) {
                var error = results.data[i];
                if (error)
                    errors.push({
                        row: error.line-1,
                        column: error.character-1,
                        text: error.reason,
                        type: "warning",
                        lint: error
                    });
            }
            session.setAnnotations(errors);
        });
        
        worker.on("narcissus", function(e) {
            session.setAnnotations([e.data]);
        });
        
        worker.on("terminate", function() {
            session.clearAnnotations();
        });
        
        return worker;
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
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

define('ace/mode/json', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../json_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../behaviour/cstyle', '../../../../../folding/cstyle'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var HighlightRules = require("./json_highlight_rules").JsonHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new HighlightRules().getRules());
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        if (state == "start") {
            var match = line.match(/^.*[\{\(\[]\s*$/);
            if (match) {
                indent += tab;
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };
    
}).call(Mode.prototype);

exports.Mode = Mode;
});define('ace/mode/latex', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../latex_highlight_rules', '../../../../../../range'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var LatexHighlightRules = require("./latex_highlight_rules").LatexHighlightRules;
var Range = require("../range").Range;

var Mode = function()
{
    this.$tokenizer = new Tokenizer(new LatexHighlightRules().getRules());
};
oop.inherits(Mode, TextMode);

(function() {
    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        // This code is adapted from ruby.js
        var outdent = true;
        
        // LaTeX comments begin with % and go to the end of the line
        var commentRegEx = /^(\s*)\%/;

        for (var i = startRow; i <= endRow; i++) {
            if (!commentRegEx.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        if (outdent) {
            var deleteRange = new Range(0, 0, 0, 0);
            for (var i = startRow; i <= endRow; i++) {
                var line = doc.getLine(i);
                var m = line.match(commentRegEx);
                deleteRange.start.row = i;
                deleteRange.end.row = i;
                deleteRange.end.column = m[0].length;
                doc.replace(deleteRange, m[1]);
            }
        }
        else {
            doc.indentRows(startRow, endRow, "%");
        }
    };
    
    // There is no universally accepted way of indenting a tex document
    // so just maintain the indentation of the previous line
    this.getNextLineIndent = function(state, line, tab) {
        return this.$getIndent(line);
    };
    
}).call(Mode.prototype);

exports.Mode = Mode;

});
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

define('ace/mode/lua', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../lua_highlight_rules'], function(require, exports, module) {
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


/* vim:ts=4:sts=4:sw=4:
 * ***** BEGIN LICENSE BLOCK *****
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
 *      Mihai Sucan <mihai DOT sucan AT gmail DOT com>
 *      Chris Spencer <chris.ag.spencer AT googlemail DOT com>
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

define('ace/mode/markdown', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../javascript', '../../../../../xml', '../../../../../html', '../../../../../../tokenizer', '../../../../../markdown_highlight_rules'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var JavaScriptMode = require("./javascript").Mode;
var XmlMode = require("./xml").Mode;
var HtmlMode = require("./html").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var MarkdownHighlightRules = require("./markdown_highlight_rules").MarkdownHighlightRules;

var Mode = function() {
    var highlighter = new MarkdownHighlightRules();
    
    this.$tokenizer = new Tokenizer(highlighter.getRules());
    this.$embeds = highlighter.getEmbeds();
    this.createModeDelegates({
      "js-": JavaScriptMode,
      "xml-": XmlMode,
      "html-": HtmlMode
    });
};
oop.inherits(Mode, TextMode);

(function() {
    this.getNextLineIndent = function(state, line, tab) {
        if (state == "listblock") {
            var match = /^((?:.+)?)([-+*][ ]+)/.exec(line);
            if (match) {
                return new Array(match[1].length + 1).join(" ") + match[2];
            } else {
                return "";
            }
        } else {
            return this.$getIndent(line);
        }
    };
}).call(Mode.prototype);

exports.Mode = Mode;
});/* ***** BEGIN LICENSE BLOCK *****
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
 *      Sergi Mansilla <sergi AT ajax DOT org>
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

define('ace/mode/ocaml', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../ocaml_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../../range'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var OcamlHighlightRules = require("./ocaml_highlight_rules").OcamlHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var Range = require("../range").Range;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new OcamlHighlightRules().getRules());
    this.$outdent   = new MatchingBraceOutdent();
};
oop.inherits(Mode, TextMode);

var indenter = /(?:[({[=:]|[-=]>|\b(?:else|try|with))\s*$/;

(function() {

    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        var i, line;
        var outdent = true;
        var re = /^\s*\(\*(.*)\*\)/;

        for (i=startRow; i<= endRow; i++) {
            if (!re.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        var range = new Range(0, 0, 0, 0);
        for (i=startRow; i<= endRow; i++) {
            line = doc.getLine(i);
            range.start.row  = i;
            range.end.row    = i;
            range.end.column = line.length;

            doc.replace(range, outdent ? line.match(re)[1] : "(*" + line + "*)");
        }
    };

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);
        var tokens = this.$tokenizer.getLineTokens(line, state).tokens;

        if (!(tokens.length && tokens[tokens.length - 1].type === 'comment') &&
            state === 'start' && indenter.test(line))
            indent += tab;
        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});

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
 *      Panagiotis Astithas <pastith AT gmail DOT com>
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

define('ace/mode/perl', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../perl_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../../range', '../../../../../folding/cstyle'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var PerlHighlightRules = require("./perl_highlight_rules").PerlHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var Range = require("../range").Range;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new PerlHighlightRules().getRules());
    this.$outdent = new MatchingBraceOutdent();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        var outdent = true;
        var re = /^(\s*)#/;

        for (var i=startRow; i<= endRow; i++) {
            if (!re.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        if (outdent) {
            var deleteRange = new Range(0, 0, 0, 0);
            for (var i=startRow; i<= endRow; i++)
            {
                var line = doc.getLine(i);
                var m = line.match(re);
                deleteRange.start.row = i;
                deleteRange.end.row = i;
                deleteRange.end.column = m[0].length;
                doc.replace(deleteRange, m[1]);
            }
        }
        else {
            doc.indentRows(startRow, endRow, "#");
        }
    };

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        if (state == "start") {
            var match = line.match(/^.*[\{\(\[\:]\s*$/);
            if (match) {
                indent += tab;
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
/* ***** BEGIN LICENSE BLOCK *****
* The Original Code is Ajax.org Code Editor (ACE).
*
* Contributor(s):
*      Jonathan Camile <jonathan.camile AT gmail DOT com>
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

define('ace/mode/pgsql', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text', 'ace/tokenizer', 'ace/mode/pgsql_highlight_rules', 'ace/range'], function(require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var Tokenizer = require("ace/tokenizer").Tokenizer;
    var PgsqlHighlightRules = require("ace/mode/pgsql_highlight_rules").PgsqlHighlightRules;
    var Range = require("ace/range").Range;
    // var EditSession = require("ace/edit_session").EditSession;

    var Mode = function() {
        this.$tokenizer = new Tokenizer(new PgsqlHighlightRules().getRules());
    };
    oop.inherits(Mode, TextMode);

    (function() {

        this.toggleCommentLines = function(state, doc, startRow, endRow) {
            var outdent = true;
            // var outentedRows = [];
            var re = /^(\s*)--/;

            for (var i=startRow; i<= endRow; i++) {
                if (!re.test(doc.getLine(i))) {
                    outdent = false;
                    break;
                }
            }

            if (outdent) {
                var deleteRange = new Range(0, 0, 0, 0);
                for (var i=startRow; i<= endRow; i++)
                {
                    var line = doc.getLine(i);
                    var m = line.match(re);
                    deleteRange.start.row = i;
                    deleteRange.end.row = i;
                    deleteRange.end.column = m[0].length;
                    doc.replace(deleteRange, m[1]);
                }
            }
            else {
                doc.indentRows(startRow, endRow, "--");
            }
        };


        this.getNextLineIndent = function(state, line, tab) { 
            if (state == "start" || state == "keyword.statementEnd") {
                return "";
            } else {
                return this.$getIndent(line); // Keep whatever indent the previous line has
            }
        }

    }).call(Mode.prototype);

    exports.Mode = Mode;
});
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

define('ace/lib/oop', ['require', 'exports', 'module' ], function(require, exports, module) {
"use strict";

exports.inherits = (function() {
    var tempCtor = function() {};
    return function(ctor, superCtor) {
        tempCtor.prototype = superCtor.prototype;
        ctor.super_ = superCtor.prototype;
        ctor.prototype = new tempCtor();
        ctor.prototype.constructor = ctor;
    };
}());

exports.mixin = function(obj, mixin) {
    for (var key in mixin) {
        obj[key] = mixin[key];
    }
};

exports.implement = function(proto, mixin) {
    exports.mixin(proto, mixin);
};

});
/* vim:ts=4:sts=4:sw=4:
 * ***** BEGIN LICENSE BLOCK *****
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
 *      Mihai Sucan <mihai DOT sucan AT gmail DOT com>
 *      Chris Spencer <chris.ag.spencer AT googlemail DOT com>
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

define('ace/mode/text', ['require', 'exports', 'module' , '../../../../../../tokenizer', '../../../../../text_highlight_rules', '../../../../../behaviour', '../../../../../../unicode'], function(require, exports, module) {
"use strict";

var Tokenizer = require("../tokenizer").Tokenizer;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var Behaviour = require("./behaviour").Behaviour;
var unicode = require("../unicode");

var Mode = function() {
    this.$tokenizer = new Tokenizer(new TextHighlightRules().getRules());
    this.$behaviour = new Behaviour();
};

(function() {

    this.tokenRe = new RegExp("^["
        + unicode.packages.L
        + unicode.packages.Mn + unicode.packages.Mc
        + unicode.packages.Nd
        + unicode.packages.Pc + "\\$_]+", "g"
    );
    
    this.nonTokenRe = new RegExp("^(?:[^"
        + unicode.packages.L
        + unicode.packages.Mn + unicode.packages.Mc
        + unicode.packages.Nd
        + unicode.packages.Pc + "\\$_]|\s])+", "g"
    );

    this.getTokenizer = function() {
        return this.$tokenizer;
    };

    this.toggleCommentLines = function(state, doc, startRow, endRow) {
    };

    this.getNextLineIndent = function(state, line, tab) {
        return "";
    };

    this.checkOutdent = function(state, line, input) {
        return false;
    };

    this.autoOutdent = function(state, doc, row) {
    };

    this.$getIndent = function(line) {
        var match = line.match(/^(\s+)/);
        if (match) {
            return match[1];
        }

        return "";
    };
    
    this.createWorker = function(session) {
        return null;
    };

    this.highlightSelection = function(editor) {
        var session = editor.session;
        if (!session.$selectionOccurrences)
            session.$selectionOccurrences = [];

        if (session.$selectionOccurrences.length)
            this.clearSelectionHighlight(editor);

        var selection = editor.getSelectionRange();
        if (selection.isEmpty() || selection.isMultiLine())
            return;

        var startOuter = selection.start.column - 1;
        var endOuter = selection.end.column + 1;
        var line = session.getLine(selection.start.row);
        var lineCols = line.length;
        var needle = line.substring(Math.max(startOuter, 0),
                                    Math.min(endOuter, lineCols));

        // Make sure the outer characters are not part of the word.
        if ((startOuter >= 0 && /^[\w\d]/.test(needle)) ||
            (endOuter <= lineCols && /[\w\d]$/.test(needle)))
            return;

        needle = line.substring(selection.start.column, selection.end.column);
        if (!/^[\w\d]+$/.test(needle))
            return;

        var cursor = editor.getCursorPosition();

        var newOptions = {
            wrap: true,
            wholeWord: true,
            caseSensitive: true,
            needle: needle
        };

        var currentOptions = editor.$search.getOptions();
        editor.$search.set(newOptions);

        var ranges = editor.$search.findAll(session);
        ranges.forEach(function(range) {
            if (!range.contains(cursor.row, cursor.column)) {
                var marker = session.addMarker(range, "ace_selected_word", "text");
                session.$selectionOccurrences.push(marker);
            }
        });

        editor.$search.set(currentOptions);
    };

    this.clearSelectionHighlight = function(editor) {
        if (!editor.session.$selectionOccurrences)
            return;

        editor.session.$selectionOccurrences.forEach(function(marker) {
            editor.session.removeMarker(marker);
        });

        editor.session.$selectionOccurrences = [];
    };
    
    this.createModeDelegates = function (mapping) {
        if (!this.$embeds) {
            return;
        }
        this.$modes = {};
        for (var i = 0; i < this.$embeds.length; i++) {
            if (mapping[this.$embeds[i]]) {
                this.$modes[this.$embeds[i]] = new mapping[this.$embeds[i]]();
            }
        }
        
        var delegations = ['toggleCommentLines', 'getNextLineIndent', 'checkOutdent', 'autoOutdent', 'transformAction'];

        for (var i = 0; i < delegations.length; i++) {
            (function(scope) {
              var functionName = delegations[i];
              var defaultHandler = scope[functionName];
              scope[delegations[i]] = function() {
                  return this.$delegator(functionName, arguments, defaultHandler);
              }
            } (this));
        }
    }
    
    this.$delegator = function(method, args, defaultHandler) {
        var state = args[0];
        
        for (var i = 0; i < this.$embeds.length; i++) {
            if (!this.$modes[this.$embeds[i]]) continue;
            
            var split = state.split(this.$embeds[i]);
            if (!split[0] && split[1]) {
                args[0] = split[1];
                var mode = this.$modes[this.$embeds[i]];
                return mode[method].apply(mode, args);
            }
        }
        var ret = defaultHandler.apply(this, args);
        return defaultHandler ? ret : undefined;
    };
    
    this.transformAction = function(state, action, editor, session, param) {
        if (this.$behaviour) {
            var behaviours = this.$behaviour.getBehaviours();
            for (var key in behaviours) {
                if (behaviours[key][action]) {
                    var ret = behaviours[key][action].apply(this, arguments);
                    if (ret) {
                        return ret;
                    }
                }
            }
        }
    }
    
}).call(Mode.prototype);

exports.Mode = Mode;
});
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

define('ace/tokenizer', ['require', 'exports', 'module' ], function(require, exports, module) {
"use strict";

var Tokenizer = function(rules, flag) {
    flag = flag ? "g" + flag : "g";
    this.rules = rules;

    this.regExps = {};
    this.matchMappings = {};
    for ( var key in this.rules) {
        var rule = this.rules[key];
        var state = rule;
        var ruleRegExps = [];
        var matchTotal = 0;
        var mapping = this.matchMappings[key] = {};
        
        for ( var i = 0; i < state.length; i++) {
            // Count number of matching groups. 2 extra groups from the full match
            // And the catch-all on the end (used to force a match);
            var matchcount = new RegExp("(?:(" + state[i].regex + ")|(.))").exec("a").length - 2;
        
            // Replace any backreferences and offset appropriately.
            var adjustedregex = state[i].regex.replace(/\\([0-9]+)/g, function (match, digit) {
                return "\\" + (parseInt(digit, 10) + matchTotal + 1);
            });
            
            mapping[matchTotal] = {
                rule: i,
                len: matchcount
            };
            matchTotal += matchcount;
            
            ruleRegExps.push(adjustedregex);
        }

        this.regExps[key] = new RegExp("(?:(" + ruleRegExps.join(")|(") + ")|(.))", flag);
    }
};

(function() {

    this.getLineTokens = function(line, startState) {
        var currentState = startState;
        var state = this.rules[currentState];
        var mapping = this.matchMappings[currentState];
        var re = this.regExps[currentState];
        re.lastIndex = 0;
        
        var match, tokens = [];
        
        var lastIndex = 0;
        
        var token = {
            type: null,
            value: ""
        };
        
        while (match = re.exec(line)) {
            var type = "text";
            var rule = null;
            var value = [match[0]];

            for (var i = 0; i < match.length-2; i++) {
                if (match[i + 1] !== undefined) {
                    rule = state[mapping[i].rule];
                    
                    if (mapping[i].len > 1) {
                        value = match.slice(i+2, i+1+mapping[i].len);
                    }
                    
                    // compute token type
                    if (typeof rule.token == "function")
                        type = rule.token.apply(this, value);
                    else
                        type = rule.token;

                    var next = rule.next;                    
                    if (next && next !== currentState) {
                        currentState = next;
                        state = this.rules[currentState];
                        mapping = this.matchMappings[currentState];
                        lastIndex = re.lastIndex;

                        re = this.regExps[currentState];
                        re.lastIndex = lastIndex;
                    }
                    break;
                }
            }

            if (value[0]) {
                if (typeof type == "string") {
                    value = [value.join("")];
                    type = [type];
                }
                for (var i = 0; i < value.length; i++) {
                    if ((!rule || rule.merge || type[i] === "text") && token.type === type[i]) {
                        token.value += value[i];
                    } else {
                        if (token.type) {
                            tokens.push(token);
                        }
                    
                        token = {
                            type: type[i],
                            value: value[i]
                        };
                    }
                }
            }
            
            if (lastIndex == line.length)
                break;
            
            lastIndex = re.lastIndex;
        }

        if (token.type)
            tokens.push(token);

        return {
            tokens : tokens,
            state : currentState
        };
    };

}).call(Tokenizer.prototype);

exports.Tokenizer = Tokenizer;
});
/* ***** BEGIN LICENSE BLOCK *****
 * The Original Code is Ajax.org Code Editor (ACE).
 *
 * Contributor(s):
 *      John DeSoi, Ph.D. <desoi AT pgedit DOT com>
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
 * ***** END LICENSE BLOCK *****
 *
 */


define('ace/mode/pgsql_highlight_rules', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/lib/lang', '../../../../../doc_comment_highlight_rules', '../../../../../text_highlight_rules', '../../../../../perl_highlight_rules', '../../../../../python_highlight_rules'], function(require, exports, module) {

var oop = require("ace/lib/oop");
var lang = require("ace/lib/lang");
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
// Supporting perl and python for now -- both in pg core and ace
var PerlHighlightRules = require("./perl_highlight_rules").PerlHighlightRules;
var PythonHighlightRules = require("./python_highlight_rules").PythonHighlightRules;

var PgsqlHighlightRules = function() {
    
    // Keywords, functions, operators last updated for pg 9.1.
    var keywords = lang.arrayToMap(
        ("abort|absolute|abstime|access|aclitem|action|add|admin|after|aggregate|all|also|alter|always|" +
        "analyse|analyze|and|any|anyarray|anyelement|anyenum|anynonarray|array|as|asc|assertion|" +
        "assignment|asymmetric|at|attribute|authorization|backward|before|begin|between|bigint|" +
        "binary|bit|bool|boolean|both|box|bpchar|by|bytea|cache|called|cascade|cascaded|case|cast|" +
        "catalog|chain|char|character|characteristics|check|checkpoint|cid|cidr|circle|class|close|" +
        "cluster|coalesce|collate|collation|column|comment|comments|commit|committed|concurrently|" +
        "configuration|connection|constraint|constraints|content|continue|conversion|copy|cost|" +
        "create|cross|cstring|csv|current|current_catalog|current_date|current_role|" +
        "current_schema|current_time|current_timestamp|current_user|cursor|cycle|data|database|" +
        "date|day|deallocate|dec|decimal|declare|default|defaults|deferrable|deferred|definer|delete|" +
        "delimiter|delimiters|desc|dictionary|disable|discard|distinct|do|document|domain|double|" +
        "drop|each|else|enable|encoding|encrypted|end|enum|escape|except|exclude|excluding|exclusive|" +
        "execute|exists|explain|extension|external|extract|false|family|fdw_handler|fetch|first|" +
        "float|float4|float8|following|for|force|foreign|forward|freeze|from|full|function|functions|" +
        "global|grant|granted|greatest|group|gtsvector|handler|having|header|hold|hour|identity|if|" +
        "ilike|immediate|immutable|implicit|in|including|increment|index|indexes|inet|inherit|" +
        "inherits|initially|inline|inner|inout|input|insensitive|insert|instead|int|int2|int2vector|" +
        "int4|int8|integer|internal|intersect|interval|into|invoker|is|isnull|isolation|join|key|label|" +
        "language|language_handler|large|last|lc_collate|lc_ctype|leading|least|left|level|like|" +
        "limit|line|listen|load|local|localtime|localtimestamp|location|lock|lseg|macaddr|mapping|" +
        "match|maxvalue|minute|minvalue|mode|money|month|move|name|names|national|natural|nchar|next|no|" +
        "none|not|nothing|notify|notnull|nowait|null|nullif|nulls|numeric|object|of|off|offset|oid|oids|" +
        "oidvector|on|only|opaque|operator|option|options|or|order|out|outer|over|overlaps|overlay|" +
        "owned|owner|parser|partial|partition|passing|password|path|pg_attribute|pg_auth_members|" +
        "pg_authid|pg_class|pg_database|pg_node_tree|pg_proc|pg_type|placing|plans|point|polygon|" +
        "position|preceding|precision|prepare|prepared|preserve|primary|prior|privileges|" +
        "procedural|procedure|quote|range|read|real|reassign|recheck|record|recursive|ref|refcursor|" +
        "references|regclass|regconfig|regdictionary|regoper|regoperator|regproc|regprocedure|" +
        "regtype|reindex|relative|release|reltime|rename|repeatable|replace|replica|reset|restart|" +
        "restrict|returning|returns|revoke|right|role|rollback|row|rows|rule|savepoint|schema|scroll|" +
        "search|second|security|select|sequence|sequences|serializable|server|session|session_user|" +
        "set|setof|share|show|similar|simple|smallint|smgr|some|stable|standalone|start|statement|" +
        "statistics|stdin|stdout|storage|strict|strip|substring|symmetric|sysid|system|table|tables|" +
        "tablespace|temp|template|temporary|text|then|tid|time|timestamp|timestamptz|timetz|" +
        "tinterval|to|trailing|transaction|treat|trigger|trim|true|truncate|trusted|tsquery|tsvector|" +
        "txid_snapshot|type|unbounded|uncommitted|unencrypted|union|unique|unknown|unlisten|" +
        "unlogged|until|update|user|using|uuid|vacuum|valid|validate|validator|value|values|varbit|" +
        "varchar|variadic|varying|verbose|version|view|void|volatile|when|where|whitespace|window|" +
        "with|without|work|wrapper|write|xid|xml|xmlattributes|xmlconcat|xmlelement|xmlexists|" +
        "xmlforest|xmlparse|xmlpi|xmlroot|xmlserialize|year|yes|zone").split("|")
    );
    
    
    var builtinFunctions = lang.arrayToMap(
        ("RI_FKey_cascade_del|RI_FKey_cascade_upd|RI_FKey_check_ins|RI_FKey_check_upd|" +
        "RI_FKey_noaction_del|RI_FKey_noaction_upd|RI_FKey_restrict_del|RI_FKey_restrict_upd|" +
        "RI_FKey_setdefault_del|RI_FKey_setdefault_upd|RI_FKey_setnull_del|" +
        "RI_FKey_setnull_upd|abbrev|abs|abstime|abstimeeq|abstimege|abstimegt|abstimein|abstimele|" +
        "abstimelt|abstimene|abstimeout|abstimerecv|abstimesend|aclcontains|aclexplode|aclinsert|" +
        "aclitemeq|aclitemin|aclitemout|aclremove|acos|age|any_in|any_out|anyarray_in|anyarray_out|" +
        "anyarray_recv|anyarray_send|anyelement_in|anyelement_out|anyenum_in|anyenum_out|" +
        "anynonarray_in|anynonarray_out|anytextcat|area|areajoinsel|areasel|array_agg|" +
        "array_agg_finalfn|array_agg_transfn|array_append|array_cat|array_dims|array_eq|" +
        "array_fill|array_ge|array_gt|array_in|array_larger|array_le|array_length|array_lower|" +
        "array_lt|array_ndims|array_ne|array_out|array_prepend|array_recv|array_send|" +
        "array_smaller|array_to_string|array_upper|arraycontained|arraycontains|arrayoverlap|" +
        "ascii|ascii_to_mic|ascii_to_utf8|asin|atan|atan2|avg|big5_to_euc_tw|big5_to_mic|" +
        "big5_to_utf8|bit_and|bit_in|bit_length|bit_or|bit_out|bit_recv|bit_send|bitand|bitcat|" +
        "bitcmp|biteq|bitge|bitgt|bitle|bitlt|bitne|bitnot|bitor|bitshiftleft|bitshiftright|" +
        "bittypmodin|bittypmodout|bitxor|bool|bool_and|bool_or|booland_statefunc|booleq|boolge|" +
        "boolgt|boolin|boolle|boollt|boolne|boolor_statefunc|boolout|boolrecv|boolsend|box|" +
        "box_above|box_above_eq|box_add|box_below|box_below_eq|box_center|box_contain|" +
        "box_contain_pt|box_contained|box_distance|box_div|box_eq|box_ge|box_gt|box_in|" +
        "box_intersect|box_le|box_left|box_lt|box_mul|box_out|box_overabove|box_overbelow|" +
        "box_overlap|box_overleft|box_overright|box_recv|box_right|box_same|box_send|box_sub|" +
        "bpchar_larger|bpchar_pattern_ge|bpchar_pattern_gt|bpchar_pattern_le|" +
        "bpchar_pattern_lt|bpchar_smaller|bpcharcmp|bpchareq|bpcharge|bpchargt|bpchariclike|" +
        "bpcharicnlike|bpcharicregexeq|bpcharicregexne|bpcharin|bpcharle|bpcharlike|bpcharlt|" +
        "bpcharne|bpcharnlike|bpcharout|bpcharrecv|bpcharregexeq|bpcharregexne|bpcharsend|" +
        "bpchartypmodin|bpchartypmodout|broadcast|btabstimecmp|btarraycmp|btbeginscan|btboolcmp|" +
        "btbpchar_pattern_cmp|btbuild|btbuildempty|btbulkdelete|btcharcmp|btcostestimate|" +
        "btendscan|btfloat48cmp|btfloat4cmp|btfloat84cmp|btfloat8cmp|btgetbitmap|btgettuple|" +
        "btinsert|btint24cmp|btint28cmp|btint2cmp|btint42cmp|btint48cmp|btint4cmp|btint82cmp|" +
        "btint84cmp|btint8cmp|btmarkpos|btnamecmp|btoidcmp|btoidvectorcmp|btoptions|btrecordcmp|" +
        "btreltimecmp|btrescan|btrestrpos|btrim|bttext_pattern_cmp|bttextcmp|bttidcmp|" +
        "bttintervalcmp|btvacuumcleanup|byteacat|byteacmp|byteaeq|byteage|byteagt|byteain|byteale|" +
        "bytealike|bytealt|byteane|byteanlike|byteaout|bytearecv|byteasend|cash_cmp|cash_div_cash|" +
        "cash_div_flt4|cash_div_flt8|cash_div_int2|cash_div_int4|cash_eq|cash_ge|cash_gt|cash_in|" +
        "cash_le|cash_lt|cash_mi|cash_mul_flt4|cash_mul_flt8|cash_mul_int2|cash_mul_int4|cash_ne|" +
        "cash_out|cash_pl|cash_recv|cash_send|cash_words|cashlarger|cashsmaller|cbrt|ceil|ceiling|" +
        "center|char|char_length|character_length|chareq|charge|chargt|charin|charle|charlt|charne|" +
        "charout|charrecv|charsend|chr|cideq|cidin|cidout|cidr|cidr_in|cidr_out|cidr_recv|cidr_send|" +
        "cidrecv|cidsend|circle|circle_above|circle_add_pt|circle_below|circle_center|" +
        "circle_contain|circle_contain_pt|circle_contained|circle_distance|circle_div_pt|" +
        "circle_eq|circle_ge|circle_gt|circle_in|circle_le|circle_left|circle_lt|circle_mul_pt|" +
        "circle_ne|circle_out|circle_overabove|circle_overbelow|circle_overlap|circle_overleft|" +
        "circle_overright|circle_recv|circle_right|circle_same|circle_send|circle_sub_pt|" +
        "clock_timestamp|close_lb|close_ls|close_lseg|close_pb|close_pl|close_ps|close_sb|" +
        "close_sl|col_description|concat|concat_ws|contjoinsel|contsel|convert|convert_from|" +
        "convert_to|corr|cos|cot|count|covar_pop|covar_samp|cstring_in|cstring_out|cstring_recv|" +
        "cstring_send|cume_dist|current_database|current_query|current_schema|current_schemas|" +
        "current_setting|current_user|currtid|currtid2|currval|cursor_to_xml|" +
        "cursor_to_xmlschema|database_to_xml|database_to_xml_and_xmlschema|" +
        "database_to_xmlschema|date|date_cmp|date_cmp_timestamp|date_cmp_timestamptz|date_eq|" +
        "date_eq_timestamp|date_eq_timestamptz|date_ge|date_ge_timestamp|date_ge_timestamptz|" +
        "date_gt|date_gt_timestamp|date_gt_timestamptz|date_in|date_larger|date_le|" +
        "date_le_timestamp|date_le_timestamptz|date_lt|date_lt_timestamp|date_lt_timestamptz|" +
        "date_mi|date_mi_interval|date_mii|date_ne|date_ne_timestamp|date_ne_timestamptz|" +
        "date_out|date_part|date_pl_interval|date_pli|date_recv|date_send|date_smaller|" +
        "date_trunc|datetime_pl|datetimetz_pl|dcbrt|decode|degrees|dense_rank|dexp|diagonal|" +
        "diameter|dispell_init|dispell_lexize|dist_cpoly|dist_lb|dist_pb|dist_pc|dist_pl|" +
        "dist_ppath|dist_ps|dist_sb|dist_sl|div|dlog1|dlog10|domain_in|domain_recv|dpow|dround|" +
        "dsimple_init|dsimple_lexize|dsnowball_init|dsnowball_lexize|dsqrt|dsynonym_init|" +
        "dsynonym_lexize|dtrunc|encode|enum_cmp|enum_eq|enum_first|enum_ge|enum_gt|enum_in|" +
        "enum_larger|enum_last|enum_le|enum_lt|enum_ne|enum_out|enum_range|enum_recv|enum_send|" +
        "enum_smaller|eqjoinsel|eqsel|euc_cn_to_mic|euc_cn_to_utf8|" +
        "euc_jis_2004_to_shift_jis_2004|euc_jis_2004_to_utf8|euc_jp_to_mic|euc_jp_to_sjis|" +
        "euc_jp_to_utf8|euc_kr_to_mic|euc_kr_to_utf8|euc_tw_to_big5|euc_tw_to_mic|" +
        "euc_tw_to_utf8|every|exp|factorial|family|fdw_handler_in|fdw_handler_out|first_value|" +
        "float4|float48div|float48eq|float48ge|float48gt|float48le|float48lt|float48mi|float48mul|" +
        "float48ne|float48pl|float4_accum|float4abs|float4div|float4eq|float4ge|float4gt|float4in|" +
        "float4larger|float4le|float4lt|float4mi|float4mul|float4ne|float4out|float4pl|float4recv|" +
        "float4send|float4smaller|float4um|float4up|float8|float84div|float84eq|float84ge|" +
        "float84gt|float84le|float84lt|float84mi|float84mul|float84ne|float84pl|float8_accum|" +
        "float8_avg|float8_corr|float8_covar_pop|float8_covar_samp|float8_regr_accum|" +
        "float8_regr_avgx|float8_regr_avgy|float8_regr_intercept|float8_regr_r2|" +
        "float8_regr_slope|float8_regr_sxx|float8_regr_sxy|float8_regr_syy|float8_stddev_pop|" +
        "float8_stddev_samp|float8_var_pop|float8_var_samp|float8abs|float8div|float8eq|" +
        "float8ge|float8gt|float8in|float8larger|float8le|float8lt|float8mi|float8mul|float8ne|" +
        "float8out|float8pl|float8recv|float8send|float8smaller|float8um|float8up|floor|" +
        "flt4_mul_cash|flt8_mul_cash|fmgr_c_validator|fmgr_internal_validator|" +
        "fmgr_sql_validator|format|format_type|gb18030_to_utf8|gbk_to_utf8|generate_series|" +
        "generate_subscripts|get_bit|get_byte|get_current_ts_config|getdatabaseencoding|" +
        "getpgusername|gin_cmp_prefix|gin_cmp_tslexeme|gin_extract_tsquery|" +
        "gin_extract_tsvector|gin_tsquery_consistent|ginarrayconsistent|ginarrayextract|" +
        "ginbeginscan|ginbuild|ginbuildempty|ginbulkdelete|gincostestimate|ginendscan|" +
        "gingetbitmap|gininsert|ginmarkpos|ginoptions|ginqueryarrayextract|ginrescan|" +
        "ginrestrpos|ginvacuumcleanup|gist_box_compress|gist_box_consistent|" +
        "gist_box_decompress|gist_box_penalty|gist_box_picksplit|gist_box_same|gist_box_union|" +
        "gist_circle_compress|gist_circle_consistent|gist_point_compress|" +
        "gist_point_consistent|gist_point_distance|gist_poly_compress|gist_poly_consistent|" +
        "gistbeginscan|gistbuild|gistbuildempty|gistbulkdelete|gistcostestimate|gistendscan|" +
        "gistgetbitmap|gistgettuple|gistinsert|gistmarkpos|gistoptions|gistrescan|gistrestrpos|" +
        "gistvacuumcleanup|gtsquery_compress|gtsquery_consistent|gtsquery_decompress|" +
        "gtsquery_penalty|gtsquery_picksplit|gtsquery_same|gtsquery_union|gtsvector_compress|" +
        "gtsvector_consistent|gtsvector_decompress|gtsvector_penalty|gtsvector_picksplit|" +
        "gtsvector_same|gtsvector_union|gtsvectorin|gtsvectorout|has_any_column_privilege|" +
        "has_column_privilege|has_database_privilege|has_foreign_data_wrapper_privilege|" +
        "has_function_privilege|has_language_privilege|has_schema_privilege|" +
        "has_sequence_privilege|has_server_privilege|has_table_privilege|" +
        "has_tablespace_privilege|hash_aclitem|hash_array|hash_numeric|hashbeginscan|" +
        "hashbpchar|hashbuild|hashbuildempty|hashbulkdelete|hashchar|hashcostestimate|" +
        "hashendscan|hashenum|hashfloat4|hashfloat8|hashgetbitmap|hashgettuple|hashinet|" +
        "hashinsert|hashint2|hashint2vector|hashint4|hashint8|hashmacaddr|hashmarkpos|hashname|" +
        "hashoid|hashoidvector|hashoptions|hashrescan|hashrestrpos|hashtext|hashvacuumcleanup|" +
        "hashvarlena|height|host|hostmask|iclikejoinsel|iclikesel|icnlikejoinsel|icnlikesel|" +
        "icregexeqjoinsel|icregexeqsel|icregexnejoinsel|icregexnesel|inet_client_addr|" +
        "inet_client_port|inet_in|inet_out|inet_recv|inet_send|inet_server_addr|" +
        "inet_server_port|inetand|inetmi|inetmi_int8|inetnot|inetor|inetpl|initcap|int2|int24div|" +
        "int24eq|int24ge|int24gt|int24le|int24lt|int24mi|int24mul|int24ne|int24pl|int28div|int28eq|" +
        "int28ge|int28gt|int28le|int28lt|int28mi|int28mul|int28ne|int28pl|int2_accum|" +
        "int2_avg_accum|int2_mul_cash|int2_sum|int2abs|int2and|int2div|int2eq|int2ge|int2gt|int2in|" +
        "int2larger|int2le|int2lt|int2mi|int2mod|int2mul|int2ne|int2not|int2or|int2out|int2pl|" +
        "int2recv|int2send|int2shl|int2shr|int2smaller|int2um|int2up|int2vectoreq|int2vectorin|" +
        "int2vectorout|int2vectorrecv|int2vectorsend|int2xor|int4|int42div|int42eq|int42ge|" +
        "int42gt|int42le|int42lt|int42mi|int42mul|int42ne|int42pl|int48div|int48eq|int48ge|int48gt|" +
        "int48le|int48lt|int48mi|int48mul|int48ne|int48pl|int4_accum|int4_avg_accum|int4_mul_cash|" +
        "int4_sum|int4abs|int4and|int4div|int4eq|int4ge|int4gt|int4in|int4inc|int4larger|int4le|" +
        "int4lt|int4mi|int4mod|int4mul|int4ne|int4not|int4or|int4out|int4pl|int4recv|int4send|" +
        "int4shl|int4shr|int4smaller|int4um|int4up|int4xor|int8|int82div|int82eq|int82ge|int82gt|" +
        "int82le|int82lt|int82mi|int82mul|int82ne|int82pl|int84div|int84eq|int84ge|int84gt|int84le|" +
        "int84lt|int84mi|int84mul|int84ne|int84pl|int8_accum|int8_avg|int8_avg_accum|int8_sum|" +
        "int8abs|int8and|int8div|int8eq|int8ge|int8gt|int8in|int8inc|int8inc_any|" +
        "int8inc_float8_float8|int8larger|int8le|int8lt|int8mi|int8mod|int8mul|int8ne|int8not|" +
        "int8or|int8out|int8pl|int8pl_inet|int8recv|int8send|int8shl|int8shr|int8smaller|int8um|" +
        "int8up|int8xor|integer_pl_date|inter_lb|inter_sb|inter_sl|internal_in|internal_out|" +
        "interval_accum|interval_avg|interval_cmp|interval_div|interval_eq|interval_ge|" +
        "interval_gt|interval_hash|interval_in|interval_larger|interval_le|interval_lt|" +
        "interval_mi|interval_mul|interval_ne|interval_out|interval_pl|interval_pl_date|" +
        "interval_pl_time|interval_pl_timestamp|interval_pl_timestamptz|interval_pl_timetz|" +
        "interval_recv|interval_send|interval_smaller|interval_um|intervaltypmodin|" +
        "intervaltypmodout|intinterval|isclosed|isfinite|ishorizontal|iso8859_1_to_utf8|" +
        "iso8859_to_utf8|iso_to_koi8r|iso_to_mic|iso_to_win1251|iso_to_win866|isopen|isparallel|" +
        "isperp|isvertical|johab_to_utf8|justify_days|justify_hours|justify_interval|" +
        "koi8r_to_iso|koi8r_to_mic|koi8r_to_utf8|koi8r_to_win1251|koi8r_to_win866|" +
        "koi8u_to_utf8|lag|language_handler_in|language_handler_out|last_value|lastval|" +
        "latin1_to_mic|latin2_to_mic|latin2_to_win1250|latin3_to_mic|latin4_to_mic|lead|left|" +
        "length|like|like_escape|likejoinsel|likesel|line|line_distance|line_eq|line_horizontal|" +
        "line_in|line_interpt|line_intersect|line_out|line_parallel|line_perp|line_recv|" +
        "line_send|line_vertical|ln|lo_close|lo_creat|lo_create|lo_export|lo_import|lo_lseek|" +
        "lo_open|lo_tell|lo_truncate|lo_unlink|log|loread|lower|lowrite|lpad|lseg|lseg_center|" +
        "lseg_distance|lseg_eq|lseg_ge|lseg_gt|lseg_horizontal|lseg_in|lseg_interpt|" +
        "lseg_intersect|lseg_le|lseg_length|lseg_lt|lseg_ne|lseg_out|lseg_parallel|lseg_perp|" +
        "lseg_recv|lseg_send|lseg_vertical|ltrim|macaddr_cmp|macaddr_eq|macaddr_ge|macaddr_gt|" +
        "macaddr_in|macaddr_le|macaddr_lt|macaddr_ne|macaddr_out|macaddr_recv|macaddr_send|" +
        "makeaclitem|masklen|max|md5|mic_to_ascii|mic_to_big5|mic_to_euc_cn|mic_to_euc_jp|" +
        "mic_to_euc_kr|mic_to_euc_tw|mic_to_iso|mic_to_koi8r|mic_to_latin1|mic_to_latin2|" +
        "mic_to_latin3|mic_to_latin4|mic_to_sjis|mic_to_win1250|mic_to_win1251|mic_to_win866|" +
        "min|mktinterval|mod|money|mul_d_interval|name|nameeq|namege|namegt|nameiclike|nameicnlike|" +
        "nameicregexeq|nameicregexne|namein|namele|namelike|namelt|namene|namenlike|nameout|" +
        "namerecv|nameregexeq|nameregexne|namesend|neqjoinsel|neqsel|netmask|network|network_cmp|" +
        "network_eq|network_ge|network_gt|network_le|network_lt|network_ne|network_sub|" +
        "network_subeq|network_sup|network_supeq|nextval|nlikejoinsel|nlikesel|notlike|now|" +
        "npoints|nth_value|ntile|numeric_abs|numeric_accum|numeric_add|numeric_avg|" +
        "numeric_avg_accum|numeric_cmp|numeric_div|numeric_div_trunc|numeric_eq|numeric_exp|" +
        "numeric_fac|numeric_ge|numeric_gt|numeric_in|numeric_inc|numeric_larger|numeric_le|" +
        "numeric_ln|numeric_log|numeric_lt|numeric_mod|numeric_mul|numeric_ne|numeric_out|" +
        "numeric_power|numeric_recv|numeric_send|numeric_smaller|numeric_sqrt|" +
        "numeric_stddev_pop|numeric_stddev_samp|numeric_sub|numeric_uminus|numeric_uplus|" +
        "numeric_var_pop|numeric_var_samp|numerictypmodin|numerictypmodout|numnode|" +
        "obj_description|octet_length|oid|oideq|oidge|oidgt|oidin|oidlarger|oidle|oidlt|oidne|oidout|" +
        "oidrecv|oidsend|oidsmaller|oidvectoreq|oidvectorge|oidvectorgt|oidvectorin|oidvectorle|" +
        "oidvectorlt|oidvectorne|oidvectorout|oidvectorrecv|oidvectorsend|oidvectortypes|on_pb|" +
        "on_pl|on_ppath|on_ps|on_sb|on_sl|opaque_in|opaque_out|overlaps|overlay|path|path_add|" +
        "path_add_pt|path_center|path_contain_pt|path_distance|path_div_pt|path_in|path_inter|" +
        "path_length|path_mul_pt|path_n_eq|path_n_ge|path_n_gt|path_n_le|path_n_lt|path_npoints|" +
        "path_out|path_recv|path_send|path_sub_pt|pclose|percent_rank|pg_advisory_lock|" +
        "pg_advisory_lock_shared|pg_advisory_unlock|pg_advisory_unlock_all|" +
        "pg_advisory_unlock_shared|pg_advisory_xact_lock|pg_advisory_xact_lock_shared|" +
        "pg_available_extension_versions|pg_available_extensions|pg_backend_pid|" +
        "pg_cancel_backend|pg_char_to_encoding|pg_client_encoding|pg_collation_is_visible|" +
        "pg_column_size|pg_conf_load_time|pg_conversion_is_visible|pg_create_restore_point|" +
        "pg_current_xlog_insert_location|pg_current_xlog_location|pg_cursor|pg_database_size|" +
        "pg_describe_object|pg_encoding_max_length|pg_encoding_to_char|" +
        "pg_extension_config_dump|pg_extension_update_paths|pg_function_is_visible|" +
        "pg_get_constraintdef|pg_get_expr|pg_get_function_arguments|" +
        "pg_get_function_identity_arguments|pg_get_function_result|pg_get_functiondef|" +
        "pg_get_indexdef|pg_get_keywords|pg_get_ruledef|pg_get_serial_sequence|" +
        "pg_get_triggerdef|pg_get_userbyid|pg_get_viewdef|pg_has_role|pg_indexes_size|" +
        "pg_is_in_recovery|pg_is_other_temp_schema|pg_is_xlog_replay_paused|" +
        "pg_last_xact_replay_timestamp|pg_last_xlog_receive_location|" +
        "pg_last_xlog_replay_location|pg_listening_channels|pg_lock_status|pg_ls_dir|" +
        "pg_my_temp_schema|pg_node_tree_in|pg_node_tree_out|pg_node_tree_recv|" +
        "pg_node_tree_send|pg_notify|pg_opclass_is_visible|pg_operator_is_visible|" +
        "pg_options_to_table|pg_postmaster_start_time|pg_prepared_statement|pg_prepared_xact|" +
        "pg_read_binary_file|pg_read_file|pg_relation_filenode|pg_relation_filepath|" +
        "pg_relation_size|pg_reload_conf|pg_rotate_logfile|pg_sequence_parameters|" +
        "pg_show_all_settings|pg_size_pretty|pg_sleep|pg_start_backup|pg_stat_clear_snapshot|" +
        "pg_stat_file|pg_stat_get_activity|pg_stat_get_analyze_count|" +
        "pg_stat_get_autoanalyze_count|pg_stat_get_autovacuum_count|" +
        "pg_stat_get_backend_activity|pg_stat_get_backend_activity_start|" +
        "pg_stat_get_backend_client_addr|pg_stat_get_backend_client_port|" +
        "pg_stat_get_backend_dbid|pg_stat_get_backend_idset|pg_stat_get_backend_pid|" +
        "pg_stat_get_backend_start|pg_stat_get_backend_userid|pg_stat_get_backend_waiting|" +
        "pg_stat_get_backend_xact_start|pg_stat_get_bgwriter_buf_written_checkpoints|" +
        "pg_stat_get_bgwriter_buf_written_clean|pg_stat_get_bgwriter_maxwritten_clean|" +
        "pg_stat_get_bgwriter_requested_checkpoints|pg_stat_get_bgwriter_stat_reset_time|" +
        "pg_stat_get_bgwriter_timed_checkpoints|pg_stat_get_blocks_fetched|" +
        "pg_stat_get_blocks_hit|pg_stat_get_buf_alloc|pg_stat_get_buf_fsync_backend|" +
        "pg_stat_get_buf_written_backend|pg_stat_get_db_blocks_fetched|" +
        "pg_stat_get_db_blocks_hit|pg_stat_get_db_conflict_all|" +
        "pg_stat_get_db_conflict_bufferpin|pg_stat_get_db_conflict_lock|" +
        "pg_stat_get_db_conflict_snapshot|pg_stat_get_db_conflict_startup_deadlock|" +
        "pg_stat_get_db_conflict_tablespace|pg_stat_get_db_numbackends|" +
        "pg_stat_get_db_stat_reset_time|pg_stat_get_db_tuples_deleted|" +
        "pg_stat_get_db_tuples_fetched|pg_stat_get_db_tuples_inserted|" +
        "pg_stat_get_db_tuples_returned|pg_stat_get_db_tuples_updated|" +
        "pg_stat_get_db_xact_commit|pg_stat_get_db_xact_rollback|pg_stat_get_dead_tuples|" +
        "pg_stat_get_function_calls|pg_stat_get_function_self_time|" +
        "pg_stat_get_function_time|pg_stat_get_last_analyze_time|" +
        "pg_stat_get_last_autoanalyze_time|pg_stat_get_last_autovacuum_time|" +
        "pg_stat_get_last_vacuum_time|pg_stat_get_live_tuples|pg_stat_get_numscans|" +
        "pg_stat_get_tuples_deleted|pg_stat_get_tuples_fetched|" +
        "pg_stat_get_tuples_hot_updated|pg_stat_get_tuples_inserted|" +
        "pg_stat_get_tuples_returned|pg_stat_get_tuples_updated|pg_stat_get_vacuum_count|" +
        "pg_stat_get_wal_senders|pg_stat_get_xact_blocks_fetched|" +
        "pg_stat_get_xact_blocks_hit|pg_stat_get_xact_function_calls|" +
        "pg_stat_get_xact_function_self_time|pg_stat_get_xact_function_time|" +
        "pg_stat_get_xact_numscans|pg_stat_get_xact_tuples_deleted|" +
        "pg_stat_get_xact_tuples_fetched|pg_stat_get_xact_tuples_hot_updated|" +
        "pg_stat_get_xact_tuples_inserted|pg_stat_get_xact_tuples_returned|" +
        "pg_stat_get_xact_tuples_updated|pg_stat_reset|pg_stat_reset_shared|" +
        "pg_stat_reset_single_function_counters|pg_stat_reset_single_table_counters|" +
        "pg_stop_backup|pg_switch_xlog|pg_table_is_visible|pg_table_size|" +
        "pg_tablespace_databases|pg_tablespace_size|pg_terminate_backend|pg_timezone_abbrevs|" +
        "pg_timezone_names|pg_total_relation_size|pg_try_advisory_lock|" +
        "pg_try_advisory_lock_shared|pg_try_advisory_xact_lock|" +
        "pg_try_advisory_xact_lock_shared|pg_ts_config_is_visible|pg_ts_dict_is_visible|" +
        "pg_ts_parser_is_visible|pg_ts_template_is_visible|pg_type_is_visible|pg_typeof|" +
        "pg_xlog_replay_pause|pg_xlog_replay_resume|pg_xlogfile_name|pg_xlogfile_name_offset|" +
        "pi|plainto_tsquery|plpgsql_call_handler|plpgsql_inline_handler|plpgsql_validator|" +
        "point|point_above|point_add|point_below|point_distance|point_div|point_eq|point_horiz|" +
        "point_in|point_left|point_mul|point_ne|point_out|point_recv|point_right|point_send|" +
        "point_sub|point_vert|poly_above|poly_below|poly_center|poly_contain|poly_contain_pt|" +
        "poly_contained|poly_distance|poly_in|poly_left|poly_npoints|poly_out|poly_overabove|" +
        "poly_overbelow|poly_overlap|poly_overleft|poly_overright|poly_recv|poly_right|" +
        "poly_same|poly_send|polygon|popen|position|positionjoinsel|positionsel|" +
        "postgresql_fdw_validator|pow|power|prsd_end|prsd_headline|prsd_lextype|prsd_nexttoken|" +
        "prsd_start|pt_contained_circle|pt_contained_poly|query_to_xml|" +
        "query_to_xml_and_xmlschema|query_to_xmlschema|querytree|quote_ident|quote_literal|" +
        "quote_nullable|radians|radius|random|rank|record_eq|record_ge|record_gt|record_in|" +
        "record_le|record_lt|record_ne|record_out|record_recv|record_send|regclass|regclassin|" +
        "regclassout|regclassrecv|regclasssend|regconfigin|regconfigout|regconfigrecv|" +
        "regconfigsend|regdictionaryin|regdictionaryout|regdictionaryrecv|regdictionarysend|" +
        "regexeqjoinsel|regexeqsel|regexnejoinsel|regexnesel|regexp_matches|regexp_replace|" +
        "regexp_split_to_array|regexp_split_to_table|regoperatorin|regoperatorout|" +
        "regoperatorrecv|regoperatorsend|regoperin|regoperout|regoperrecv|regopersend|" +
        "regprocedurein|regprocedureout|regprocedurerecv|regproceduresend|regprocin|regprocout|" +
        "regprocrecv|regprocsend|regr_avgx|regr_avgy|regr_count|regr_intercept|regr_r2|" +
        "regr_slope|regr_sxx|regr_sxy|regr_syy|regtypein|regtypeout|regtyperecv|regtypesend|" +
        "reltime|reltimeeq|reltimege|reltimegt|reltimein|reltimele|reltimelt|reltimene|reltimeout|" +
        "reltimerecv|reltimesend|repeat|replace|reverse|right|round|row_number|rpad|rtrim|" +
        "scalargtjoinsel|scalargtsel|scalarltjoinsel|scalarltsel|schema_to_xml|" +
        "schema_to_xml_and_xmlschema|schema_to_xmlschema|session_user|set_bit|set_byte|" +
        "set_config|set_masklen|setseed|setval|setweight|shell_in|shell_out|" +
        "shift_jis_2004_to_euc_jis_2004|shift_jis_2004_to_utf8|shobj_description|sign|" +
        "similar_escape|sin|sjis_to_euc_jp|sjis_to_mic|sjis_to_utf8|slope|smgreq|smgrin|smgrne|" +
        "smgrout|split_part|sqrt|statement_timestamp|stddev|stddev_pop|stddev_samp|string_agg|" +
        "string_agg_finalfn|string_agg_transfn|string_to_array|strip|strpos|substr|substring|sum|" +
        "suppress_redundant_updates_trigger|table_to_xml|table_to_xml_and_xmlschema|" +
        "table_to_xmlschema|tan|text|text_ge|text_gt|text_larger|text_le|text_lt|text_pattern_ge|" +
        "text_pattern_gt|text_pattern_le|text_pattern_lt|text_smaller|textanycat|textcat|texteq|" +
        "texticlike|texticnlike|texticregexeq|texticregexne|textin|textlen|textlike|textne|" +
        "textnlike|textout|textrecv|textregexeq|textregexne|textsend|thesaurus_init|" +
        "thesaurus_lexize|tideq|tidge|tidgt|tidin|tidlarger|tidle|tidlt|tidne|tidout|tidrecv|tidsend|" +
        "tidsmaller|time_cmp|time_eq|time_ge|time_gt|time_hash|time_in|time_larger|time_le|time_lt|" +
        "time_mi_interval|time_mi_time|time_ne|time_out|time_pl_interval|time_recv|time_send|" +
        "time_smaller|timedate_pl|timemi|timenow|timeofday|timepl|timestamp_cmp|" +
        "timestamp_cmp_date|timestamp_cmp_timestamptz|timestamp_eq|timestamp_eq_date|" +
        "timestamp_eq_timestamptz|timestamp_ge|timestamp_ge_date|timestamp_ge_timestamptz|" +
        "timestamp_gt|timestamp_gt_date|timestamp_gt_timestamptz|timestamp_hash|timestamp_in|" +
        "timestamp_larger|timestamp_le|timestamp_le_date|timestamp_le_timestamptz|" +
        "timestamp_lt|timestamp_lt_date|timestamp_lt_timestamptz|timestamp_mi|" +
        "timestamp_mi_interval|timestamp_ne|timestamp_ne_date|timestamp_ne_timestamptz|" +
        "timestamp_out|timestamp_pl_interval|timestamp_recv|timestamp_send|timestamp_smaller|" +
        "timestamptypmodin|timestamptypmodout|timestamptz_cmp|timestamptz_cmp_date|" +
        "timestamptz_cmp_timestamp|timestamptz_eq|timestamptz_eq_date|" +
        "timestamptz_eq_timestamp|timestamptz_ge|timestamptz_ge_date|" +
        "timestamptz_ge_timestamp|timestamptz_gt|timestamptz_gt_date|" +
        "timestamptz_gt_timestamp|timestamptz_in|timestamptz_larger|timestamptz_le|" +
        "timestamptz_le_date|timestamptz_le_timestamp|timestamptz_lt|timestamptz_lt_date|" +
        "timestamptz_lt_timestamp|timestamptz_mi|timestamptz_mi_interval|timestamptz_ne|" +
        "timestamptz_ne_date|timestamptz_ne_timestamp|timestamptz_out|" +
        "timestamptz_pl_interval|timestamptz_recv|timestamptz_send|timestamptz_smaller|" +
        "timestamptztypmodin|timestamptztypmodout|timetypmodin|timetypmodout|timetz_cmp|" +
        "timetz_eq|timetz_ge|timetz_gt|timetz_hash|timetz_in|timetz_larger|timetz_le|timetz_lt|" +
        "timetz_mi_interval|timetz_ne|timetz_out|timetz_pl_interval|timetz_recv|timetz_send|" +
        "timetz_smaller|timetzdate_pl|timetztypmodin|timetztypmodout|timezone|tinterval|" +
        "tintervalct|tintervalend|tintervaleq|tintervalge|tintervalgt|tintervalin|tintervalle|" +
        "tintervalleneq|tintervallenge|tintervallengt|tintervallenle|tintervallenlt|" +
        "tintervallenne|tintervallt|tintervalne|tintervalout|tintervalov|tintervalrecv|" +
        "tintervalrel|tintervalsame|tintervalsend|tintervalstart|to_ascii|to_char|to_date|to_hex|" +
        "to_number|to_timestamp|to_tsquery|to_tsvector|transaction_timestamp|translate|" +
        "trigger_in|trigger_out|trunc|ts_debug|ts_headline|ts_lexize|ts_match_qv|ts_match_tq|" +
        "ts_match_tt|ts_match_vq|ts_parse|ts_rank|ts_rank_cd|ts_rewrite|ts_stat|ts_token_type|" +
        "ts_typanalyze|tsmatchjoinsel|tsmatchsel|tsq_mcontained|tsq_mcontains|tsquery_and|" +
        "tsquery_cmp|tsquery_eq|tsquery_ge|tsquery_gt|tsquery_le|tsquery_lt|tsquery_ne|" +
        "tsquery_not|tsquery_or|tsqueryin|tsqueryout|tsqueryrecv|tsquerysend|tsvector_cmp|" +
        "tsvector_concat|tsvector_eq|tsvector_ge|tsvector_gt|tsvector_le|tsvector_lt|" +
        "tsvector_ne|tsvector_update_trigger|tsvector_update_trigger_column|tsvectorin|" +
        "tsvectorout|tsvectorrecv|tsvectorsend|txid_current|txid_current_snapshot|" +
        "txid_snapshot_in|txid_snapshot_out|txid_snapshot_recv|txid_snapshot_send|" +
        "txid_snapshot_xip|txid_snapshot_xmax|txid_snapshot_xmin|txid_visible_in_snapshot|" +
        "uhc_to_utf8|unique_key_recheck|unknownin|unknownout|unknownrecv|unknownsend|unnest|" +
        "upper|utf8_to_ascii|utf8_to_big5|utf8_to_euc_cn|utf8_to_euc_jis_2004|utf8_to_euc_jp|" +
        "utf8_to_euc_kr|utf8_to_euc_tw|utf8_to_gb18030|utf8_to_gbk|utf8_to_iso8859|" +
        "utf8_to_iso8859_1|utf8_to_johab|utf8_to_koi8r|utf8_to_koi8u|utf8_to_shift_jis_2004|" +
        "utf8_to_sjis|utf8_to_uhc|utf8_to_win|uuid_cmp|uuid_eq|uuid_ge|uuid_gt|uuid_hash|uuid_in|" +
        "uuid_le|uuid_lt|uuid_ne|uuid_out|uuid_recv|uuid_send|var_pop|var_samp|varbit_in|" +
        "varbit_out|varbit_recv|varbit_send|varbitcmp|varbiteq|varbitge|varbitgt|varbitle|" +
        "varbitlt|varbitne|varbittypmodin|varbittypmodout|varcharin|varcharout|varcharrecv|" +
        "varcharsend|varchartypmodin|varchartypmodout|variance|version|void_in|void_out|" +
        "void_recv|void_send|width|width_bucket|win1250_to_latin2|win1250_to_mic|win1251_to_iso|" +
        "win1251_to_koi8r|win1251_to_mic|win1251_to_win866|win866_to_iso|win866_to_koi8r|" +
        "win866_to_mic|win866_to_win1251|win_to_utf8|xideq|xideqint4|xidin|xidout|xidrecv|xidsend|" +
        "xml|xml_in|xml_is_well_formed|xml_is_well_formed_content|xml_is_well_formed_document|" +
        "xml_out|xml_recv|xml_send|xmlagg|xmlcomment|xmlconcat2|xmlexists|xmlvalidate|xpath|" +
        "xpath_exists").split("|")
    );
    
    var sqlRules = [
        {
            token : "string", // single line string -- assume dollar strings if multi-line for now
            regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
        }, {
            token : "variable.language", // pg identifier
            regex : '".*?"'
        }, {
            token : "constant.numeric", // float
            regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
        }, {
            token : function(value) {
                value = value.toLowerCase();
                if (keywords.hasOwnProperty(value)) {
                    return "keyword";
                } else if (builtinFunctions.hasOwnProperty(value)) {
                    return "support.function";
                } else {
                    return "identifier";
                }
              },
              regex : "[a-zA-Z_][a-zA-Z0-9_$]*\\b" // TODO - Unicode in identifiers
          }, {
              token : "keyword.operator",
              regex : "!|!!|!~|!~\\*|!~~|!~~\\*|#|##|#<|#<=|#<>|#=|#>|#>=|%|\\&|\\&\\&|\\&<|\\&<\\||\\&>|\\*|\\+|" +
                      "\\-|/|<|<#>|<\\->|<<|<<=|<<\\||<=|<>|<\\?>|<@|<\\^|=|>|>=|>>|>>=|>\\^|\\?#|\\?\\-|\\?\\-\\||" +
                      "\\?\\||\\?\\|\\||@|@\\-@|@>|@@|@@@|\\^|\\||\\|\\&>|\\|/|\\|>>|\\|\\||\\|\\|/|~|~\\*|~<=~|~<~|" +
                      "~=|~>=~|~>~|~~|~~\\*"
          }, {
              token : "lparen.paren",
              regex : "[\\(]"
          }, {
              token : "paren.rparen",
              regex : "[\\)]"
          }, {
              token : "text",
              regex : "\\s+"
          }
    ];
           

    this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : "--.*$"
            }, 
            new DocCommentHighlightRules().getStartRule("doc-start"),
            {
                token : "comment", // multi-line comment
                merge : true,
                regex : "\\/\\*",
                next : "comment"
            },{
                token : "keyword.statementBegin",
                regex : "^[a-zA-Z]+", // Could enumerate starting keywords but this allows things to work when new statements are added.
                next : "statement"
            },{
                token : "support.buildin", // psql directive
                regex : "^\\\\[\\S]+.*$"
            }
        ],
        
        "statement" : [
            {
                token : "comment",
                regex : "--.*$"
            }, {
                token : "comment", // multi-line comment
                merge : true,
                regex : "\\/\\*",
                next : "commentStatement"
            }, {
                token : "statementEnd",
                regex : ";",
                next : "start"
            }, {
                token : "string", // perl, python, tcl are in the pg default dist (no tcl highlighter)
                regex : "\\$perl\\$",
                next : "perl-start"
            }, {
                token : "string",
                regex : "\\$python\\$",
                next : "python-start"
            },{
                token : "string",
                regex : "\\$[\\w_0-9]*\\$$", // dollar quote at the end of a line
                next : "dollarSql"
            }, {
                token : "string",
                regex : "\\$[\\w_0-9]*\\$",
                next : "dollarStatementString"
            }
        ].concat(sqlRules),
        
        "dollarSql" : [
            {
                token : "comment",
                regex : "--.*$"
            }, {
                token : "comment", // multi-line comment
                merge : true,
                regex : "\\/\\*",
                next : "commentDollarSql"
            }, {
                token : "string", // end quoting with dollar at the start of a line
                regex : "^\\$[\\w_0-9]*\\$",
                next : "statement"
            }, {
                token : "string",
                regex : "\\$[\\w_0-9]*\\$",
                next : "dollarSqlString"
            }
        ].concat(sqlRules),
        
        "comment" : [
            {
                token : "comment", // closing comment
                regex : ".*?\\*\\/",
                next : "start"
            }, {
                token : "comment", // comment spanning whole line
                merge : true,
                regex : ".+"
            }
        ],
        
        "commentStatement" : [
            {
                token : "comment", // closing comment
                regex : ".*?\\*\\/",
                next : "statement"
            }, {
                token : "comment", // comment spanning whole line
                merge : true,
                regex : ".+"
            }
        ],
        
        "commentDollarSql" : [
            {
                token : "comment", // closing comment
                regex : ".*?\\*\\/",
                next : "dollarSql"
            }, {
                token : "comment", // comment spanning whole line
                merge : true,
                regex : ".+"
            }
        ],
        
        "dollarStatementString" : [
            {
                token : "string", // closing dollarstring
                regex : ".*?\\$[\\w_0-9]*\\$",
                next : "statement"
            }, {
                token : "string", // dollarstring spanning whole line
                merge : true,
                regex : ".+"
            }
        ],
        
        "dollarSqlString" : [
            {
                token : "string", // closing dollarstring
                regex : ".*?\\$[\\w_0-9]*\\$",
                next : "dollarSql"
            }, {
                token : "string", // dollarstring spanning whole line
                merge : true,
                regex : ".+"
            }
        ]
    };
    
    this.embedRules(DocCommentHighlightRules, "doc-", [ new DocCommentHighlightRules().getEndRule("start") ]);
    this.embedRules(PerlHighlightRules, "perl-", [{token : "string", regex : "\\$perl\\$", next : "statement"}]);
    this.embedRules(PythonHighlightRules, "python-", [{token : "string", regex : "\\$python\\$", next : "statement"}]);
};

oop.inherits(PgsqlHighlightRules, TextHighlightRules);

exports.PgsqlHighlightRules = PgsqlHighlightRules;
});

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

define('ace/lib/lang', ['require', 'exports', 'module' ], function(require, exports, module) {
"use strict";

exports.stringReverse = function(string) {
    return string.split("").reverse().join("");
};

exports.stringRepeat = function (string, count) {
     return new Array(count + 1).join(string);
};

var trimBeginRegexp = /^\s\s*/;
var trimEndRegexp = /\s\s*$/;

exports.stringTrimLeft = function (string) {
    return string.replace(trimBeginRegexp, '');
};

exports.stringTrimRight = function (string) {
    return string.replace(trimEndRegexp, '');
};

exports.copyObject = function(obj) {
    var copy = {};
    for (var key in obj) {
        copy[key] = obj[key];
    }
    return copy;
};

exports.copyArray = function(array){
    var copy = [];
    for (var i=0, l=array.length; i<l; i++) {
        if (array[i] && typeof array[i] == "object")
            copy[i] = this.copyObject( array[i] );
        else 
            copy[i] = array[i];
    }
    return copy;
};

exports.deepCopy = function (obj) {
    if (typeof obj != "object") {
        return obj;
    }
    
    var copy = obj.constructor();
    for (var key in obj) {
        if (typeof obj[key] == "object") {
            copy[key] = this.deepCopy(obj[key]);
        } else {
            copy[key] = obj[key];
        }
    }
    return copy;
};

exports.arrayToMap = function(arr) {
    var map = {};
    for (var i=0; i<arr.length; i++) {
        map[arr[i]] = 1;
    }
    return map;

};

/**
 * splice out of 'array' anything that === 'value'
 */
exports.arrayRemove = function(array, value) {
  for (var i = 0; i <= array.length; i++) {
    if (value === array[i]) {
      array.splice(i, 1);
    }
  }
};

exports.escapeRegExp = function(str) {
    return str.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
};

exports.deferredCall = function(fcn) {

    var timer = null;
    var callback = function() {
        timer = null;
        fcn();
    };

    var deferred = function(timeout) {
        deferred.cancel();
        timer = setTimeout(callback, timeout || 0);
        return deferred;
    };

    deferred.schedule = deferred;

    deferred.call = function() {
        this.cancel();
        fcn();
        return deferred;
    };

    deferred.cancel = function() {
        clearTimeout(timer);
        timer = null;
        return deferred;
    };

    return deferred;
};

});
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

define('ace/range', ['require', 'exports', 'module' ], function(require, exports, module) {
"use strict";

var Range = function(startRow, startColumn, endRow, endColumn) {
    this.start = {
        row: startRow,
        column: startColumn
    };

    this.end = {
        row: endRow,
        column: endColumn
    };
};

(function() {
    this.isEequal = function(range) {
        return this.start.row == range.start.row &&
            this.end.row == range.end.row &&
            this.start.column == range.start.column &&
            this.end.column == range.end.column
    };

    this.toString = function() {
        return ("Range: [" + this.start.row + "/" + this.start.column +
            "] -> [" + this.end.row + "/" + this.end.column + "]");
    };

    this.contains = function(row, column) {
        return this.compare(row, column) == 0;
    };

    /**
     * Compares this range (A) with another range (B), where B is the passed in
     * range.
     *
     * Return values:
     *  -2: (B) is infront of (A) and doesn't intersect with (A)
     *  -1: (B) begins before (A) but ends inside of (A)
     *   0: (B) is completly inside of (A) OR (A) is complety inside of (B)
     *  +1: (B) begins inside of (A) but ends outside of (A)
     *  +2: (B) is after (A) and doesn't intersect with (A)
     *
     *  42: FTW state: (B) ends in (A) but starts outside of (A)
     */
    this.compareRange = function(range) {
        var cmp,
            end = range.end,
            start = range.start;

        cmp = this.compare(end.row, end.column);
        if (cmp == 1) {
            cmp = this.compare(start.row, start.column);
            if (cmp == 1) {
                return 2;
            } else if (cmp == 0) {
                return 1;
            } else {
                return 0;
            }
        } else if (cmp == -1) {
            return -2;
        } else {
            cmp = this.compare(start.row, start.column);
            if (cmp == -1) {
                return -1;
            } else if (cmp == 1) {
                return 42;
            } else {
                return 0;
            }
        }
    }

    this.comparePoint = function(p) {
        return this.compare(p.row, p.column);
    }

    this.containsRange = function(range) {
        return this.comparePoint(range.start) == 0 && this.comparePoint(range.end) == 0;
    }

    this.isEnd = function(row, column) {
        return this.end.row == row && this.end.column == column;
    }

    this.isStart = function(row, column) {
        return this.start.row == row && this.start.column == column;
    }

    this.setStart = function(row, column) {
        if (typeof row == "object") {
            this.start.column = row.column;
            this.start.row = row.row;
        } else {
            this.start.row = row;
            this.start.column = column;
        }
    }

    this.setEnd = function(row, column) {
        if (typeof row == "object") {
            this.end.column = row.column;
            this.end.row = row.row;
        } else {
            this.end.row = row;
            this.end.column = column;
        }
    }

    this.inside = function(row, column) {
        if (this.compare(row, column) == 0) {
            if (this.isEnd(row, column) || this.isStart(row, column)) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    this.insideStart = function(row, column) {
        if (this.compare(row, column) == 0) {
            if (this.isEnd(row, column)) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    this.insideEnd = function(row, column) {
        if (this.compare(row, column) == 0) {
            if (this.isStart(row, column)) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    this.compare = function(row, column) {
        if (!this.isMultiLine()) {
            if (row === this.start.row) {
                return column < this.start.column ? -1 : (column > this.end.column ? 1 : 0);
            };
        }

        if (row < this.start.row)
            return -1;

        if (row > this.end.row)
            return 1;

        if (this.start.row === row)
            return column >= this.start.column ? 0 : -1;

        if (this.end.row === row)
            return column <= this.end.column ? 0 : 1;

        return 0;
    };

    /**
     * Like .compare(), but if isStart is true, return -1;
     */
    this.compareStart = function(row, column) {
        if (this.start.row == row && this.start.column == column) {
            return -1;
        } else {
            return this.compare(row, column);
        }
    }

    /**
     * Like .compare(), but if isEnd is true, return 1;
     */
    this.compareEnd = function(row, column) {
        if (this.end.row == row && this.end.column == column) {
            return 1;
        } else {
            return this.compare(row, column);
        }
    }

    this.compareInside = function(row, column) {
        if (this.end.row == row && this.end.column == column) {
            return 1;
        } else if (this.start.row == row && this.start.column == column) {
            return -1;
        } else {
            return this.compare(row, column);
        }
    }

    this.clipRows = function(firstRow, lastRow) {
        if (this.end.row > lastRow) {
            var end = {
                row: lastRow+1,
                column: 0
            };
        }

        if (this.start.row > lastRow) {
            var start = {
                row: lastRow+1,
                column: 0
            };
        }

        if (this.start.row < firstRow) {
            var start = {
                row: firstRow,
                column: 0
            };
        }

        if (this.end.row < firstRow) {
            var end = {
                row: firstRow,
                column: 0
            };
        }
        return Range.fromPoints(start || this.start, end || this.end);
    };

    this.extend = function(row, column) {
        var cmp = this.compare(row, column);

        if (cmp == 0)
            return this;
        else if (cmp == -1)
            var start = {row: row, column: column};
        else
            var end = {row: row, column: column};

        return Range.fromPoints(start || this.start, end || this.end);
    };

    this.isEmpty = function() {
        return (this.start.row == this.end.row && this.start.column == this.end.column);
    };

    this.isMultiLine = function() {
        return (this.start.row !== this.end.row);
    };

    this.clone = function() {
        return Range.fromPoints(this.start, this.end);
    };

    this.collapseRows = function() {
        if (this.end.column == 0)
            return new Range(this.start.row, 0, Math.max(this.start.row, this.end.row-1), 0)
        else
            return new Range(this.start.row, 0, this.end.row, 0)
    };

    this.toScreenRange = function(session) {
        var screenPosStart =
            session.documentToScreenPosition(this.start);
        var screenPosEnd =
            session.documentToScreenPosition(this.end);

        return new Range(
            screenPosStart.row, screenPosStart.column,
            screenPosEnd.row, screenPosEnd.column
        );
    };

}).call(Range.prototype);


Range.fromPoints = function(start, end) {
    return new Range(start.row, start.column, end.row, end.column);
};

exports.Range = Range;
});
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
*      André Fiedler <fiedler dot andre a t gmail dot com>
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

define('ace/mode/php', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../php_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../../range', '../../../../../behaviour/cstyle', '../../../../../folding/cstyle'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var PhpHighlightRules = require("./php_highlight_rules").PhpHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var Range = require("../range").Range;
var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new PhpHighlightRules().getRules());
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        var outdent = true;
        var re = /^(\s*)#/;

        for (var i=startRow; i<= endRow; i++) {
            if (!re.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        if (outdent) {
            var deleteRange = new Range(0, 0, 0, 0);
            for (var i=startRow; i<= endRow; i++)
            {
                var line = doc.getLine(i);
                var m = line.match(re);
                deleteRange.start.row = i;
                deleteRange.end.row = i;
                deleteRange.end.column = m[0].length;
                doc.replace(deleteRange, m[1]);
            }
        }
        else {
            doc.indentRows(startRow, endRow, "#");
        }
    };

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        if (state == "start") {
            var match = line.match(/^.*[\{\(\[\:]\s*$/);
            if (match) {
                indent += tab;
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
define('ace/mode/powershell', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../powershell_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../behaviour/cstyle', '../../../../../folding/cstyle'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var PowershellHighlightRules = require("./powershell_highlight_rules").PowershellHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new PowershellHighlightRules().getRules());
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }
      
        if (state == "start") {
            var match = line.match(/^.*[\{\(\[]\s*$/);
            if (match) {
                indent += tab;
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };


    this.createWorker = function(session) {
        return null;
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
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

define('ace/mode/python', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../python_highlight_rules', '../../../../../folding/pythonic', '../../../../../../range'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var PythonHighlightRules = require("./python_highlight_rules").PythonHighlightRules;
var PythonFoldMode = require("./folding/pythonic").FoldMode;
var Range = require("../range").Range;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new PythonHighlightRules().getRules());
    this.foldingRules = new PythonFoldMode("\\:");
};
oop.inherits(Mode, TextMode);

(function() {

    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        var outdent = true;
        var re = /^(\s*)#/;

        for (var i=startRow; i<= endRow; i++) {
            if (!re.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        if (outdent) {
            var deleteRange = new Range(0, 0, 0, 0);
            for (var i=startRow; i<= endRow; i++)
            {
                var line = doc.getLine(i);
                var m = line.match(re);
                deleteRange.start.row = i;
                deleteRange.end.row = i;
                deleteRange.end.column = m[0].length;
                doc.replace(deleteRange, m[1]);
            }
        }
        else {
            doc.indentRows(startRow, endRow, "#");
        }
    };

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        if (state == "start") {
            var match = line.match(/^.*[\{\(\[\:]\s*$/);
            if (match) {
                indent += tab;
            }
        }

        return indent;
    };

    var outdents = {
        "pass": 1,
        "return": 1,
        "raise": 1,
        "break": 1,
        "continue": 1
    };
    
    this.checkOutdent = function(state, line, input) {
        if (input !== "\r\n" && input !== "\r" && input !== "\n")
            return false;

        var tokens = this.$tokenizer.getLineTokens(line.trim(), state).tokens;
        
        if (!tokens)
            return false;
        
        // ignore trailing comments
        do {
            var last = tokens.pop();
        } while (last && (last.type == "comment" || (last.type == "text" && last.value.match(/^\s+$/))));
        
        if (!last)
            return false;
        
        return (last.type == "keyword" && outdents[last.value]);
    };

    this.autoOutdent = function(state, doc, row) {
        // outdenting in python is slightly different because it always applies
        // to the next line and only of a new line is inserted
        
        row += 1;
        var indent = this.$getIndent(doc.getLine(row));
        var tab = doc.getTabString();
        if (indent.slice(-tab.length) == tab)
            doc.remove(new Range(row, indent.length-tab.length, row, indent.length));
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
define('ace/mode/scala', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../javascript', '../../../../../../tokenizer', '../../../../../scala_highlight_rules'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var JavaScriptMode = require("./javascript").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var ScalaHighlightRules = require("./scala_highlight_rules").ScalaHighlightRules;

var Mode = function() {
    JavaScriptMode.call(this);
    
    this.$tokenizer = new Tokenizer(new ScalaHighlightRules().getRules());
};
oop.inherits(Mode, JavaScriptMode);

(function() {

    this.createWorker = function(session) {
        return null;
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
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

define('ace/mode/scss', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../scss_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../folding/cstyle'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var ScssHighlightRules = require("./scss_highlight_rules").ScssHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new ScssHighlightRules().getRules(), "i");
    this.$outdent = new MatchingBraceOutdent();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {
    
    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        // ignore braces in comments
        var tokens = this.$tokenizer.getLineTokens(line, state).tokens;
        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        var match = line.match(/^.*\{\s*$/);
        if (match) {
            indent += tab;
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

}).call(Mode.prototype);

exports.Mode = Mode;

});
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
 *      Shlomo Zalman Heigh <shlomozalmanheigh AT gmail DOT com>
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

define('ace/mode/ruby', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../ruby_highlight_rules', '../../../../../matching_brace_outdent', '../../../../../../range'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var RubyHighlightRules = require("./ruby_highlight_rules").RubyHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var Range = require("../range").Range;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new RubyHighlightRules().getRules());
    this.$outdent = new MatchingBraceOutdent();
};
oop.inherits(Mode, TextMode);

(function() {

    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        var outdent = true;
        var re = /^(\s*)#/;

        for (var i=startRow; i<= endRow; i++) {
            if (!re.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        if (outdent) {
            var deleteRange = new Range(0, 0, 0, 0);
            for (var i=startRow; i<= endRow; i++)
            {
                var line = doc.getLine(i);
                var m = line.match(re);
                deleteRange.start.row = i;
                deleteRange.end.row = i;
                deleteRange.end.column = m[0].length;
                doc.replace(deleteRange, m[1]);
            }
        }
        else {
            doc.indentRows(startRow, endRow, "#");
        }
    };

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }
        
        if (state == "start") {
            var match = line.match(/^.*[\{\(\[]\s*$/);
            if (match) {
                indent += tab;
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
/* ***** BEGIN LICENSE BLOCK *****
* The Original Code is Ajax.org Code Editor (ACE).
*
* Contributor(s):
*      Jonathan Camile <jonathan.camile AT gmail DOT com>
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

define('ace/mode/sql', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../sql_highlight_rules', '../../../../../../range'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var SqlHighlightRules = require("./sql_highlight_rules").SqlHighlightRules;
var Range = require("../range").Range;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new SqlHighlightRules().getRules());
};
oop.inherits(Mode, TextMode);

(function() {

    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        var outdent = true;
        var outentedRows = [];
        var re = /^(\s*)--/;

        for (var i=startRow; i<= endRow; i++) {
            if (!re.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        if (outdent) {
            var deleteRange = new Range(0, 0, 0, 0);
            for (var i=startRow; i<= endRow; i++)
            {
                var line = doc.getLine(i);
                var m = line.match(re);
                deleteRange.start.row = i;
                deleteRange.end.row = i;
                deleteRange.end.column = m[0].length;
                doc.replace(deleteRange, m[1]);
            }
        }
        else {
            doc.indentRows(startRow, endRow, "--");
        }
    };

}).call(Mode.prototype);

exports.Mode = Mode;

});
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
 *      Kelley van Evert <kelley.vanevert@gmail.com>
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

define('ace/mode/textile', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../textile_highlight_rules', '../../../../../matching_brace_outdent'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var TextileHighlightRules = require("./textile_highlight_rules").TextileHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new TextileHighlightRules().getRules());
    this.$outdent = new MatchingBraceOutdent();
};
oop.inherits(Mode, TextMode);

(function() {
    this.getNextLineIndent = function(state, line, tab) {
        if (state == "intag")
            return tab;
        
        return "";
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };
    
}).call(Mode.prototype);

exports.Mode = Mode;

});
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

define('ace/mode/xml', ['require', 'exports', 'module' , '../../../../../../lib/oop', '../../../../../text', '../../../../../../tokenizer', '../../../../../xml_highlight_rules', '../../../../../behaviour/xml', '../../../../../folding/xml'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var XmlHighlightRules = require("./xml_highlight_rules").XmlHighlightRules;
var XmlBehaviour = require("./behaviour/xml").XmlBehaviour;
var XmlFoldMode = require("./folding/xml").FoldMode;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new XmlHighlightRules().getRules());
    this.$behaviour = new XmlBehaviour();
    this.foldingRules = new XmlFoldMode();
};

oop.inherits(Mode, TextMode);

(function() {
    
    this.getNextLineIndent = function(state, line, tab) {
        return this.$getIndent(line);
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
/* vim:ts=4:sts=4:sw=4:
 * ***** BEGIN LICENSE BLOCK *****
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
 *  Julian Viereck <julian.viereck@gmail.com>
 *
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
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

define('ace/split', ['require', 'exports', 'module' , '../../../../../lib/oop', '../../../../../lib/lang', '../../../../../lib/event_emitter', '../../../../../editor', '../../../../../virtual_renderer', '../../../../../edit_session'], function(require, exports, module) {
"use strict";

var oop = require("./lib/oop");
var lang = require("./lib/lang");
var EventEmitter = require("./lib/event_emitter").EventEmitter;

var Editor = require("./editor").Editor;
var Renderer = require("./virtual_renderer").VirtualRenderer;
var EditSession = require("./edit_session").EditSession;

var Split = function(container, theme, splits) {
    this.BELOW = 1;
    this.BESIDE = 0;

    this.$container = container;
    this.$theme = theme;
    this.$splits = 0;
    this.$editorCSS = "";
    this.$editors = [];
    this.$oriantation = this.BESIDE;

    this.setSplits(splits || 1);
    this.$cEditor = this.$editors[0];


    this.on("focus", function(editor) {
        this.$cEditor = editor;
    }.bind(this));
};

(function(){

    oop.implement(this, EventEmitter);

    this.$createEditor = function() {
        var el = document.createElement("div");
        el.className = this.$editorCSS;
        el.style.cssText = "position: absolute; top:0px; bottom:0px";
        this.$container.appendChild(el);
        var editor = new Editor(new Renderer(el, this.$theme));

        editor.on("focus", function() {
            this._emit("focus", editor);
        }.bind(this));

        this.$editors.push(editor);
        editor.setFontSize(this.$fontSize);
        return editor;
    };

    this.setSplits = function(splits) {
        var editor;
        if (splits < 1) {
            throw "The number of splits have to be > 0!";
        }

        if (splits == this.$splits) {
            return;
        } else if (splits > this.$splits) {
            while (this.$splits < this.$editors.length && this.$splits < splits) {
                editor = this.$editors[this.$splits];
                this.$container.appendChild(editor.container);
                editor.setFontSize(this.$fontSize);
                this.$splits ++;
            }
            while (this.$splits < splits) {
                this.$createEditor();
                this.$splits ++;
            }
        } else {
            while (this.$splits > splits) {
                editor = this.$editors[this.$splits - 1];
                this.$container.removeChild(editor.container);
                this.$splits --;
            }
        }
        this.resize();
    };

    this.getSplits = function() {
        return this.$splits;
    };

    this.getEditor = function(idx) {
        return this.$editors[idx];
    };

    this.getCurrentEditor = function() {
        return this.$cEditor;
    };

    this.focus = function() {
        this.$cEditor.focus();
    };

    this.blur = function() {
        this.$cEditor.blur();
    };

    this.setTheme = function(theme) {
        this.$editors.forEach(function(editor) {
            editor.setTheme(theme);
        });
    };

    this.setKeyboardHandler = function(keybinding) {
        this.$editors.forEach(function(editor) {
            editor.setKeyboardHandler(keybinding);
        });
    };

    this.forEach = function(callback, scope) {
        this.$editors.forEach(callback, scope);
    };

    this.$fontSize = "";
    this.setFontSize = function(size) {
        this.$fontSize = size;
        this.forEach(function(editor) {
           editor.setFontSize(size);
        });
    };

    this.$cloneSession = function(session) {
        var s = new EditSession(session.getDocument(), session.getMode());

        var undoManager = session.getUndoManager();
        if (undoManager) {
            var undoManagerProxy = new UndoManagerProxy(undoManager, s);
            s.setUndoManager(undoManagerProxy);
        }

        // Overwrite the default $informUndoManager function such that new delas
        // aren't added to the undo manager from the new and the old session.
        s.$informUndoManager = lang.deferredCall(function() { s.$deltas = []; });

        // Copy over 'settings' from the session.
        s.setTabSize(session.getTabSize());
        s.setUseSoftTabs(session.getUseSoftTabs());
        s.setOverwrite(session.getOverwrite());
        s.setBreakpoints(session.getBreakpoints());
        s.setUseWrapMode(session.getUseWrapMode());
        s.setUseWorker(session.getUseWorker());
        s.setWrapLimitRange(session.$wrapLimitRange.min,
                            session.$wrapLimitRange.max);
        s.$foldData = session.$cloneFoldData();

        return s;
    };

    this.setSession = function(session, idx) {
        var editor;
        if (idx == null) {
            editor = this.$cEditor;
        } else {
            editor = this.$editors[idx];
        }

        // Check if the session is used already by any of the editors in the
        // split. If it is, we have to clone the session as two editors using
        // the same session can cause terrible side effects (e.g. UndoQueue goes
        // wrong). This also gives the user of Split the possibility to treat
        // each session on each split editor different.
        var isUsed = this.$editors.some(function(editor) {
           return editor.session === session;
        });

        if (isUsed) {
            session = this.$cloneSession(session);
        }
        editor.setSession(session);

        // Return the session set on the editor. This might be a cloned one.
        return session;
    };

    this.getOriantation = function() {
        return this.$oriantation;
    };

    this.setOriantation = function(oriantation) {
        if (this.$oriantation == oriantation) {
            return;
        }
        this.$oriantation = oriantation;
        this.resize();
    };

    this.resize = function() {
        var width = this.$container.clientWidth;
        var height = this.$container.clientHeight;
        var editor;

        if (this.$oriantation == this.BESIDE) {
            var editorWidth = width / this.$splits;
            for (var i = 0; i < this.$splits; i++) {
                editor = this.$editors[i];
                editor.container.style.width = editorWidth + "px";
                editor.container.style.top = "0px";
                editor.container.style.left = i * editorWidth + "px";
                editor.container.style.height = height + "px";
                editor.resize();
            }
        } else {
            var editorHeight = height / this.$splits;
            for (var i = 0; i < this.$splits; i++) {
                editor = this.$editors[i];
                editor.container.style.width = width + "px";
                editor.container.style.top = i * editorHeight + "px";
                editor.container.style.left = "0px";
                editor.container.style.height = editorHeight + "px";
                editor.resize();
            }
        }
    };

}).call(Split.prototype);

function UndoManagerProxy(undoManager, session) {
    this.$u = undoManager;
    this.$doc = session;
}

(function() {
    this.execute = function(options) {
        this.$u.execute(options);
    };

    this.undo = function() {
        var selectionRange = this.$u.undo(true);
        if (selectionRange) {
            this.$doc.selection.setSelectionRange(selectionRange);
        }
    };

    this.redo = function() {
        var selectionRange = this.$u.redo(true);
        if (selectionRange) {
            this.$doc.selection.setSelectionRange(selectionRange);
        }
    };

    this.reset = function() {
        this.$u.reset();
    };

    this.hasUndo = function() {
        return this.$u.hasUndo();
    };

    this.hasRedo = function() {
        return this.$u.hasRedo();
    };
}).call(UndoManagerProxy.prototype);

exports.Split = Split;
});
;
            (function() {
                window.require(["ace/ace"], function(a) {
                    if (!window.ace)
                        window.ace = {};
                    for (var key in a) if (a.hasOwnProperty(key))
                        ace[key] = a[key];
                });
            })();
        