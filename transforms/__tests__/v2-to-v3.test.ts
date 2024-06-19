import { defineTest } from "jscodeshift/dist/testUtils";

describe("Plural props changed from an object, to a (value, object)", () => {
  defineTest(__dirname, "v2-to-v3", null, "v2-to-v3/plural");
});

describe("Plural props changed from an object, to a (value, object) Typescript", () => {
  defineTest(__dirname, "v2-to-v3", null, "v2-to-v3/plural-ts", {
    parser: "ts",
  });
});

describe("i18nProvider defaultRender to defaultComponent", () => {
  defineTest(__dirname, "v2-to-v3", null, "v2-to-v3/i18nProvider");
});

describe("Deprecated methods inside @lingui/react moved to @core and @macro transform imports", () => {
  defineTest(
    __dirname,
    "v2-to-v3",
    null,
    "v2-to-v3/changeReactImportNewImports",
  );
});

describe("i18n._(t`name`) is not required, use instead simply t`name`", () => {
  defineTest(__dirname, "v2-to-v3", null, "v2-to-v3/macroWrap");
});

describe("Deprecated methods from @lingui/react transform the JSX", () => {
  defineTest(__dirname, "v2-to-v3", null, "v2-to-v3/jsxTransformMacros");
});

describe("Move old macros methods to new core imports", () => {
  defineTest(__dirname, "v2-to-v3", null, "v2-to-v3/changeMacrosToCore");
});

describe("Complete example with all the past actions", () => {
  defineTest(__dirname, "v2-to-v3", null, "v2-to-v3/complete");
});

describe("t props changed from an argument, to an object", () => {
  defineTest(__dirname, "v2-to-v3", null, "v2-to-v3/t");
});
