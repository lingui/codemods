import { Transform, JSCodeshift, Collection } from "jscodeshift";

const transform: Transform = (fileInfo, api) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  renameDefaultRenderToDefaultComponent(root, j)
  pluralPropsChanges(root, j)
  changeReactImportToNewImports(root, j)
  removeMacroWrap(root, j)
  // changeToCoreDeprecatedFuncs(root)
  // replaceDeprecatedMethodsToMacros(root)

  return root.toSource();
};

export default transform;

/**
 * NumberFormat and DateFormat components were removed.
 * Use date and number formats from @lingui/core package instead.
*/
function changeToCoreDeprecatedFuncs(root: Collection  , j: JSCodeshift) {
}

/**
 *  Change import of components to macro from react package
 * - Trans -> Trans to `@lingui/@macro`
 * - NumberFormat -> number to `@lingui/@core`
 * - DateFormat -> date to `@lingui/@core`
*/
function changeReactImportToNewImports(root: Collection  , j: JSCodeshift) {
  const linguiReactImports = root.find(j.ImportDeclaration, {
    source: {
      value: "@lingui/react"
    }
  });

  migrateTo(root, linguiReactImports, j, "Trans", "Trans", "@lingui/macro");
  migrateTo(root, linguiReactImports, j, "NumberFormat", "number", "@lingui/core");
  migrateTo(root, linguiReactImports, j, "DateFormat", "date", "@lingui/core");
}

/**
 * Function to migrate deprecated imports
 * @param root Collection<any>
 * @param linguiReactImports all `@lingui/react` imports
 * @param j JSCodeshift
 * @param lookupImport old import name, for ex: "Plural"
 * @param newLookupImport new import name, for ex: "plural"
 * @param newPackageName package to move the import, for ex: `"@lingui/macro"`
 * This example will result in
 * - import { Plural } from `"@lingui/react"`
 * + import { plural } from `"@lingui/macro"`
 */
function migrateTo(root, linguiReactImports, j, lookupImport, newLookupImport, newPackageName) {
  const imports = root.find(j.ImportDeclaration, {
    source: {
      value: newPackageName
    }
  });
  linguiReactImports.forEach((path) => {
    const node = path.value;
    const transImportIndex = node.specifiers.findIndex((el) => el.imported.name === lookupImport);

    if (transImportIndex !== -1) {
      // if trans import is not imported we ignore so, beucase isn't not used
      if (node.specifiers.length > 1) {
        // if trans is imported we have to remove it from here and add it to @lingui/macro import
        node.specifiers.splice(transImportIndex, 1);
      } else {
        linguiReactImports.remove();
      }

      // we check if the lingui macro import is already present, because if it's already present we just have to push to that import
      if (imports.paths().length > 0) {
        imports.forEach((path) => {
          path.value.specifiers.push(j.importSpecifier(j.identifier(newLookupImport)));
        });
      } else {
        linguiReactImports.insertAfter(
          j.importDeclaration([j.importSpecifier(j.identifier(newLookupImport))], j.stringLiteral(newPackageName), "value")
        );
      }
    }
  });

  return root;
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
function replaceDeprecatedMethodsToMacros(root  , j: JSCodeshift) {
}

/**
 *  Rename I18nProvider.defaultRender prop to I18nProvider.defaultComponent
 */
function renameDefaultRenderToDefaultComponent(root  , j: JSCodeshift) {
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
function removeMacroWrap(root  , j: JSCodeshift) {
  return root
  .find(j.CallExpression, {
    arguments: [
      {
        tag: {
          name: "t"
        }
      }
    ],
    callee: {
      object: {
        name: "i18n"
      },
      property: {
        name: "_"
      }
    }
  })
  .replaceWith((nodePath) => {
    const { node } = nodePath;
    return node.arguments;
  })
}