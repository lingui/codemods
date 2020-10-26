import { React, core } from "react";
import { date, number } from "@lingui/core";
import { t } from "@lingui/macro";

export default () => {
  const [gi, setgi] = React.useState(false)
  return (
    <>
      {t`Some example`}
      {date(new Date())}
      <div>hola</div>
    </>
  )
}