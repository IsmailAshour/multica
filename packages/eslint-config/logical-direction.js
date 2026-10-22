// Physical Tailwind utilities (`ml-2`, `left-0`, `text-right`) do not mirror
// under `dir="rtl"`; their logical forms (`ms-2`, `start-0`, `text-end`) render
// identically in LTR and flip in RTL. See "RTL in code" in
// apps/docs/content/docs/developers/conventions.mdx.

const LOGICAL = {
  ml: "ms",
  mr: "me",
  pl: "ps",
  pr: "pe",
  "scroll-ml": "scroll-ms",
  "scroll-mr": "scroll-me",
  "scroll-pl": "scroll-ps",
  "scroll-pr": "scroll-pe",
  left: "start",
  right: "end",
  "border-l": "border-s",
  "border-r": "border-e",
  "rounded-l": "rounded-s",
  "rounded-r": "rounded-e",
  "rounded-tl": "rounded-ss",
  "rounded-tr": "rounded-se",
  "rounded-bl": "rounded-es",
  "rounded-br": "rounded-ee",
  "text-left": "text-start",
  "text-right": "text-end",
  "float-left": "float-start",
  "float-right": "float-end",
};

// Spacing and inset utilities only count with a value, so `left` / `right`
// words and keys such as `left-panel` are not utilities.
const SPACED = /^(-?)(scroll-[mp][lr]|[mp][lr]|left|right)-(\d|\[|\(|px$|auto$|full$)/;
const EDGED = /^(border-[lr]|rounded-[tb]?[lr])(?:-|$)/;
const WHOLE = /^(text-left|text-right|float-left|float-right)$/;

// Utility part of a class: the text after the last variant colon outside
// brackets, without the `!` important modifier.
function utilityOf(token) {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    const c = token[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) start = i + 1;
  }
  return token.slice(start).replace(/^!|!$/g, "");
}

export function findPhysicalClasses(value) {
  const tokens = value.split(/\s+/).filter(Boolean);
  // `left-1/2 -translate-x-1/2` centers an element and is direction-neutral.
  const centered = tokens.some((t) => /(^|:)!?-translate-x-1\/2!?$/.test(t));
  const found = [];
  for (const token of tokens) {
    const utility = utilityOf(token);
    if (centered && /^-?left-1\/2$/.test(utility)) continue;
    const match =
      utility.match(SPACED) ?? utility.match(EDGED) ?? utility.match(WHOLE);
    if (!match) continue;
    const prefix = utility.match(SPACED) ? match[2] : match[1];
    found.push({ token, logical: LOGICAL[prefix] });
  }
  return found;
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: { description: "Use logical Tailwind utilities so layouts mirror in RTL." },
    messages: {
      physical: "`{{token}}` does not mirror in RTL; use the `{{logical}}` form instead.",
    },
    schema: [],
  },
  create(context) {
    const check = (node, value) => {
      for (const { token, logical } of findPhysicalClasses(value)) {
        context.report({ node, messageId: "physical", data: { token, logical } });
      }
    };
    return {
      Literal(node) {
        if (typeof node.value === "string") check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.raw);
      },
    };
  },
};

export default {
  meta: { name: "multica-logical-direction" },
  rules: { "logical-direction": rule },
};
