import React from "react";
import { I18nProvider } from "@lingui/react"

export const App = () => {
  return (
    <I18nProvider defaultRender="p">
      <div>hola</div>
    </I18nProvider>
  );
}