import React from "react";
import { DateFormat } from "@lingui/react";

const App = () => {
  return (
    <div>
      <DateFormat value={new Date()} format={{ hour12: true }} />
    </div>
  );
}