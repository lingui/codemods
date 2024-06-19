let gitStatusReturnValue: boolean | Error;
let execaReturnValue: { failed: boolean, stderr?: Error };

jest.setMock('execa', {
  sync: () => execaReturnValue
});

jest.setMock('is-git-clean', {
  sync: () => {
    if (typeof gitStatusReturnValue === 'boolean') {
      return gitStatusReturnValue;
    }
    throw gitStatusReturnValue;
  }
});

import fs from "fs";
import path from "path";
import {
  runTransform,
  jscodeshiftExecutable,
  transformerDirectory,
  checkGitStatus
} from '../cli';

describe('check-git-status', () => {
  it('does not exit and output any logs when git repo is clean', () => {
    gitStatusReturnValue = true;
    console.log = jest.fn();
    // @ts-ignore
    process.exit = jest.fn();
    checkGitStatus();
    expect(console.log).not.toHaveBeenCalled();
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('does not exit and output any logs when not a git repo', () => {
    const err = new Error();
    // @ts-ignore
    err.stderr = 'Not a git repository';
    gitStatusReturnValue = err;
    console.log = jest.fn();
    // @ts-ignore
    process.exit = jest.fn();
    checkGitStatus();
    expect(console.log).not.toHaveBeenCalled();
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('exits and output logs when git repo is dirty', () => {
    gitStatusReturnValue = false;
    console.log = jest.fn();
    // @ts-ignore
    process.exit = jest.fn();
    checkGitStatus();
    expect(console.log).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalled();
  });

  it('exits and output logs when git detection fail', () => {
    gitStatusReturnValue = new Error('bum');
    console.log = jest.fn();
    // @ts-ignore
    process.exit = jest.fn();
    checkGitStatus();
    expect(console.log).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalled();
  });

  it('does not exit when git repo is dirty and force flag is given', () => {
    gitStatusReturnValue = false;
    console.log = jest.fn();
    // @ts-ignore
    process.exit = jest.fn();
    checkGitStatus(true);
    expect(console.log).toHaveBeenCalledWith(
      'WARNING: Git directory is not clean. Forcibly continuing.'
    );
    expect(process.exit).not.toHaveBeenCalled();
  });
});

describe('runTransform', () => {
  it('finds transformer directory', () => {
    fs.lstatSync(transformerDirectory);
  });

  it('finds jscodeshift executable', () => {
    fs.lstatSync(jscodeshiftExecutable);
  });

  it('runs jscodeshift for the given transformer', () => {
    execaReturnValue = { failed: false };
    console.log = jest.fn();
    runTransform({
      files: ['src'],
      flags: {},
      parser: 'flow',
      transformer: 'rename-unsafe-xyz'
    });
    expect(console.log).toHaveBeenCalledWith(
      // eslint-disable-next-line max-len
      `Executing command: jscodeshift --verbose=2 --ignore-pattern=**/node_modules/** --parser flow --extensions=jsx,js --transform ${path.join(
        transformerDirectory,
        'rename-unsafe-xyz.js'
      )} src`
    );
  });

  it('supports jscodeshift flags', () => {
    execaReturnValue = { failed: false };
    console.log = jest.fn();
    runTransform({
      files: ['folder'],
      flags: { dry: true },
      parser: 'flow',
      transformer: 'v2-to-v3'
    });
    expect(console.log).toHaveBeenCalledWith(
      // eslint-disable-next-line max-len
      `Executing command: jscodeshift --dry --verbose=2 --ignore-pattern=**/node_modules/** --parser flow --extensions=jsx,js --transform ${path.join(
        transformerDirectory,
        'v2-to-v3.js'
      )} folder`
    );
  });

  it('supports typescript parser', () => {
    execaReturnValue = { failed: false };
    console.log = jest.fn();
    runTransform({
      files: ['folder'],
      flags: { dry: true },
      parser: 'tsx',
      transformer: 'rename-unsafe-lifecycles'
    });
    expect(console.log).toHaveBeenCalledWith(
      // eslint-disable-next-line max-len
      `Executing command: jscodeshift --dry --verbose=2 --ignore-pattern=**/node_modules/** --parser tsx --extensions=tsx,ts,jsx,js --transform ${path.join(
        transformerDirectory,
        'rename-unsafe-lifecycles.js'
      )} folder`
    );
  });

  it('supports jscodeshift custom arguments', () => {
    execaReturnValue = { failed: false };
    console.log = jest.fn();
    runTransform({
      files: ['folder'],
      flags: {
        dry: true,
        jscodeshift: 'verbose=2 --printOptions=\'{"quote":"double"}\''
      },
      parser: 'babel',
      transformer: 'v2-to-v3'
    });
    expect(console.log).toHaveBeenCalledWith(
      // eslint-disable-next-line max-len
      `Executing command: jscodeshift --dry --verbose=2 --ignore-pattern=**/node_modules/** --parser babel --extensions=jsx,js --transform ${path.join(
        transformerDirectory,
        'v2-to-v3.js'
      )} verbose=2 --printOptions='{"quote":"double"}' folder`
    );
  });

  it('supports remove-unused-imports flag that runs a codemod to clean all unused imports', () => {
    execaReturnValue = { failed: false };
    console.log = jest.fn();
    runTransform({
      files: ['folder'],
      flags: {
        removeUnusedImports: true,
      },
      parser: 'babel',
      transformer: 'v2-to-v3'
    });
    expect(console.log).toHaveBeenCalledTimes(2)
    // @ts-ignore
    expect(console.log.mock.calls).toEqual([
      [
        `Executing command: jscodeshift --verbose=2 --ignore-pattern=**/node_modules/** --parser babel --extensions=jsx,js --transform ${path.join(
          transformerDirectory,
          'v2-to-v3.js'
        )} folder`
      ],
      [
        `Executing command: jscodeshift --verbose=2 --ignore-pattern=**/node_modules/** --parser babel --extensions=jsx,js --transform ${path.join(
          transformerDirectory,
          'remove-unused-imports.js'
        )} folder`
      ]
    ]);
  });

  it('rethrows jscodeshift errors', () => {
    const transformerError = new Error('bum');
    execaReturnValue = { failed: true, stderr: transformerError };
    console.log = jest.fn();
    expect(() => {
      runTransform({
        files: ['src'],
        flags: {},
        parser: 'flow',
        transformer: 'tape'
      });
    }).toThrow(transformerError);
  });
});
