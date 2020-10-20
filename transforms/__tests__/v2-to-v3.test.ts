import { defineTest } from "jscodeshift/dist/testUtils";

describe("v2-to-v3", () => {
  defineTest(
    __dirname,
    "v2-to-v3",
    null,
    "v2-to-v3/basic",
  );
});