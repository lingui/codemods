import React from "react";
import { number, date } from "@lingui/core";
import { withI18n } from "@lingui/react";
import { plural, Trans } from "@lingui/macro";

const App = ({ i18n }) => {
  return (
    <div>
      <div>
        {number(1_000_000, { currency: "EUR" })}
      </div>
      <div>
        {date(new Date(), { hour12: true })}
      </div>
      <Trans>Component to replace</Trans>
      {/* TODO: if there isn't any with children we should keep lingui/react  */}
      <Trans id="msg.id" />
      {plural(value, {
        one: "# book",
        other: "# books"
      })}
      {t`some_string`}
      {plural(value, {
        one: "# book",
        other: "# books"
      })}
      {select({ value, one: "# book", other: "# books" })}
      {selectOrdinal({ value, one: "# book", other: "# books" })}
    </div>
  );
}

export default withI18n()(App)