import {expect} from "chai";
import Shellwords from "../src/shellwords";

describe("Shellwords", () => {
  describe("#split", () => {
    it("handles blank strings", () => {
      let results = Shellwords.split("");
      expect(results).to.deep.equal([]);

      results = Shellwords.split("        ");
      expect(results).to.deep.equal([]);

      results = Shellwords.split("\n\n");
      expect(results).to.deep.equal([]);

      results = Shellwords.split("\n\t \n\r  \t\t ");
      expect(results).to.deep.equal([]);

      results = Shellwords.split("   \r\n\t   \"\"     \t\t\n\n   ");
      expect(results).to.deep.equal([""]);

      results = Shellwords.split("   \r\n\t   ''     \t\t\n\n       ");
      expect(results).to.deep.equal([""]);

      results = Shellwords.split("\"\"");
      expect(results).to.deep.equal([""]);

      results = Shellwords.split("''");
      expect(results).to.deep.equal([""]);

      results = Shellwords.split("  \"\"  ''  \n\n \"\" \t '' ");
      expect(results).to.deep.equal(["", "", "", ""]);

      results = Shellwords.split("''\"\"''\"\"");
      expect(results).to.deep.equal(["", "", "", ""]);
    });

    it("does not apply special treatment to meta-characters", () => {
      expect(Shellwords.split("ruby my_prog.rb | less")).to.deep.equal(["ruby", "my_prog.rb", "|", "less"])

      // It is the consumer's responsibility to filter out trailing backslashes when
      // parsing multiline entries; these are treated like any argument as this is not
      // a command line parser
      expect(Shellwords.split(`
        find . \\
          -type f \\
          -name package.json
      `)).to.deep.equal(["find", ".", "\\", "-type", "f", "\\", "-name", "package.json"]);
    });

    it("handles complex commands", () => {
      let results = Shellwords.split("ruby -i'.bak' -pe \"sub /foo/, '\\\\&bar'\" foobar\\ me.txt\n");
      expect(results).to.deep.equal(["ruby", "-i.bak", "-pe", "sub /foo/, '\\&bar'", "foobar me.txt"]);

      results = Shellwords.split("ruby -i'.bak' -pe \"sub /foo/, '\\\\&bar'\" foobar\\ me.txt\n'' \"\"")
      expect(results).to.deep.equal(["ruby", "-i.bak", "-pe", "sub /foo/, '\\&bar'", "foobar me.txt", "", ""]);
    });

    it("handles consecutive backslashes", () => {
      [
        [
          "\\a\\\\b\\\\\\c\\\\\\\\d\\\\\\\\\\e\\ \"\\a\\\\b\\\\\\c\\\\\\\\d\\\\\\\\\\e\\ \"'\\a\\\\b\\\\\\c\\\\\\\\d\\\\\\\\\\e\\ '\\a\\\\b\\\\\\c\\\\\\\\d\\\\\\\\\\e\\ ",
          "a\\b\\c\\\\d\\\\e \\a\\b\\\\c\\\\d\\\\\\e\\ \\a\\\\b\\\\\\c\\\\\\\\d\\\\\\\\\\e\\ a\\b\\c\\\\d\\\\e "
        ],
        [
          "printf %s \\\"\\$\\`\\\\\\\"\\r\\n",
          "printf", "%s", "\"$`\\\"rn"
        ],
        [
          "printf %s \"\\\"\\$\\`\\\\\\\"\\r\\n\"",
          "printf", "%s", "\"$`\\\"\\r\\n"
        ]
      ].map((strs) => {
        const [cmdline, ...expected] = strs
        expect(Shellwords.split(cmdline)).to.deep.equal(expected)
      })
    })

    it("splits normal words", () => {
      const results = Shellwords.split("foo bar baz");
      expect(results).to.deep.equal(["foo", "bar", "baz"]);
    });

    it("splits single quoted phrases", () => {
      const results = Shellwords.split("foo 'bar baz'");
      expect(results).to.deep.equal(["foo", "bar baz"]);
    });

    it("splits double quoted phrases", () => {
      const results = Shellwords.split(`"foo bar" baz`);
      expect(results).to.deep.equal(["foo bar", "baz"]);
    });

    it("respects escaped characters", () => {
      const results = Shellwords.split("foo\\ bar baz");
      expect(results).to.deep.equal(["foo bar", "baz"]);
    });

    it("respects escaped characters within single quotes", () => {
      const results = Shellwords.split("foo 'bar\\ baz'");
      expect(results).to.deep.equal(["foo", "bar\\ baz"]);
    });

    it("respects escaped characters within double quotes", () => {
      const results = Shellwords.split(`foo "bar\\ baz"`);
      expect(results).to.deep.equal(["foo", "bar\\ baz"]);
    });

    it("respects escaped quotes within quotes", () => {
      let results = Shellwords.split(`foo "bar\\" baz"`);
      expect(results).to.deep.equal(["foo", "bar\" baz"]);

      results = Shellwords.split(`foo "bar\' baz"`);
      expect(results).to.deep.equal(["foo", "bar' baz"]);

      results = Shellwords.split(`foo "bar\\' baz"`);
      expect(results).to.deep.equal(["foo", "bar\\' baz"]);
    });

    it("throws on unmatched quotes", () => {
      expect(() => Shellwords.split(`foo "bar baz`)).to.throw("Unmatched quote");
      expect(() => Shellwords.split("foo 'bar baz")).to.throw("Unmatched quote");
      expect(() => Shellwords.split("one '\"\"\"")).to.throw("Unmatched quote");
    });

    it("runs callback() on each token when provided", () => {
      const tokens: string[] = [];

      function callback(token: string) {
        tokens.push(token);
      }

      Shellwords.split(`foo "bar' baz" quu a\\ and\\ b`, callback);
      expect(tokens).to.deep.equal(["foo ", `"bar' baz" `, "quu ", "a\\ and\\ b"]);
    });

    it("runs callback() when a command has no arguments", () => {
      const tokens: string[] = [];

      function callback(token: string) {
        tokens.push(token);
      }

      Shellwords.split("a\\ and\\ b", callback);
      expect(tokens).to.deep.equal(["a\\ and\\ b"]);
    });
  });

  describe("#escape", () => {
    it("escapes empty", () => {
      expect(Shellwords.escape("")).to.equal("''")
    });

    it("escapes a string to be safe for shell command line", () => {
      const results = Shellwords.escape("foo '\"' bar");
      expect(results).to.equal("foo\\ \\'\\\"\\'\\ bar");
    });

    it("dummy escapes any multibyte chars", () => {
      const results = Shellwords.escape("あい");
      expect(results).to.equal("\\あ\\い");
    });
  });

  describe("#join", () => {
    it("plain args", () => {
      expect(Shellwords.join(["a", "b", "c"])).to.equal("a b c");
    });

    it("args with spaces", () => {
      expect(Shellwords.join(["find", "/users/my user",])).to.equal("find /users/my\\ user");
      expect(Shellwords.join(["find", "~/Library/Application Support", "-name", "*.plist"])).to.equal("find \\~/Library/Application\\ Support -name \\*.plist");
    });

    it("args with quotes", () => {
      expect(Shellwords.join(["echo", `"hi" there`])).to.equal("echo \\\"hi\\\"\\ there");
    });
  });

  it("handles whitespace", () => {
    const empty   = "";
    const space   = " ";
    const newline = "\n";
    const tab     = "\t";

    const tokens = [
      empty,
      space,
      space + space,
      newline,
      newline + newline,
      tab,
      tab + tab,
      empty,
      space + newline + tab,
      empty
    ]

    for (const token of tokens) {
      expect(Shellwords.split(Shellwords.escape(token))).to.deep.equal([token])
    }

    expect(Shellwords.split(Shellwords.join(tokens))).to.deep.equal(tokens)
  });
});
