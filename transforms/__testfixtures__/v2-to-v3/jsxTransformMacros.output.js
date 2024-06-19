import React from "react";
import { i18n } from "@lingui/core";
import { Plural, Select, SelectOrdinal } from "@lingui/macro";

const GLOBAL_VALUE = new Date();

const App = () => {
  const count = 1;
  return (
    (<div>
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
      <Plural
        id="string"
        value={100}
        offset="number | string"
        zero="ReactNode"
        one="ReactNode"
        two="ReactNode"
        few="ReactNode"
        many="ReactNode"
        other="ReactNode"
        _1="_1"
        _2="_2"
      />
      <SelectOrdinal
        value={count}
        one="#st"
        two="#nd"
        few="#rd"
        other="#th"
      />
      <Select
        value={count}
        male="His book"
        female="Her book"
        other="Their book"
      />
    </div>)
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
