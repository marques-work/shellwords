/*
 * shellwords.js
 * author: Marques Lee
 * license : MIT
 * http://github.com/marques-work/shellwords
 */

"use strict";

function scan(line: string, pattern: RegExp, callback: (match: RegExpMatchArray) => void) {
  let result = "";
  let match: RegExpMatchArray | null;

  while (!!line.length) {
    match = line.match(pattern);
    if (match) {
      result += line.slice(0, match.index);
      result += callback(match);
      line = line.slice(match.index! + match[0].length);
    } else {
      result += line;
      line = "";
    }
  }
  return result;
}

// Template string transformer to build regexes
// Removes comments, whitespace, and annotations
// Lifted from: https://github.com/drudru/ansi_up/blob/6f5a1b8efefc5d48685709b9a54d33b78e8bdfe2/ansi_up.ts#L701-L709
function rgx(tmplObj: TemplateStringsArray, ...subst: string[]) {
    // Use the 'raw' value so we don't have to double backslash in a template string
    const regexText: string = tmplObj.raw[0];

    // Remove white-space and comments
    const wsrgx = /^\s+|\s+\n|\s*#[\s\S]*?\n|\n/gm;
    const txt2 = regexText.replace(wsrgx, '');
    return new RegExp(txt2, "m");
}

const SHELL_PARSE_REGEX = rgx`
\s*                     # Leading whitespace
(?:                       #
  ([^\s\\\'\"]+)          # Normal words
  |                       #
  '([^\']*)'              # Stuff in single quotes
  |                       #
  "((?:[^\"\\]|\\.)*)"    # Stuff in double quotes
  |                       #
  (\\.?)                  # Escaped character
  |                       #
  (\S)                    # Garbage
)                         #
(\s|$)?                 # Seperator
`;

class Shellwords {
  split(line: string, callback?: (rawToken: string) => void): string[] {
    const words: string[] = [];
    let field: string = "";
    let rawParsed = "";
    scan(line, SHELL_PARSE_REGEX, (match: RegExpMatchArray) => {
      const [raw, word, sq, dq, esc, garbage, seperator] = match;

      if ("string" === typeof garbage) {
        throw new Error("Unmatched quote");
      }

      rawParsed += raw;

      field += (word || sq || (dq && dq.replace(/\\([$`"\\\n])/g, "$1")) || (esc || "").replace(/\\(.)/g, "$1"));

      if ("string" === typeof seperator || "" === sq || "" === dq) {
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
  }

  escape(raw: string): string {
    if (!raw) {
      return "''";
    }
    return raw.replace(/([^A-Za-z0-9_\-.,:\/@\n])/g, "\\$1").replace(/\n/g, "'\n'");
  }

  join(strings: string[]): string {
    const results: string[] = [];
    for (const s of strings) {
      results.push(this.escape(s));
    }
    return results.join(" ");
  }
}

export default new Shellwords();
