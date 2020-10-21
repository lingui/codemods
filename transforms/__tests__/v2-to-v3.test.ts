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