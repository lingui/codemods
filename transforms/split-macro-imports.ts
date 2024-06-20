import { API, FileInfo, JSCodeshift, ImportSpecifier } from "jscodeshift";

// Define the sets of symbols for each new package
const coreMacroSymbols = new Set([
  "ChoiceOptions",
  "t",
  "plural",
  "selectOrdinal",
  "select",
  "defineMessage",
  "msg",
]);

const reactMacroSymbols = new Set([
  "Trans",
  "Plural",
  "SelectOrdinal",
  "Select",
  "useLingui",
]);

// Helper function to determine the new package for a symbol
const getNewPackageForSymbol = (symbol: string): string | null => {
  if (coreMacroSymbols.has(symbol)) return "@lingui/core/macro";
  if (reactMacroSymbols.has(symbol)) return "@lingui/react/macro";
  return null;
};

// Helper function to add or amend an import specifier
const addOrAmendImport = (
  j: JSCodeshift,
  root: ReturnType<typeof j>,
  packageName: string,
  specifier: ImportSpecifier,
) => {
  const existingImport = root.find(j.ImportDeclaration, {
    source: { value: packageName },
  });

  if (existingImport.size() === 0) {
    root
      .get()
      .node.program.body.unshift(
        j.importDeclaration([specifier], j.literal(packageName)),
      );
  } else {
    existingImport.get().node.specifiers.push(specifier);
  }
};

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find existing imports from '@lingui/macro'
  const importedDeclarations = root.find(j.ImportDeclaration, {
    source: { value: "@lingui/macro" },
  });

  if (importedDeclarations.size() === 0) {
    return file.source; // No changes needed if there's no import from '@lingui/macro'
  }

  // Process each import declaration
  importedDeclarations.forEach((path) => {
    const importDecl = path.value;

    if (importDecl.specifiers && importDecl.specifiers.length) {
      importDecl.specifiers.forEach((specifier) => {
        if (specifier.type === "ImportSpecifier") {
          const importedName = specifier.imported.name;
          const localName = specifier.local.name;
          const newPackage = getNewPackageForSymbol(importedName);

          if (newPackage) {
            // Create a new import specifier with the local name
            const newSpecifier = j.importSpecifier(
              j.identifier(importedName),
              j.identifier(localName),
            );
            addOrAmendImport(j, root, newPackage, newSpecifier);
          }
        }
      });
    }
  });

  // Remove the old import declaration
  importedDeclarations.remove();

  return root.toSource();
}
