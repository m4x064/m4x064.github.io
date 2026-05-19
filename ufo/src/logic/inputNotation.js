(() => {
  "use strict";

  /**
   * Math Flight answer input notation.
   *
   * Raw input examples:
   * - p -> pi
   * - r23\ -> sqrt(23)
   * - r23+4\ -> sqrt(23+4)
   *
   * The parser-facing display keeps parentheses explicit. The visual display can
   * hide closed root parentheses and let CSS draw the radical bar.
   */

  function normalizeToken(token) {
    const replacements = {
      "Ｐ": "p",
      "ｐ": "p",
      "π": "p",
      "Π": "p",
      "√": "r",
      "Ｒ": "r",
      "ｒ": "r",
      "＼": "\\",
      "＋": "+",
      "－": "-",
      "−": "-",
      "＊": "*",
      "×": "×",
      "÷": "÷",
      "／": "/",
      "．": ".",
      "（": "(",
      "）": ")",
    };
    const value = replacements[token] || token;

    if (/^[0-9+\-*/×÷/.()\\exypr]$/i.test(value)) {
      return value.length === 1 ? value.toLowerCase() : value;
    }

    return "";
  }

  function formatRawInput(rawInput) {
    return formatWithOptions(rawInput, { rootParentheses: "display" });
  }

  function formatForParsing(rawInput) {
    return formatWithOptions(rawInput, { rootParentheses: "always" });
  }

  function formatWithOptions(rawInput, { rootParentheses }) {
    const source = String(rawInput || "");
    let pretty = "";
    let rootBuffer = null;

    const appendToken = (token) => {
      if (rootBuffer !== null) {
        rootBuffer += token;
        return;
      }
      pretty += token;
    };

    const flushRoot = (closed = true) => {
      if (rootBuffer === null) {
        return;
      }
      pretty += formatRoot(rootBuffer, closed, rootParentheses);
      rootBuffer = null;
    };

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];

      if (char === "√") {
        flushRoot(true);
        if (source[index + 1] === "(") {
          rootBuffer = "";
          index += 1;
          continue;
        }

        rootBuffer = "";
        continue;
      }

      const normalized = normalizeToken(char) || char;

      if (normalized === "p") {
        appendToken("π");
        continue;
      }

      if (normalized === "r") {
        flushRoot(true);
        rootBuffer = "";
        continue;
      }

      if (normalized === "\\") {
        flushRoot(true);
        continue;
      }

      if (normalized === ")" && rootBuffer !== null) {
        flushRoot(true);
        continue;
      }

      appendToken(normalized);
    }

    flushRoot(rootParentheses === "always");
    return pretty;
  }

  function formatRoot(content, closed, rootParentheses) {
    if (content === "") {
      return closed ? "√" : "√(";
    }

    if (rootParentheses === "always") {
      return `√(${content}${closed ? ")" : ""}`;
    }

    if (!closed) {
      return `√(${content}`;
    }

    return `√${content}`;
  }

  function createDisplayParts(rawInput) {
    const source = String(rawInput || "");
    const parts = [];
    let rootBuffer = null;
    let textBuffer = "";

    const appendText = (text) => {
      if (rootBuffer !== null) {
        rootBuffer += text;
        return;
      }
      textBuffer += text;
    };

    const flushText = () => {
      if (textBuffer === "") {
        return;
      }
      parts.push({ type: "text", text: textBuffer });
      textBuffer = "";
    };

    const flushRoot = (closed) => {
      if (rootBuffer === null) {
        return;
      }
      parts.push({ type: "root", text: rootBuffer, closed });
      rootBuffer = null;
    };

    const startRoot = () => {
      flushRoot(true);
      flushText();
      rootBuffer = "";
    };

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];

      if (char === "√") {
        startRoot();
        if (source[index + 1] === "(") {
          index += 1;
        }
        continue;
      }

      const normalized = normalizeToken(char) || char;

      if (normalized === "p") {
        appendText("π");
        continue;
      }

      if (normalized === "r") {
        startRoot();
        continue;
      }

      if (normalized === "\\") {
        flushRoot(true);
        continue;
      }

      if (normalized === ")" && rootBuffer !== null) {
        flushRoot(true);
        continue;
      }

      appendText(normalized);
    }

    flushRoot(false);
    flushText();
    return parts;
  }

  window.MathFitInputNotation = {
    normalizeToken,
    formatRawInput,
    formatForParsing,
    createDisplayParts,
  };
})();
