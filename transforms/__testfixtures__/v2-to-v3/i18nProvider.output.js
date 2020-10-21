import React from "react";
import { I18nProvider } from "@lingui/react"

export const App = () => {
  return (
    <I18nProvider defaultComponent="p">
      <div>hola</div>
    </I18nProvider>
  );
}