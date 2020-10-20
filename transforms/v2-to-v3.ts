import { Transform } from "jscodeshift";

const transform: Transform = (fileInfo, api) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  changeToCoreDeprecatedFuncs(root)
  changeReactImportToMacro(root)
  pluralPropsChanges(root)
  replaceDeprecatedMethodsToMacros(root)

  return root.toSource();
};

export default transform;

/**
 * NumberFormat and DateFormat components were removed.
 * Use date and number formats from @lingui/core package instead.
*/
function changeToCoreDeprecatedFuncs(root) {
}

/**
 *  Change import of components to macro from react package
*/
function changeReactImportToMacro(root) {
}

/**
 *  plural parameters changed:
 * - plural({ value, one: "# book", other: "# books" })
 * + plural(value, { one: "# book", other: "# books" })
*/
function pluralPropsChanges(root) {
}

/**
 *  i18n.t(), i18n.plural(), i18n.select() and i18n.selectOrdinal()
 *  methods are removed and replaced with macros.
 */
function replaceDeprecatedMethodsToMacros(root) {
}