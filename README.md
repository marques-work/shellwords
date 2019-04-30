# Shellwords-TS

Typescript port of [shellwords](https://github.com/jimmycuadra/shellwords). Shellwords provides functions to manipulate strings according to the word parsing rules of the UNIX Bourne shell. It is based on [the Ruby module of the same name](http://www.ruby-doc.org/stdlib-1.9.3/libdoc/shellwords/rdoc/Shellwords.html).

## Installation

Add "shellwords-ts" to your `package.json` file and run `npm install`.

## Example

```javascript
import Shellwords from "shellwords-ts";

Shellwords.split("foo 'bar baz'"); // ["foo", "bar baz"]
Shellwords.escape("What's up?"); // 'What\\\'s\\ up\\?'

Shellwords.split("foo 'bar baz' quu", (rawPart) => {
  // have access to the chunks of the raw string as it is scanned
});
```
