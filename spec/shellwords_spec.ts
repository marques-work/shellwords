import {expect} from "chai";
import Shellwords from "../src/shellwords";

describe("Shellwords", () => {
  describe("#split", () => {
    it("splits normal words", () => {
      const results = Shellwords.split("foo bar baz");
      expect(results).to.deep.equal(["foo", "bar", "baz"]);
    });

    it("splits single quoted phrases", () => {
      const results = Shellwords.split("foo 'bar baz'");
      expect(results).to.deep.equal(["foo", "bar baz"]);
    });

    it("splits double quoted phrases", () => {
      const results = Shellwords.split('"foo bar" baz');
      expect(results).to.deep.equal(["foo bar", "baz"]);
    });

    it("respects escaped characters", () => {
      const results = Shellwords.split("foo\\ bar baz");
      expect(results).to.deep.equal(["foo bar", "baz"]);
    });

    it("respects escaped characters within single quotes", () => {
      const results = Shellwords.split("foo 'bar\\ baz'");
      expect(results).to.deep.equal(["foo", "bar baz"]);
    });

    it("respects escaped characters within double quotes", () => {
      const results = Shellwords.split('foo "bar\\ baz"');
      expect(results).to.deep.equal(["foo", "bar baz"]);
    });

    it("respects escaped quotes within quotes", () => {
      let results = Shellwords.split('foo "bar\\" baz"');
      expect(results).to.deep.equal(['foo', 'bar" baz']);

      results = Shellwords.split(`foo "bar' baz"`);
      expect(results).to.deep.equal(["foo", "bar' baz"]);

      results = Shellwords.split(`foo "bar\\' baz"`);
      expect(results).to.deep.equal(["foo", "bar' baz"]);
    });

    it("throws on unmatched single quotes", () => {
      expect(() => Shellwords.split("foo 'bar baz")).to.throw();
    });

    it("throws on unmatched double quotes", () => {
      expect(() => Shellwords.split('foo "bar baz')).to.throw();
    });
  });

  describe("#escape", () => {
    it("escapes a string to be safe for shell command line", () => {
      const results = Shellwords.escape("foo '\"' bar");
      expect(results).to.equal("foo\\ \\'\\\"\\'\\ bar");
    });

    it("dummy escapes any multibyte chars", () => {
      const results = Shellwords.escape("あい");
      expect(results).to.equal("\\あ\\い");
    });
  });
});
