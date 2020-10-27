import React from "react";
import { i18n } from "@lingui/core";

const GLOBAL_VALUE = new Date();

const App = () => {
  return (
    <div>
      {i18n.date(new Date(), { hour12: true })}
      {i18n.date(new Date())}
      {i18n.date(GLOBAL_VALUE)}
      {i18n.date("10/01/2015")}
      {i18n.number(10, {
        style: "currency",
        maximumFractionDigits: 2
      })}
      {true ? (
        i18n.number(10, {
          style: "currency",
          maximumFractionDigits: 2
        })
      ) : false}
    </div>
  );
}

const formatfValue = (value) => {
  return (i18n.number(10, { style: "currency", maximumFractionDigits: 2 }));
};

const formatAssetValue = (value) => {
  if (value !== null) {
    const formatValue = i18n.number(value, {style: "percent", minimumFractionDigits: 2 });
    return formatValue;
  }
  return "-";
};