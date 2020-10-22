import { defineTest } from "jscodeshift/dist/testUtils";

describe("plural transform", () => {
  defineTest(
    __dirname,
    "v2-to-v3",
    null,
    "v2-to-v3/plural",
  );
});

describe("i18nProvider transform", () => {
  defineTest(
    __dirname,
    "v2-to-v3",
    null,
    "v2-to-v3/i18nProvider",
  );
});

describe("Deprecated methods inside @lingui/react moved to @core and @macro transform imports", () => {
  defineTest(
    __dirname,
    "v2-to-v3",
    null,
    "v2-to-v3/changeReactImportNewImports",
  );
});


describe("i18n._(t``) is not required, use intead simply t``", () => {
  defineTest(
    __dirname,
    "v2-to-v3",
    null,
    "v2-to-v3/macroWrap",
  );
});

describe("Deprecated methods from @lingui/react transform the JSX", () => {
  defineTest(
    __dirname,
    "v2-to-v3",
    null,
    "v2-to-v3/jsxTransformMacros",
  );
});