"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
function scan(line, pattern, callback) {
    var result = "";
    var match;
    while (!!line.length) {
        match = line.match(pattern);
        if (match) {
            result += line.slice(0, match.index);
            result += callback(match);
            line = line.slice(match.index + match[0].length);
        }
        else {
            result += line;
            line = "";
        }
    }
    return result;
}
function rgx(tmplObj) {
    var subst = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        subst[_i - 1] = arguments[_i];
    }
    var regexText = tmplObj.raw[0];
    var wsrgx = /^\s+|\s+\n|\s*#[\s\S]*?\n|\n/gm;
    var txt2 = regexText.replace(wsrgx, '');
    return new RegExp(txt2);
}
var SHELL_PARSE_REGEX = rgx(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\ns*                     # Leading whitespace\n(?:                       #\n  ([^s\\'\"]+)          # Normal words\n  |                       #\n  '((?:[^'\\]|\\.)*)'    # Stuff in single quotes\n  |                       #\n  \"((?:[^\"\\]|\\.)*)\"    # Stuff in double quotes\n  |                       #\n  (\\.?)                  # Escaped character\n  |                       #\n  (S)                    # Garbage\n)                         #\n(s|$)?                 # Seperator\n"], ["\n\\s*                     # Leading whitespace\n(?:                       #\n  ([^\\s\\\\\\'\\\"]+)          # Normal words\n  |                       #\n  '((?:[^\\'\\\\]|\\\\.)*)'    # Stuff in single quotes\n  |                       #\n  \"((?:[^\\\"\\\\]|\\\\.)*)\"    # Stuff in double quotes\n  |                       #\n  (\\\\.?)                  # Escaped character\n  |                       #\n  (\\S)                    # Garbage\n)                         #\n(\\s|$)?                 # Seperator\n"])));
var Shellwords = (function () {
    function Shellwords() {
    }
    Shellwords.prototype.split = function (line, callback) {
        line = line || "";
        var words = [];
        var field = "";
        var rawParsed = "";
        scan(line, SHELL_PARSE_REGEX, function (match) {
            var raw = match[0], word = match[1], sq = match[2], dq = match[3], esc = match[4], garbage = match[5], seperator = match[6];
            if (garbage != null) {
                throw new Error("Unmatched quote");
            }
            rawParsed += raw;
            field += word || (sq || dq || esc).replace(/\\(?=.)/, "");
            if ("string" === typeof seperator) {
                words.push(field);
                if ("function" === typeof callback) {
                    callback(rawParsed);
                }
                rawParsed = "";
                return field = "";
            }
        });
        if (field) {
            words.push(field);
        }
        return words;
    };
    Shellwords.prototype.escape = function (raw) {
        if (!raw) {
            return "''";
        }
        return raw.replace(/([^A-Za-z0-9_\-.,:\/@\n])/g, "\\$1").replace(/\n/g, "'\n'");
    };
    return Shellwords;
}());
exports.default = new Shellwords();
var templateObject_1;
//# sourceMappingURL=shellwords.js.map