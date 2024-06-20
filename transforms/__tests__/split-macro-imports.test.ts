import { defineInlineTest } from "jscodeshift/dist/testUtils";
import transformer from "../split-macro-imports";

describe("basic", () => {
  defineInlineTest(
    transformer,
    {},
    `
import {
  // core
  t,
  plural,
  selectOrdinal,
  select,
  defineMessage,
  msg,
  // react
  Trans,
  Plural,
  SelectOrdinal,
  Select,
  useLingui,
} from "@lingui/macro";
`,
    `
import { Trans, Plural, SelectOrdinal, Select, useLingui } from "@lingui/react/macro";
import { t, plural, selectOrdinal, select, defineMessage, msg } from "@lingui/core/macro";
`,
  );
});

describe("Local identifiers are renamed", () => {
  defineInlineTest(
    transformer,
    {},
    `import { t as _t, Trans as _Trans } from '@lingui/macro';`,
    `
import { Trans as _Trans } from "@lingui/react/macro";
import { t as _t } from "@lingui/core/macro";
`,
  );
});

describe("Multiple imports", () => {
  defineInlineTest(
    transformer,
    {},
    `
import { t, Trans } from '@lingui/macro';
import { plural, Plural } from '@lingui/macro';
`,
    `
import { Trans, Plural } from "@lingui/react/macro";
import { t, plural } from "@lingui/core/macro";
`,
  );
});

describe("Existing imports", () => {
  defineInlineTest(
    transformer,
    {},
    `
import { useLingui } from '@lingui/react/macro';
import { t, Trans } from '@lingui/macro';
`,
    `
import { t } from "@lingui/core/macro";
import { useLingui, Trans } from '@lingui/react/macro';
`,
  );
});
