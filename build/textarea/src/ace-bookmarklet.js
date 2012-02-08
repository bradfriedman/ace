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

var ACE_NAMESPACE = "__ace_shadowed__";

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
 * Get at functionality __ace_shadowed__.define()ed using the function above
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
 *      Kevin Dangoor (kdangoor@mozilla.com)
 *      Julian Viereck <julian.viereck@gmail.com>
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

__ace_shadowed__.define('ace/ext/textarea', ['require', 'exports', 'module' , '../../../../../../lib/event', '../../../../../../lib/useragent', '../../../../../../lib/net', '../../../../../../ace', 'ace/theme/textmate', '../../../../../../mode/text'], function(require, exports, module) {
"use strict";

var Event = require("../lib/event");
var UA = require("../lib/useragent");
var net = require("../lib/net");
var ace = require("../ace");

require("ace/theme/textmate");

/**
 * Returns the CSS property of element.
 *   1) If the CSS property is on the style object of the element, use it, OR
 *   2) Compute the CSS property
 *
 * If the property can't get computed, is 'auto' or 'intrinsic', the former
 * calculated property is uesd (this can happen in cases where the textarea
 * is hidden and has no dimension styles).
 */
var getCSSProperty = function(element, container, property) {
    var ret = element.style[property];

    if (!ret) {
        if (window.getComputedStyle) {
            ret = window.getComputedStyle(element, '').getPropertyValue(property);
        } else {
            ret = element.currentStyle[property];
        }
    }

    if (!ret || ret == 'auto' || ret == 'intrinsic') {
        ret = container.style[property];
    }
    return ret;
};

function applyStyles(elm, styles) {
    for (var style in styles) {
        elm.style[style] = styles[style];
    }
}

function setupContainer(element, getValue) {
        if (element.type != 'textarea') {
        throw "Textarea required!";
    }

    var parentNode = element.parentNode;

    // This will hold the editor.
    var container = document.createElement('div');

    // To put Ace in the place of the textarea, we have to copy a few of the
    // textarea's style attributes to the div container.
    //
    // The problem is that the properties have to get computed (they might be
    // defined by a CSS file on the page - you can't access such rules that
    // apply to an element via elm.style). Computed properties are converted to
    // pixels although the dimension might be given as percentage. When the
    // window resizes, the dimensions defined by percentages changes, so the
    // properties have to get recomputed to get the new/true pixels.
    var resizeEvent = function() {
        var style = 'position:relative;';
        [
            'margin-top', 'margin-left', 'margin-right', 'margin-bottom'
        ].forEach(function(item) {
            style += item + ':' +
                        getCSSProperty(element, container, item) + ';';
        });

        // Calculating the width/height of the textarea is somewhat tricky. To
        // do it right, you have to include the paddings to the sides as well
        // (eg. width = width + padding-left, -right).  This works well, as
        // long as the width of the element is not set or given in pixels. In
        // this case and after the textarea is hidden, getCSSProperty(element,
        // container, 'width') will still return pixel value. If the element
        // has realtiv dimensions (e.g. width='95<percent>')
        // getCSSProperty(...) will return pixel values only as long as the
        // textarea is visible. After it is hidden getCSSProperty will return
        // the relative dimensions as they are set on the element (in the case
        // of width, 95<percent>).
        // Making the sum of pixel vaules (e.g. padding) and realtive values
        // (e.g. <percent>) is not possible. As such the padding styles are
        // ignored.

        // The complete width is the width of the textarea + the padding
        // to the left and right.
        var width = getCSSProperty(element, container, 'width') || (element.clientWidth + "px");
        var height = getCSSProperty(element, container, 'height')  || (element.clientHeight + "px");
        style += 'height:' + height + ';width:' + width + ';';

        // Set the display property to 'inline-block'.
        style += 'display:inline-block;';
        container.setAttribute('style', style);
    };
    Event.addListener(window, 'resize', resizeEvent);

    // Call the resizeEvent once, so that the size of the container is
    // calculated.
    resizeEvent();

    // Insert the div container after the element.
    if (element.nextSibling) {
        parentNode.insertBefore(container, element.nextSibling);
    } else {
        parentNode.appendChild(container);
    }

    // Override the forms onsubmit function. Set the innerHTML and value
    // of the textarea before submitting.
    while (parentNode !== document) {
        if (parentNode.tagName.toUpperCase() === 'FORM') {
            var oldSumit = parentNode.onsubmit;
            // Override the onsubmit function of the form.
            parentNode.onsubmit = function(evt) {
                element.innerHTML = getValue();
                element.value = getValue();
                // If there is a onsubmit function already, then call
                // it with the current context and pass the event.
                if (oldSumit) {
                    oldSumit.call(this, evt);
                }
            };
            break;
        }
        parentNode = parentNode.parentNode;
    }
    return container;
}

exports.transformTextarea = function(element, loader) {
    var session;
    var container = setupContainer(element, function() {
        return session.getValue();
    });

    // Hide the element.
    element.style.display = 'none';
    container.style.background = 'white';

    //
    var editorDiv = document.createElement("div");
    applyStyles(editorDiv, {
        top: "0px",
        left: "0px",
        right: "0px",
        bottom: "0px",
        border: "1px solid gray"
    });
    container.appendChild(editorDiv);

    var settingOpener = document.createElement("div");
    applyStyles(settingOpener, {
        position: "absolute",
        width: "15px",
        right: "0px",
        bottom: "0px",
        background: "red",
        cursor: "pointer",
        textAlign: "center",
        fontSize: "12px"
    });
    settingOpener.innerHTML = "I";

    var settingDiv = document.createElement("div");
    var settingDivStyles = {
        top: "0px",
        left: "0px",
        right: "0px",
        bottom: "0px",
        position: "absolute",
        padding: "5px",
        zIndex: 100,
        color: "white",
        display: "none",
        overflow: "auto",
        fontSize: "14px"
    };
    if (!UA.isOldIE) {
        settingDivStyles.backgroundColor = "rgba(0, 0, 0, 0.6)";
    } else {
        settingDivStyles.backgroundColor = "#333";
    }

    applyStyles(settingDiv, settingDivStyles);
    container.appendChild(settingDiv);

    // Power up ace on the textarea:
    var options = {};

    var editor = ace.edit(editorDiv);
    session = editor.getSession();

    session.setValue(element.value || element.innerHTML);
    editor.focus();

    // Add the settingPanel opener to the editor's div.
    editorDiv.appendChild(settingOpener);

    // Create the API.
    var api = setupApi(editor, editorDiv, settingDiv, ace, options, loader);

    // Create the setting's panel.
    setupSettingPanel(settingDiv, settingOpener, api, options);

    return api;
};

function load(url, module, callback) {
    net.loadScript(url, function() {
        require([module], callback);
    });
}

function setupApi(editor, editorDiv, settingDiv, ace, options, loader) {
    var session = editor.getSession();
    var renderer = editor.renderer;
    loader = loader || load;

    function toBool(value) {
        return value == "true";
    }

    var ret = {
        setDisplaySettings: function(display) {
            settingDiv.style.display = display ? "block" : "none";
        },

        setOption: function(key, value) {
            if (options[key] == value) return;

            switch (key) {
                case "gutter":
                    renderer.setShowGutter(toBool(value));
                break;

                case "mode":
                    if (value != "text") {
                        // Load the required mode file. Files get loaded only once.
                        loader("mode-" + value + ".js", "ace/mode/" + value, function() {
                            var aceMode = require("../mode/" + value).Mode;
                            session.setMode(new aceMode());
                        });
                    } else {
                        session.setMode(new (require("../mode/text").Mode));
                    }
                break;

                case "theme":
                    if (value != "textmate") {
                        // Load the required theme file. Files get loaded only once.
                        loader("theme-" + value + ".js", "ace/theme/" + value, function() {
                            editor.setTheme("ace/theme/" + value);
                        });
                    } else {
                        editor.setTheme("ace/theme/textmate");
                    }
                break;

                case "fontSize":
                    editorDiv.style.fontSize = value;
                break;

                case "softWrap":
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
                break;

                case "useSoftTabs":
                    session.setUseSoftTabs(toBool(value));
                break;

                case "showPrintMargin":
                    renderer.setShowPrintMargin(toBool(value));
                break;

                case "showInvisibles":
                    editor.setShowInvisibles(toBool(value));
                break;
            }

            options[key] = value;
        },

        getOption: function(key) {
            return options[key];
        },

        getOptions: function() {
            return options;
        }
    };

    for (var option in exports.options) {
        ret.setOption(option, exports.options[option]);
    }

    return ret;
}

function setupSettingPanel(settingDiv, settingOpener, api, options) {
    var BOOL = {
        "true":  true,
        "false": false
    };

    var desc = {
        mode:            "Mode:",
        gutter:          "Display Gutter:",
        theme:           "Theme:",
        fontSize:        "Font Size:",
        softWrap:        "Soft Wrap:",
        showPrintMargin: "Show Print Margin:",
        useSoftTabs:     "Use Soft Tabs:",
        showInvisibles:  "Show Invisibles"
    };

    var optionValues = {
        mode: {
            text:       "Plain",
            javascript: "JavaScript",
            xml:        "XML",
            html:       "HTML",
            css:        "CSS",
            scss:       "SCSS",
            python:     "Python",
            php:        "PHP",
            java:       "Java",
            ruby:       "Ruby",
            c_cpp:      "C/C++",
            coffee:     "CoffeeScript",
            json:       "json",
            perl:       "Perl",
            clojure:    "Clojure",
            ocaml:      "OCaml",
            csharp:     "C#",
            haxe:       "haXe",
            svg:        "SVG",
            textile:    "Textile",
            groovy:     "Groovy",
            Scala:      "Scala"
        },
        theme: {
            clouds:           "Clouds",
            clouds_midnight:  "Clouds Midnight",
            cobalt:           "Cobalt",
            crimson_editor:   "Crimson Editor",
            dawn:             "Dawn",
            eclipse:          "Eclipse",
            idle_fingers:     "Idle Fingers",
            kr_theme:         "Kr Theme",
            merbivore:        "Merbivore",
            merbivore_soft:   "Merbivore Soft",
            mono_industrial:  "Mono Industrial",
            monokai:          "Monokai",
            pastel_on_dark:   "Pastel On Dark",
            solarized_dark:   "Solarized Dark",
            solarized_light:  "Solarized Light",
            textmate:         "Textmate",
            twilight:         "Twilight",
            vibrant_ink:      "Vibrant Ink"
        },
        gutter: BOOL,
        fontSize: {
            "10px": "10px",
            "11px": "11px",
            "12px": "12px",
            "14px": "14px",
            "16px": "16px"
        },
        softWrap: {
            off:    "Off",
            40:     "40",
            80:     "80",
            free:   "Free"
        },
        showPrintMargin:    BOOL,
        useSoftTabs:        BOOL,
        showInvisibles:     BOOL
    };

    var table = [];
    table.push("<table><tr><th>Setting</th><th>Value</th></tr>");

    function renderOption(builder, option, obj, cValue) {
        builder.push("<select title='" + option + "'>");
        for (var value in obj) {
            builder.push("<option value='" + value + "' ");

            if (cValue == value) {
                builder.push(" selected ");
            }

            builder.push(">",
                obj[value],
                "</option>");
        }
        builder.push("</select>");
    }

    for (var option in options) {
        table.push("<tr><td>", desc[option], "</td>");
        table.push("<td>");
        renderOption(table, option, optionValues[option], options[option]);
        table.push("</td></tr>");
    }
    table.push("</table>");
    settingDiv.innerHTML = table.join("");

    var selects = settingDiv.getElementsByTagName("select");
    for (var i = 0; i < selects.length; i++) {
        var onChange = (function() {
            var select = selects[i];
            return function() {
                var option = select.title;
                var value  = select.value;
                api.setOption(option, value);
            };
        })();
        selects[i].onchange = onChange;
    }

    var button = document.createElement("input");
    button.type = "button";
    button.value = "Hide";
    button.onclick = function() {
        api.setDisplaySettings(false);
    };
    settingDiv.appendChild(button);

    settingOpener.onclick = function() {
        api.setDisplaySettings(true);
    };
}

// Default startup options.
exports.options = {
    mode:               "text",
    theme:              "textmate",
    gutter:             "false",
    fontSize:           "12px",
    softWrap:           "off",
    showPrintMargin:    "false",
    useSoftTabs:        "true",
    showInvisibles:     "true"
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

__ace_shadowed__.define('ace/theme/textmate', ['require', 'exports', 'module' , '../../../../../../lib/dom'], function(require, exports, module) {
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
;
            (function() {
                __ace_shadowed__.require(["ace/ext/textarea"], function(a) {
                    if (!window.__ace_shadowed__)
                        window.__ace_shadowed__ = {};
                    for (var key in a) if (a.hasOwnProperty(key))
                        __ace_shadowed__[key] = a[key];
                });
            })();
        