import globby from 'globby';
import inquirer from 'inquirer';
import meow from 'meow';
import path from 'path';
import execa from 'execa';
import chalk from 'chalk';
import isGitClean from 'is-git-clean';
import pkg from "../package.json";

const transformerDirectory = path.join(__dirname, '../', 'transforms');
const jscodeshiftExecutable = require.resolve('.bin/jscodeshift');

function checkGitStatus(force?: boolean) {
  let clean = false;
  let errorMessage = 'Unable to determine if git directory is clean';
  try {
    clean = isGitClean.sync(process.cwd());
    errorMessage = 'Git directory is not clean';
  } catch (err) {
    if (err && err.stderr && err.stderr.indexOf('Not a git repository') >= 0) {
      clean = true;
    }
  }

  if (!clean) {
    if (force) {
      console.log(`WARNING: ${errorMessage}. Forcibly continuing.`);
    } else {
      console.log('Thank you for using lingui-codemods!');
      console.log(
        chalk.yellow(
          '\nBut before we continue, please stash or commit your git changes.'
        )
      );
      console.log(
        '\nYou may use the --force flag to override this safety check.'
      );
      process.exit(1);
    }
  }
}

type TransformOpts = {
  files: string,
  flags?: Record<string, unknown>,
  parser: string,
  transformer?: string,
  answers?: string,
  [string: string]: any
}

function runTransform({ files, flags, parser, transformer }: TransformOpts) {
  const transformerPath = path.join(transformerDirectory, `${transformer}.js`);

  let args = [];

  const { dry, print, removeUnusedImports } = flags;

  if (dry) {
    args.push('--dry');
  }
  if (print) {
    args.push('--print');
  }

  args.push('--verbose=2');

  args.push('--ignore-pattern=**/node_modules/**');

  args.push('--parser', parser);

  if (parser === 'tsx') {
    args.push('--extensions=tsx,ts,jsx,js');
  } else {
    args.push('--extensions=jsx,js');
  }

  args = args.concat(['--transform', transformerPath]);

  if (flags.jscodeshift) {
    args = args.concat(flags.jscodeshift);
  }

  args = args.concat(files);

  console.log(`Executing command: jscodeshift ${args.join(' ')}`);

  const result = execa.sync(jscodeshiftExecutable, args, {
    stdio: 'inherit',
    stripFinalNewline: false
  });

  if (removeUnusedImports) {
    let newArgs: any[] = args.filter(el => {
      return el !== "--transform" && el !== transformerPath && el !== files
    });
    newArgs = newArgs.concat(['--transform', path.join(transformerDirectory, `remove-unused-imports.js`)]);
    newArgs = newArgs.concat(files);

    console.log(`Executing command: jscodeshift ${newArgs.join(' ')}`);

    const removeUnusedResult = execa.sync(
      jscodeshiftExecutable,
      newArgs,
      {
        stdio: 'inherit',
        stripFinalNewline: false
      }
    );

    if (removeUnusedResult.failed) {
      throw removeUnusedResult.stderr;
    }
  }

  if (result.failed) {
    throw result.stderr;
  }
}

const TRANSFORMER_INQUIRER_CHOICES = [
  {
    name: 'v2-to-v3: Migrates v2 standards to the new standards of @lingui v3.X.X',
    value: 'v2-to-v3'
  },
];

const PARSER_INQUIRER_CHOICES = [
  {
    name: 'JavaScript',
    value: 'babel'
  },
  {
    name: 'JavaScript with Flow',
    value: 'flow'
  },
  {
    name: 'TypeScript',
    value: 'tsx'
  }
];

function expandFilePathsIfNeeded(filesBeforeExpansion) {
  const shouldExpandFiles = filesBeforeExpansion.some(file =>
    file.includes('*')
  );
  return shouldExpandFiles
    ? globby.sync(filesBeforeExpansion)
    : filesBeforeExpansion;
}

function run() {
  const cli = meow(
    {
      description: `Codemods for @lingui APIs. Version: ${pkg.version}`,
      help: `
    Usage
      $ npx lingui-codemod <transform> <path> <...options>
        transform    One of the choices from https://github.com/@lingui/packages/codemods
        path         Files or directory to transform. Can be a glob like src/**.test.js
    Options
      --force                    Bypass Git safety checks and forcibly run codemods
      --dry                      Dry run (no changes are made to files)
      --remove-unused-imports    Remove unused imports once finished the codemod
      --print                    Print transformed files to your terminal
      --jscodeshift              (Advanced) Pass options directly to jscodeshift
    `
    },
    {
      boolean: ['force', 'dry', 'print', 'remove-unused-imports', 'help'],
      string: ['_'],
      alias: {
        h: 'help'
      }
    }
  );

  if (!cli.flags.dry) {
    checkGitStatus(cli.flags.force);
  }

  if (
    cli.input[0] &&
    !TRANSFORMER_INQUIRER_CHOICES.find(x => x.value === cli.input[0])
  ) {
    console.error('Invalid transform choice, pick one of:');
    console.error(
      TRANSFORMER_INQUIRER_CHOICES.map(x => '- ' + x.value).join('\n')
    );
    process.exit(1);
  }

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'files',
        message: 'On which files or directory should the codemods be applied?',
        when: !cli.input[1],
        default: '.',
        // validate: () =>
        filter: files => files.trim()
      },
      {
        type: 'list',
        name: 'parser',
        message: 'Which dialect of JavaScript do you use?',
        default: 'babel',
        when: !cli.flags.parser,
        pageSize: PARSER_INQUIRER_CHOICES.length,
        choices: PARSER_INQUIRER_CHOICES
      },
      {
        type: 'list',
        name: 'transformer',
        message: 'Which transform would you like to apply?',
        when: !cli.input[0],
        pageSize: TRANSFORMER_INQUIRER_CHOICES.length,
        choices: TRANSFORMER_INQUIRER_CHOICES
      },
    ])
    .then(answers => {
      const { files, transformer, parser } = answers;

      const filesBeforeExpansion = cli.input[1] || files;
      const filesExpanded = expandFilePathsIfNeeded([filesBeforeExpansion]);

      const selectedTransformer = cli.input[0] || transformer;
      const selectedParser = cli.flags.parser || parser;

      if (!filesExpanded.length) {
        console.log(
          `No files found matching ${filesBeforeExpansion.join(' ')}`
        );
        return null;
      }

      return runTransform({
        files: filesExpanded,
        flags: cli.flags,
        parser: selectedParser,
        transformer: selectedTransformer,
        answers: answers
      });
    });
}

export {
  run,
  runTransform,
  checkGitStatus,
  jscodeshiftExecutable,
  transformerDirectory
}
