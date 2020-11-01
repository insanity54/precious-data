const fs = require('fs');
const path = require('path');
const cliPath = path.join(__dirname, '..', 'p-data.js');
const Promise = require('bluebird');
const spawn = require('child_process').spawn
const nock = require('nock')
jest.mock('fs')


nockBack = nock.back
nockBack.fixtures = path.join(__dirname, '..', 'fixtures')

const mockSetAbbr = [
  {
    "setAbbr": "ClariS",
    "setUrl": "http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on"
  }
]
const mockFileStructureC = {
  [path.join(__dirname, '..', 'data', 'setAbbrIndex.json')]: JSON.stringify(mockSetAbbr)
}

// greets https://github.com/kentcdodds/split-guide/blob/fb4b2a2ebc1fb8c3c010c2af1318861b8bb1bb13/src/bin/index.test.js
function runCLIAndAssertOutput(args, cwd) {
  return runCli(args, cwd)
    .then((stdout) => {
      expect(stdout).toMatchSnapshot()
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
      cwd: cwd,
      stdio: 'inherit'
    }
    const child = spawn(command, args.split(' '), opts)

    child.on('error', error => {
      console.error('there was an error with the child_process')
      reject(error)
    })

    child.stdout.on('data', data => {
      stdout += data.toString()
    })

    child.stderr.on('data', data => {
      stderr += data.toString()
    })

    child.on('close', () => {
      resolve(stdout)
    })
  })
}


describe('p-data.js CLI', () => {
  describe('list subcommand', () => {
    it('should list all sets listed on p-memories.com', () => {
      return nockBack('cliList.1.json')
        .then(({ nockDone, context }) => {
          return runCLIAndAssertOutput('list --type setNames --json', path.resolve(__dirname, '../'))
            .then(() => {
              context.assertScopesFinished()
            })
            .then(nockDone)
        })
    })
  })
  describe('index subcommand', () => {
    it('should create a setAbbrIndex.json file', () => {
      jest.spyOn(ripper, getSetUrls).mockImplementation(() => mockSetAbbr)
      let expectedSetAbbrIndexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json')
      return nockBack('cli.index.2.json')
        .then(({ nockDone, context }) => {
          return runCLIAndAssertOutput('index', path.resolve(__dirname, '../'))
            .then(() => {
              expect(require('fs').__getWrittenFiles())
                .toEqual(expect.arrayContaining([expectedSetAbbrIndexPath]))
              context.assertScopesFinished()
            })
            .then(nockDone)
        })
    }, 1000*30)
  });
  describe('rip subcommand', () => {
    it(
      'should make a Set suggestion if the Set abbreviation doesnt have an exact match',
      () => {
        return nockBack('cli.rip.1.json')
          .then(({ nockDone, context }) => {
            const parser = require('yargs')().command(require('../commands/rip'))
            return new Promise((resolve, reject) => {
              parser.parse('rip -s OREIMO', (err, argv, output) => {
                if (err) reject(err)
                resolve(output)
              })
            }).then((output) => {
              expect(output).toMatch(/Did you mean/)
              context.assertScopesFinished()
            })
            .then(nockDone)
          })
      }
    )
    it('should rip a card given a URL to the card', () => {
      return nockBack('cli.rip.2.json')
        .then(({ nockDone, context }) => {
          return runCLIAndAssertOutput('rip -u http://p-memories.com/node/906300')
          .then((res) => {
            expect(typeof res).toBe('string');
            expect(res).toMatch(/涼風 青葉/)
            context.assertScopesFinished()
          })
          .then(nockDone)
        })
    })
    it(
      'should rip a card given the set abbreviation and card number',
      () => {
        return nockBack('cli.rip.3.json')
          .then(({ nockDone, context }) => {
            return runCLIAndAssertOutput('rip -s SG -n 01-019')
              .then((res) => {
                expect(typeof res).toBe('string');
                expect(res).toMatch(/岡部 倫太郎/);
              });
          })
      }
    )
    it('should rip an entire set given the set abbreviation', () => {
      return nockBack('cli.rip.4.json')
        .then(({ nockDone, context }) => {
          return runCLIAndAssertOutput('rip --set ClariS')
            .then(() => {
              const clarisPath = path.join(__dirname, '..', 'data', 'ClariS', 'P')
              expect(fs.__getWrittenFiles()).toEqual(expect.arrayContaining([
                path.join(clarisPath, 'ClariS_P-001.jpg'),
                path.join(clarisPath, 'ClariS_P-001.json'),
              ]))
              context.assertScopesFinished()
            })
            .then(nockDone)
          })
    })
    it('should have silent output when called with -q flag', function() {
      return nockBack('cli.rip.5.json')
        .then(({ nockDone, context }) => {
          return runCLIAndAssertOutput("rip -n \'HMK 01-001\' -q")
            .then((stdout) => {
              expect(stdout).toBeNull()
              context.assertScopesFinished()
            })
            .then(nockDone)
        })
    })

    it('should rip all incrementally with a throttle', () => {
      require('fs').__setMockFiles(mockFileStructureC)
      return nockBack('cli.rip.6.json')
        .then(({ nockDone, context }) => {
          return runCLIAndAssertOutput('rip -a -i -t 3')
          .then(() => {
            conext.assertScopesFinished()
          })
          .then(nockDone)
      })
    })
  })
})
