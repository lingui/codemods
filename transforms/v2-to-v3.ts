import { Transform, JSCodeshift, Collection } from "jscodeshift";

const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  renameDefaultRenderToDefaultComponent(root, j)
  removeMacroWrap(root, j)
  changeReactImportToNewImports(root, j)
  changeJsxToCoreDeprecatedFuncs(root, j)
  changeFromMacroToCore(root, j)
  pluralPropsChanges(root, j)
  tWithIdPropsChanges(root, j)

  return root.toSource(options.printOptions);
};

export default transform;

/**
 * NumberFormat and DateFormat components were removed.
 * Use date and number formats from @lingui/core package instead.
 * JSX transform
*/
function changeJsxToCoreDeprecatedFuncs(root, j: JSCodeshift) {
  [
    {
      component: "DateFormat",
      macro: "i18n.date"
    },
    {
      component: "NumberFormat",
      macro: "i18n.number"
    }
  ].forEach(mapper => {
    root
    .find(j.JSXElement, {
      openingElement: { name: { name: mapper.component } }
    })
    .replaceWith((path) => {
      const Node = path.value;

      const valueProp = Node.openingElement.attributes.filter(
        (obj) => obj.name.name === "value"
      )[0];
      const formatProp = Node.openingElement.attributes.filter(
        (obj) => obj.name.name === "format"
      );

      let ast = null;
      // format options are not required so
      if (!formatProp.length) {
        ast = j.callExpression(j.identifier(mapper.macro), [
          valueProp.value.expression,
        ]);
      } else {
        ast = j.callExpression(j.identifier(mapper.macro), [
          valueProp.value.expression,
          formatProp[0].value.expression
        ]);
      }

      // if someone uses the components inside ternaries we can't add {number()}, must be just number()
      if (path.parentPath.value.type === "ConditionalExpression" || path.parentPath.value.type === "VariableDeclarator") {
        return ast
      }

      // if is a direct return, just add parenthesis
      if (path.parentPath.value.type === "ReturnStatement") {
        return j.parenthesizedExpression(ast);
      }

      // if not, just add {}
      return j.jsxExpressionContainer(ast);
    });
  })

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

  migrateTo(root, linguiReactImports, j, "Plural", "Plural", "@lingui/macro");
  migrateTo(root, linguiReactImports, j, "Select", "Select", "@lingui/macro");
  migrateTo(root, linguiReactImports, j, "SelectOrdinal", "SelectOrdinal", "@lingui/macro");
  migrateTo(root, linguiReactImports, j, "Trans", "Trans", "@lingui/macro");

  migrateTo(root, linguiReactImports, j, "NumberFormat", "i18n", "@lingui/core");
  migrateTo(root, linguiReactImports, j, "DateFormat", "i18n", "@lingui/core");
}

/**
 *  Change import of components to macro from react package
 * - { date } from `@lingui/macro` -> { date } from `@lingui/@core`
*/
function changeFromMacroToCore(root: Collection  , j: JSCodeshift) {
  const linguiMacroImports = root.find(j.ImportDeclaration, {
    source: {
      value: "@lingui/macro"
    }
  });

  migrateTo(root, linguiMacroImports, j, "number", "number", "@lingui/core");
  migrateTo(root, linguiMacroImports, j, "date", "i18n", "@lingui/core");
  migrateTo(root, linguiMacroImports, j, "NumberFormat", "i18n", "@lingui/core");
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
  const FIRST_IMPORT = root.find(j.ImportDeclaration).at(0);

  const imports = root.find(j.ImportDeclaration, {
    source: {
      value: newPackageName
    }
  });

  linguiReactImports.forEach((path) => {
    const node = path.value;
    if (!node) return;
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
          const foundIndex = path.value.specifiers.findIndex(x => x.imported.name === newLookupImport);
          if (foundIndex === -1) {
            path.value.specifiers.push(j.importSpecifier(j.identifier(newLookupImport)));
          }
        });
      } else {
        FIRST_IMPORT.insertAfter(
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
 * Macros don't need to be wrapped inside i18n._: i18n._(t'Message') => t'Message'
 * i18n._(t``), i18n._(plural``), i18n._(select``) and i18n._(selectOrdinal``)
 */
function removeMacroWrap(root, j: JSCodeshift) {
  return root
    .find(j.CallExpression, {
      // if we want to filter by the argument...
      // arguments: [
      //   {
      //     tag: {
      //       name: "t"
      //     }
      //   }
      // ],
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

/**
 * t arguments changed. Id needs to be passed as a part of an object.
 * t('id')'Message') => t({ id: 'id', message: `Message` })
 * No attempts are made to convert template literal into a regular string; this
 * is a project-specific codestyle rule that should be fixed with Prettier or
 * eslint.
 */
function tWithIdPropsChanges(root, j: JSCodeshift) {
  const objectProperty = (key: string, value) => 
    j.property('init', j.identifier(key), value);

  return root
    .find(j.TaggedTemplateExpression)
    .filter(item => {
      const hasId = item.get('tag', 'callee', 'name').value === 't'
      const hasComments = (item.get('leadingComments', '0', 'value').value || '').startsWith('*i18n:');
      return hasId || hasComments;
    })
    .replaceWith(nodePath => {
    const id = nodePath.get('tag', 'arguments', '0', 'value').value;
      const message = nodePath.get('quasi').value;
      const comment = nodePath.get('leadingComments', '0', 'value').value;

      const properties = [objectProperty('message', message)];
    
      if (id) {
        properties.unshift(objectProperty('id', j.literal(id)));
      }
    
      if (comment) {
        properties.push(
          objectProperty('comment', j.literal(comment.replace(/^\*i18n:\s?/, '')))
        );
      }
    
      return j.callExpression(j.identifier('t'), [j.objectExpression(properties)]);
    })
    .toSource();
}
