import React from "react";
import { NumberFormat, DateFormat, Trans, withI18n } from "@lingui/react"
import { plural } from "@lingui/macro"

const App = ({ i18n }) => {
  return (
    <div>
      <div>
        <NumberFormat value={1_000_000} format={{ currency: "EUR" }} />
      </div>
      <div>
        <DateFormat value={new Date()} format={{ hour12: true }} />
      </div>
      <Trans>Component to replace</Trans>
      {/* TODO: if there isn't any with children we should keep lingui/react  */}
      <Trans id="msg.id" />
      {plural({ value, one: "# book", other: "# books" })}
      {i18n._(t`some_string`)}
      {i18n._(plural({ value, one: "# book", other: "# books" }))}
      {i18n._(select({ value, one: "# book", other: "# books" }))}
      {i18n._(selectOrdinal({ value, one: "# book", other: "# books" }))}
    </div>
  )
}

export default withI18n()(App)
