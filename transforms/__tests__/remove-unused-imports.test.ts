import { defineTest } from "jscodeshift/dist/testUtils";

describe("We remove all the unused imports", () => {
  defineTest(
    __dirname,
    "remove-unused-imports",
    null,
    "remove-unused-imports/remove-unused-imports",
  );
});