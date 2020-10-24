<div align="center">
<h1>Lingui Codemods<sub>js</sub></h1>
<img src="https://github.com/lingui/codemods/workflows/Main%20CI/badge.svg" />
<a href="https://www.npmjs.com/package/@lingui/codemods/v/latest"><img src="https://img.shields.io/npm/v/@lingui/codemods/latest.svg" /></a>

This repository contains a collection of codemod scripts for use with [JSCodeshift](https://github.com/facebook/jscodeshift) that help update Lingui APIs.

<hr />

</div>

### Usage

`npx @lingui/codemods <transform> <path> [...options]`

- `transform` - name of transform, see available transforms below.
- `path` - files or directory to transform
- use the `--dry` option for a dry-run and use `--print` to print the output for comparison

This will start an interactive wizard, and then run the specified transform.

### Included Transforms

#### `v2-to-v3`

Converts some outdated standards from `lingui` version 2.x.x to new features and best practices introduced in `lingui` version 3.x.x

```sh
npx @lingui/codemods v2-to-v3 <path>
```

### jscodeshift options

To pass more options directly to jscodeshift, use `--jscodeshift="..."`. For example:

```sh
npx @lingui/codemods --jscodeshift="--run-in-band --verbose=2"
```

See all available options [here](https://github.com/facebook/jscodeshift#usage-cli).

### Recast Options

Options to [recast](https://github.com/benjamn/recast)'s printer can be provided
through jscodeshift's `printOptions` command line argument

```sh
npx @lingui/codemods <transform> <path> --jscodeshift="--printOptions='{\"quote\":\"double\"}'"
```

### Usage without params

A CLI is built-in to help you migrate your codebase, will ask you some questions:

```sh
➜  project git:(master) lingui-codemod
? On which files or directory should the codemods be applied? for ex: ./src
? Which dialect of JavaScript do you use? for ex: JavaScript | Typescript | JavaScript with Flow
? Which transform would you like to apply? for ex: `v2-to-v3`
```

### License

@lingui/codemods is [MIT licensed](./LICENSE).
