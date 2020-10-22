import React from "react";
import { date } from "@lingui/core";

const App = () => {
  return (
    <div>
      {date(new Date(), { hour12: true })}
    </div>
  );
}
