import React from "react";
import { date } from "@lingui/core";

const GLOBAL_VALUE = new Date();
const App = () => {
  return (
    <div>
      {date(new Date(), { hour12: true })}
      {date(new Date())}
      {date(GLOBAL_VALUE)}
      {date("10/01/2015")}
    </div>
  );
}
