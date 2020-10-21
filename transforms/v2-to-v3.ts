import { Transform } from "jscodeshift";

const transform: Transform = (fileInfo, api) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  renameDefaultRenderToDefaultComponent(root, j)
  pluralPropsChanges(root, j)
  // changeReactImportToMacro(root, j)
  // changeToCoreDeprecatedFuncs(root)
  // replaceDeprecatedMethodsToMacros(root)
  // removeMacroWrap(root)

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
function changeReactImportToMacro(root, j) {
}

/**
 *  plural parameters changed:
 * - plural({ value, one: "# book", other: "# books" })
 * + plural(value, { one: "# book", other: "# books" })
*/
function pluralPropsChanges(root, j) {
  return root.find(j.CallExpression, {
  	callee: {
      name: "plural"
    }
  }).forEach(element => {
    if (element.node.arguments.length === 1) {
      element.node.arguments[0].properties.map((node, index) => {
        if (node.key.name === "value") {
          element.node.arguments[0].properties.splice(index, 1)
          element.node.arguments.unshift(node.value)
        }
      });
    }
  })
}

/**
 *  i18n.t(), i18n.plural(), i18n.select() and i18n.selectOrdinal()
 *  methods are removed and replaced with macros.
 */
function replaceDeprecatedMethodsToMacros(root) {
}

/**
 *  Rename I18nProvider.defaultRender prop to I18nProvider.defaultComponent
 */
function renameDefaultRenderToDefaultComponent(root, j) {
  return root.find(j.JSXElement, {
      openingElement: { name: { name: "I18nProvider" } }
   }).forEach(path => {
    const Node = path.value;

    Node.openingElement.attributes
    .filter(obj => obj.name.name === "defaultRender")
    .forEach(item => {
      item.name.name = "defaultComponent";
    });
  })
}

/**
 *  Macros don't need to be wrapped inside i18n._: i18n._(t'Message') => t'Message'
 */
function removeMacroWrap(root) {

}