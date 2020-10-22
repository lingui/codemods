import React from "react";
import { DateFormat, NumberFormat } from "@lingui/react";

const GLOBAL_VALUE = new Date();
const App = () => {
  return (
    <div>
      <DateFormat value={new Date()} format={{ hour12: true }} />
      <DateFormat value={new Date()} />
      <DateFormat value={GLOBAL_VALUE} />
      <DateFormat value={"10/01/2015"} />
      <NumberFormat value={10} format={{
        style: "currency",
        maximumFractionDigits: 2
      }} />
    </div>
  );
}