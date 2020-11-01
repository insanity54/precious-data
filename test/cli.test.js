const fs = require('fs');
const path = require('path');
const cliPath = path.join(__dirname, '..', 'p-data.js');
const Promise = require('bluebird');
const yargsParser = require('yargs-parser')
const pify = require('pify')
const glob = require('glob')
const spawn = require('child_process').spawn
const nock = require('nock')
jest.mock('fs')


nockBack = nock.back
nockBack.fixtures = path.join(__dirname, '..', 'fixtures')



// greets https://github.com/kentcdodds/split-guide/blob/fb4b2a2ebc1fb8c3c010c2af1318861b8bb1bb13/src/bin/index.test.js
function runCLIAndAssertFileOutput(args, cwd) {
  // const {
  //   exercisesDir = './exercises', exercisesFinalDir = './exercises-final'
  // } = yargsParser(args)
  return runCli(args, cwd)
    .then((stdout) => {
      expect(stdout).toMatchSnapshot()
    })
    .catch((e) => {
      console.error('runCLI error')
      console.error(e)
    })
}


function runCli(args = '', cwd = process.cwd()) {
  const isRelative = cwd[0] !== '/'
  if (isRelative) {
    cwd = path.resolve(__dirname, cwd)
  }

  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const command = path.join(__dirname, '..', 'p-data.js')
    const opts = {
      cwd: cwd
    }
    const child = spawn(command, args.split(' '), opts)

    child.on('error', error => {
      reject(error)
    })

    child.stdout.on('data', data => {
      stdout += data.toString()
    })

    child.stderr.on('data', data => {
      stderr += data.toString()
    })

    child.on('close', () => {
      if (stderr) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}


describe('p-data.js CLI', () => {
  describe('list subcommand', () => {
    it('should list all sets listed on p-memories.com', () => {
      return nockBack('cliList.1.json')
        .then(({ nockDone, context }) => {
          return runCLIAndAssertFileOutput('list --type setNames --json', path.resolve(__dirname, '../'))
            .then(() => {
              context.assertScopesFinished()
            })
            .then(nockDone)
        })
    })
  })
  describe('index subcommand', () => {
    it('should run without failure', () => {
      return runCLIAndAssertFileOutput('index', path.resolve(__dirname, '../'))
    })
    it('should create a setAbbrIndex.json file', () => {
      require('fs').__setMock
      return runCli('index', path.resolve(__dirname, '../'))
        .then((stdout) => {

        })
    })
  });
  describe('rip subcommand', () => {
    it(
      'should make a Set suggestion if the Set abbreviation doesnt have an exact match',
      () => {
        const parser = require('yargs')().command(require('../commands/rip'))
        return new Promise((resolve, reject) => {
          parser.parse('rip -s OREIMO', (err, argv, output) => {
            if (err) reject(err)
            resolve(output)
          })
        }).then((output) => {
          expect(output).toMatch(/Did you mean/)
        });

      }
    )
    it('should rip a card given a URL to the card', () => {
      return execFile(cliPath, ['node', './p-data.js', 'rip', '-u', 'http://p-memories.com/node/906300'])
        .then((res) => {
          expect(typeof res).toBe('string');
          expect(res).toMatch(/涼風 青葉/)
        });
    })
    it(
      'should rip a card given the set abbreviation and card number',
      () => {
        return execFile(cliPath, ['node', './p-data.js', 'rip', '-s', 'SG', '-n', '01-019'])
          .then((res) => {
            expect(typeof res).toBe('string');
            expect(res).toMatch(/岡部 倫太郎/);
          });
      }
    )
    it('should rip an entire set given the set abbreviation', () => {
      let program = cli.parse(['node', './p-data.js', 'rip', '--set', 'MMDK']);
      expect(program).toBeDefined();
      expect(program.set).toEqual('MMDK');

      // .then((res) => {
      //   assert.isString(res);
      //   assert.match(res, /劇場版 魔法少女まどか☆マギカ/);
      //   const
      // })
    })
    xit('should have silent output when called with -q flag', function() {

    })

    it('should rip all incrementally with a throttle', () => {
      let program = cli.parse(['node', './p-data.js', 'rip', '-a', '-i', '-t', '3']);
      expect(program).toBeDefined();
      console.log(program);
    })
  })
})
