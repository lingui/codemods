/** This file has some functions that aren't used by could be used in the future */

/** Change JSX Elements to simple functions
 * <Jsx value="hola" _1="hola" /> -> jsx(value, { _1: "hola" })
 */
function changeJsxPluralToMacro(root, j) {
  [
    {
      component: 'Plural',
      macro: 'plural',
    },
    {
      component: 'Select',
      macro: 'select',
    },
    {
      component: 'SelectOrdinal',
      macro: 'selectOrdinal',
    },
  ].forEach((mapper) => {
    root
    .find(j.JSXElement, {
      openingElement: { name: { name: mapper.component } }
    })
    .replaceWith((path) => {
      const Node = path.value;

      const valueProp = Node.openingElement.attributes.filter(
        (obj) => obj.name.name === "value"
      )[0];
      const propsToObject = j.objectExpression(
        Node.openingElement.attributes
        .filter(el => el.name.name !== "value")
        .map(
          (obj) => j.property(
            "init",
            j.identifier(obj.name.name),
            j.literal(obj.value.value)
          )
        )
      )

      let ast = null;
      // format options are not required so
      if (!propsToObject.properties.length) {
        ast = j.callExpression(j.identifier(mapper.macro), [
          valueProp.value.expression,
        ]);
      } else {
        ast = j.callExpression(j.identifier(mapper.macro), [
          valueProp.value.expression,
          propsToObject
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