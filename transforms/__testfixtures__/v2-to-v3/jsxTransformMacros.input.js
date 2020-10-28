import React from "react";
import { DateFormat, NumberFormat, Plural, SelectOrdinal, Select } from "@lingui/react";

const GLOBAL_VALUE = new Date();

const App = () => {
  const count = 1;
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
      {true ? (
        <NumberFormat value={10} format={{
          style: "currency",
          maximumFractionDigits: 2
        }} />
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
    </div>
  );
}

const formatfValue = (value) => {
  return (
    <NumberFormat value={10} format={{ style: "currency", maximumFractionDigits: 2 }} />
  )
};

const formatAssetValue = (value) => {
  if (value !== null) {
    const formatValue = <NumberFormat value={value} format={{style: "percent", minimumFractionDigits: 2 }} />;
    return formatValue;
  }
  return "-";
};