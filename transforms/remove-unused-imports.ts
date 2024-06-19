import { Transform, ASTPath, ImportDeclaration } from "jscodeshift";

const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const filterAndTransformRequires = (path: ASTPath<ImportDeclaration>) => {
    const specifiers = path.value.specifiers;
    const parentScope = j(path).closestScope();
    return (
      specifiers.filter((importPath) => {
        const varName = importPath.local.name;
        const requireName =
          importPath.type === "ImportSpecifier"
            ? importPath.imported.name
            : importPath.local.name;
        const scopeNode = path.scope.node;

        // We need this to make sure the JSX transform can use `React`
        if (requireName === "React") {
          return false;
        }

        // console.debug("parsing require named ", requireName);
        // Remove required vars that aren't used.
        const identifierUsages = parentScope
          .find(j.Identifier, { name: varName })
          // Ignore require vars
          .filter(
            (identifierPath) => identifierPath.parentPath.value !== importPath,
          );
        const decoratorUsages = parentScope
          .find(j.ClassDeclaration)
          .filter((it: any) => {
            return (
              (it.value.decorators || []).filter(
                (decorator: any) => decorator.expression.name === varName,
              ).length > 0
            );
          });

        if (!identifierUsages.size() && !decoratorUsages.size()) {
          path.value.specifiers = path.value.specifiers.filter(
            (it) => (it === importPath) === false,
          );
          if (path.value.specifiers.length === 0) {
            j(path).remove();
          }
          return true;
        }
      }).length > 0
    );
  };

  const didTransform =
    root.find(j.ImportDeclaration).filter(filterAndTransformRequires).size() >
    0;

  return didTransform ? root.toSource(options.printOptions) : null;
};

export default transform;
