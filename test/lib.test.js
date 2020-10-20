
const Ripper = require('../lib/ripper')
const path = require('path')
const Promise = require('bluebird')
const axios = require('axios')
const nock = require('nock')
const fs = require('fs')

nockBack = nock.back
nockBack.fixtures = path.join(__dirname, '..', 'fixtures')
nockBack.setMode('lockdown')


let ripper
beforeEach(() => {
  ripper = new Ripper();
})

describe('P-Memories Ripper Library', () => {
  describe('getCardUrlsFromSetPage', () => {
    it(
      'should accept a card number and setUrl and resolve an object with cardUrl and cardImageUrl',
      () => {
        return ripper.getCardUrlsFromSetPage('01-050', 'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on').then((card) => {
          expect(typeof card).toBe('object');
          expect(card.cardUrl).toEqual('http://p-memories.com/node/926840');
          expect(card.cardImageUrl).toEqual('http://p-memories.com/images/product/SSSS/SSSS_01-050.jpg');
        });
      }
    )
  })

  describe('lookupCardUrl', () => {
    it('should throw an error if not receiving a parameter', () => {
      return expect(() => { ripper.lookupCardUrl() }).toThrow(/Got undefined/)
    })
    it('should throw an error if receiving an empty string', () => {
      return expect(() => { ripper.lookupCardUrl('') }).toThrow(/Got an empty string/)
    })
    it(
      'should resolve { cardUrl, cardImageUrl } when given a card ID',
      () => {
        return nockBack('SSSS.html.json').then(({ nockDone, context }) => {
          return ripper.lookupCardUrl('SSSS_01-001').then((card) => {
            expect(card).toHaveProperty('cardUrl', 'http://p-memories.com/node/926791')
            expect(card).toHaveProperty('cardImageUrl', 'http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg')
            context.assertScopesFinished()
          }).then(nockDone)
        })
      }
    )
  });

  describe('isValidPMemoriesUrl', () => {
    it(
      'should return true when receiving p-memories.com url as param',
      () => {
        let valid = ripper.isValidPMemoriesUrl('http://p-memories.com/node/926791');
        expect(valid).toBe(true);
      }
    );
    it('should return false when receiving a foreign url as param', () => {
      let invalid = ripper.isValidPMemoriesUrl('http://google.com');
      expect(invalid).toBe(false);
    });
    it('should return false when receiving a card ID', () => {
      let invalid = ripper.isValidPMemoriesUrl('SSSS_01-001')
      expect(invalid).toBe(false);
    })
  });

  describe('isLocalData', () => {
    it(
      'should return a promise with true for a card that exists on disk',
      async () => {
        let cardData = require('../fixtures/HMK_01-001.json');
        let isLocalData = await ripper.isLocalData(cardData);
        expect(isLocalData).toBe(true);
      }
    );
    it(
      'should return a promise with false for a card that does not exist on disk',
      async () => {
        let cardData = require('../fixtures/BBQ_OZ-541.json');
        let isLocalData = await ripper.isLocalData(cardData);
        expect(isLocalData).toBe(false);
      }
    );
  });

  describe('parseCardId', () => {

    /**
    test strings for Rubular/regexr testing:

/images/product/PM_HS/PM_HS_01-002.jpg
PM_HS_03-008
http://p-memories.com/images/product/GPFN/GPFN_01-030a.jpg
SSSS_P-001
http://p-memories.com/images/product/HMK/HMK_01-001.jpg
/images/product/PM_K-ON_Part2/PM_K-ON_Part2_02-048.jpg
KON 01-068

     */
     it('should throw if receiving no parameter', () => {
       return expect(() => { ripper.parseCardId() }).toThrow(/Got undefined/)
     })
    it('should throw an error if receiving a string that does match the required format', () => {
      return expect(() => { ripper.parseCardId('taco bell') }).toThrow(/cardId is not valid/)
    })
    it(
      'should return an object with setAbbr, release, number, and num',
      () => {
        let p = ripper.parseCardId('HMK_01-001');
        expect(p.setAbbr).toEqual('HMK');
        expect(p.release).toEqual('01');
        expect(p.number).toEqual('01-001');
        expect(p.num).toEqual('001');
        expect(p.id).toEqual('HMK 01-001');
        expect(p.variation).toEqual('');
      }
    );

    it('should accept a relative image URL as param', () => {
      let p = ripper.parseCardId('/images/product/YYY2/YYY2_02-001.jpg');
      expect(p.setAbbr).toEqual('YYY2');
      expect(p.release).toEqual('02');
      expect(p.number).toEqual('02-001');
      expect(p.num).toEqual('001');
      expect(p.id).toEqual('YYY2 02-001');
      expect(p.variation).toEqual('');
    });

    it('should accept an image URL as param', () => {
      let p = ripper.parseCardId('http://p-memories.com/images/product/HMK/HMK_01-001.jpg');
      expect(p.setAbbr).toEqual('HMK');
      expect(p.release).toEqual('01');
      expect(p.number).toEqual('01-001');
      expect(p.num).toEqual('001');
      expect(p.id).toEqual('HMK 01-001');
      expect(p.variation).toEqual('');
    });

    it('should reject when the card ID is not valid', () => {
      expect(ripper.parseCardId.bind(ripper, 'tacobell')).toThrow();
    });

    it('should handle a card ID with a letter as the release', () => {
      let p = ripper.parseCardId('SSSS P-001');
      expect(p.setAbbr).toEqual('SSSS');
      expect(p.release).toEqual('P');
      expect(p.number).toEqual('P-001');
      expect(p.num).toEqual('001');
      expect(p.id).toEqual('SSSS P-001');
      expect(p.variation).toEqual('');
    });

    it(
      'should handle a card ID with a letter variation at the end',
      () => {
        let p = ripper.parseCardId('http://p-memories.com/images/product/GPFN/GPFN_01-030a.jpg');
        expect(p.setAbbr).toEqual('GPFN');
        expect(p.release).toEqual('01');
        expect(p.number).toEqual('01-030a');
        expect(p.num).toEqual('030');
        expect(p.id).toEqual('GPFN 01-030a');
        expect(p.variation).toEqual('a');
      }
    )

    it('should handle a card ID an underscore in the setAbbr', () => {
      let p = ripper.parseCardId('PM_HS_03-008');
      expect(p.setAbbr).toEqual('PM_HS');
      expect(p.release).toEqual('03');
      expect(p.number).toEqual('03-008');
      expect(p.num).toEqual('008');
      expect(p.id).toEqual('PM_HS 03-008');
      expect(p.variation).toEqual('');
    });

    it(
      'should handle a cardID with underscores and a relative URL',
      () => {
        let p = ripper.parseCardId('/images/product/PM_HS/PM_HS_01-002.jpg');
        expect(p.setAbbr).toEqual('PM_HS')
        expect(p.release).toEqual('01')
        expect(p.number).toEqual('01-002')
        expect(p.num).toEqual('002')
        expect(p.id).toEqual('PM_HS 01-002')
        expect(p.variation).toEqual('')
      }
    )

    it(
      'should handle a cardID with multiple underscores in the set name',
      () => {
        let p = ripper.parseCardId('/images/product/PM_K-ON_Part2/PM_K-ON_Part2_02-048.jpg');
        expect(p.setAbbr).toEqual('PM_K-ON_Part2')
        expect(p.release).toEqual('02')
        expect(p.number).toEqual('02-048')
        expect(p.num).toEqual('048')
        expect(p.id).toEqual('PM_K-ON_Part2 02-048')
        expect(p.variation).toEqual('')
      }
    );

    it(
      'should handle a cardID with a space between the setAbbr and the release',
    () => {
      let p = ripper.parseCardId('HMK 02-003')
      expect(p.setAbbr).toEqual('HMK')
    })

    it('should handle GPFN P-004a',
    () => {
      let p = ripper.parseCardId('GPFN P-004a')
      expect(p.setAbbr).toEqual('GPFN')
      expect(p.release).toEqual('P')
      expect(p.number).toEqual('P-004a')
      expect(p.num).toEqual('004')
      expect(p.id).toEqual('GPFN P-004a')
      expect(p.variation).toEqual('a')
    })

    it('should handle GPFN_P-004a', () => {
      let p = ripper.parseCardId('GPFN_P-004a');
      expect(p.setAbbr).toEqual('GPFN')
      expect(p.release).toEqual('P')
      expect(p.number).toEqual('P-004a')
      expect(p.num).toEqual('004')
      expect(p.id).toEqual('GPFN P-004a')
      expect(p.variation).toEqual('a')
    });
  });

  describe('getSetUrls', () => {
    it(
      'should return a list of all set URLs found on p-memories.com',
      () => {
        return ripper.getSetUrls().then((setList) => {
          expect(Array.isArray(setList)).toBe(true);
          expect(setList.length).toBeGreaterThanOrEqual(94);
          expect(setList).toEqual(expect.arrayContaining([
            'http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on',
            'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on',
            'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
          ]));
        });
      }
    );
  });




  describe('ripSetData', () => {
    it('should accept a setURL as parameter', () => {
      let promise = ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on')
      expect(promise).resolves.toStrictEqual(expect.anything())
    })
    it('should throw if not receiving a setURL as param', () => {
      let promise = ripper.ripSetData()
      return expect(promise).rejects.toThrow(/param/)
    })
    it(
      'should return an array of objects containing cardUrl and cardImageUrl',
      () => {
        return ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on')
          .then((data) => {
            console.log(data)
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBe(1);
            expect(typeof data[0].cardImageUrl).toBe('string');
            expect(typeof data[0].cardUrl).toBe('string');
          });
      }
    );

    it('should rip a set which contains more than one page', function () {
      return ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on')
        .then((data) => {
          expect(Array.isArray(data)).toBe(true);
          expect(data.length).toBeGreaterThanOrEqual(403);
        });
    });

    it('should cope with a relative p-memories.com URL', function () {
      return ripper.ripSetData('/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on')
        .then((data) => {
          expect(Array.isArray(data)).toBe(true);
          expect(data.length).toBe(1);
        });
    });

    it('should download madoka release 03', function () {
      return ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=313372-%E5%8A%87%E5%A0%B4%E7%89%88+%E9%AD%94%E6%B3%95%E5%B0%91%E5%A5%B3%E3%81%BE%E3%81%A9%E3%81%8B%E2%98%86%E3%83%9E%E3%82%AE%E3%82%AB&s_flg=on')
        .then((data) => {
          expect(Array.isArray(data)).toBe(true);
          expect(data.length).toBeGreaterThan(1);
        });
    })
  });

  describe('isLocalCard', () => {
    it(
      'should return a promise resolving true if the card exists on disk',
      () => {
        return ripper.isLocalCard('HMK_01-001').then((realCardOnDisk) => {
          expect(realCardOnDisk).toBe(true);
        });
      }
    );

    it(
      'should return a promise resolving false if the card does not exist on disk',
      () => {
        return ripper.isLocalCard('TTQ_05-003').then((fakeCardNotOnDisk) => {
          expect(fakeCardNotOnDisk).toBe(false);
        });
      }
    );

    it('should handle relative image urls as parameter', () => {
      return ripper.isLocalCard('/images/product/PM_HS/PM_HS_01-002.jpg').then((realCardOnDisk) => {
        expect(realCardOnDisk).toBe(true);
      });
    });

    it('should handle absolute image urls as parameter', () => {
      return ripper.isLocalCard('http://p-memories.com/images/product/HMK/HMK_01-001.jpg').then((realCardOnDisk) => {
        expect(realCardOnDisk).toBe(true);
      });
    });
  })

  xdescribe('ripCardById', () => {
    it('should accept a card ID as param and rip the card to disk', () => {
      return ripper.ripCardById('ERMG 01-001').then((writeResult) => {
        expect(typeof writeResult).toBe('object');
        expect(writeResult).toHaveProperty('imagePath')
        expect(writeResult).toHaveProperty('dataPath')
      });
    })
  })

  describe('splitTextList', () => {
    it('should return an empty array if not receiving anything', () => {
      const list = ripper.splitTextList()
      expect(list).toStrictEqual([])
    })
    it('should return an empty array if receiving an empty string', () => {
      const list = ripper.splitTextList('')
      expect(list).toStrictEqual([])
    })
    it('should convert a {String} list into an array of strings', () => {
      const list = ripper.splitTextList('ヘッドフォン、音楽')
      expect(list).toStrictEqual([
        'ヘッドフォン',
        '音楽'
      ])
    })
  })

  describe('parseCardDataFromHtml', () => {
    it('should get card data from a {String} html', () => {
      const html = require(path.join(nockBack.fixtures, 'HMK_01-001.html.json'))[0].response
      return ripper
        .parseCardDataFromHtml(html)
        .then((data) => {
          expect(data).toHaveProperty('number', '01-001')
          expect(data).toHaveProperty('rarity', 'SR（サイン）')
          expect(data).toHaveProperty('setName', '初音ミク')
          expect(data).toHaveProperty('name', '初音 ミク')
          expect(data).toHaveProperty('type', 'キャラクター')
          expect(data).toHaveProperty('cost', '4')
          expect(data).toHaveProperty('source', '1')
          expect(data).toHaveProperty('color', '緑')
          expect(data).toHaveProperty('characteristic', ['ヘッドフォン', '音楽'])
          expect(data).toHaveProperty('ap', '40')
          expect(data).toHaveProperty('dp', '30')
          expect(data).toHaveProperty('parallel', '')
          expect(data).toHaveProperty('text', 'このカードが登場した場合、手札から『初音 ミク』のキャラ1枚を場に出すことができる。[アプローチ/両方]:《0》自分の「初音 ミク」2枚を休息状態にする。その場合、自分のキャラ1枚は、ターン終了時まで+10/±0または±0/+10を得る。')
          expect(data).toHaveProperty('flavor', '-')
          expect(data).toHaveProperty('image', 'http://p-memories.com/images/product/HMK/HMK_01-001.jpg')
          expect(data).toHaveProperty('url', 'http://p-memories.com/node/383031')
          expect(data).toHaveProperty('setAbbr', 'HMK')
          expect(data).toHaveProperty('num', '001')
          expect(data).toHaveProperty('release', '01')
          expect(data).toHaveProperty('id', 'HMK 01-001')
        })
    })

    it('should reject to throw an error if not receiving any param', () => {
      return expect(ripper.parseCardDataFromHtml()).rejects.toThrow('parameter')
    })
  })

  describe('ripCardData', () => {
    it('Should throw an error if not receiving any param', () => {
      return expect(() => { ripper.ripCardData() }).toThrow(/Got undefined/)
    })
    it('Should throw an error if receiving an empty string', () => {
      return expect(() => { ripper.ripCardData('') }).toThrow(/Got an empty string/)
    })
    it('Should get card data from a card URL', () => {
      return nockBack('SSSS_01-001.html.json').then(({ nockDone }) => {
        return ripper
          .ripCardData('http://p-memories.com/node/926791')
          .then((data) => {
            expect(typeof data).toBe('object');
            expect(data.number).toEqual('01-001');
            expect(data.rarity).toEqual('SR');
            expect(data.setName).toEqual('SSSS.GRIDMAN');
            expect(data.name).toEqual('響 裕太');
            expect(data.type).toEqual('キャラクター');
            expect(data.cost).toEqual('6');
            expect(data.source).toEqual('3');
            expect(data.color).toEqual('赤');
            expect(data.characteristic).toEqual(['制服']);
            expect(data.ap).toEqual('-');
            expect(data.dp).toEqual('-');
            expect(data.parallel).toEqual('');
            expect(data.text).toEqual(
              'このカードが登場した場合、手札から名称に「グリッドマン」を含むキャラ1枚を場に出すことができる。[メイン/自分]:《休》名称に「グリッドマン」を含む自分のキャラ1枚は、ターン終了時まで+20/+20を得る。その場合、カードを1枚引く。'
            );
            expect(data.flavor).toEqual('グリッドマン…。オレと一緒に戦ってくれ！');
            expect(data.url).toEqual('http://p-memories.com/node/926791');
            expect(data.image).toEqual('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
            expect(data.setAbbr).toEqual('SSSS');
            expect(data.id).toEqual('SSSS 01-001');
            expect(data.num).toEqual('001');
            expect(data.release).toEqual('01');
          })
          .then(nockDone)
      })
    });

    it('should accept a card ID as first param', () => {
      // @TODO https://github.com/insanity54/precious-data/issues/3
      return nockBack('SSSS_01-001.html.json')
        .then(({ nockDone }) => {
          return ripper.ripCardData('SSSS 01-001').then((data) => {
            expect(typeof data).toBe('object');
            expect(data.number).toEqual('01-001');
            expect(data.url).toEqual('http://p-memories.com/node/926791');
            expect(data.image).toEqual('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
          }).then(nockDone)
        })
    });

    xit(
      'should accept a second parameter, a cardImageUrl, which will be used to determine whether or not to make a network request to rip card data.',
      () => {
        // https://github.com/insanity54/precious-data/issues/4
        return nockBack('GPFN_01-030a.html.json')
          .then(({ nockDone }) => {
            return ripper
              .ripCardData('http://p-memories.com/node/932341', '/images/product/GPFN/GPFN_01-030a.jpg')
              .then((data) => {
                expect(typeof data).toBe('object');
                expect(data.number).toEqual('01-030a');
                expect(data.url).toEqual('http://p-memories.com/node/932341');
                expect(data.id).toEqual('GPFN 01-030a');
              })
              .then(nockDone)
          })
      }
    );

    xit(
      'should return a promise which rejects with an error if receiving a URL to a card which has already been downloaded',
      () => {
          // this should happen elsewhere, before calling ripCardData in order to keep functions neat and tidy
          // https://github.com/insanity54/precious-data/issues/4
        return nockBack('HMK_01-001.html.json').then(({ nockDone }) => {
          let targetCardPath = path.join(__dirname, '..', 'data', 'HMK', '01', 'HMK_01-001.json')
          let creationTimeBefore = fs.statSync(targetCardPath).mtimeMs;
          let cd = ripper.ripCardData('http://p-memories.com/node/383031', 'http://p-memories.com/images/product/HMK/HMK_01-001.jpg');
          return expect(cd).rejects.toThrow(/EEXIST/)
            .then(nockDone)
        })
      }
    );

    it('should cope with a relative P-memories URL', () => {
      return ripper.ripCardData('/node/926791')
        .then((data) => {
          expect(typeof data).toBe('object');
          expect(data.number).toEqual('01-001');
          expect(data.url).toEqual('http://p-memories.com/node/926791');
        });
    });

  });

  describe('writeCardData', () => {
    it('should create a JSON file in the appropriate folder', () => {
      let cardData = require('../fixtures/HMK_01-001.json');
      return ripper
        .writeCardData(cardData)
        .then((res) => {
          let cardDataResult = require('../data/HMK/01/HMK_01-001.json');
          expect(cardDataResult.name).toEqual('初音 ミク');
          expect(res).toMatch(/\/data\/HMK\/01\/HMK_01-001.json/);
        });
    });

    it('should not overwrite locally modified JSON files.', () => {
      let cardData = require('../fixtures/HMK_01-001.json');
      return ripper
        .writeCardData(cardData)
        .then((res) => {
          let cardDataResult = require('../data/HMK/01/HMK_01-001.json');
          expect(cardDataResult.nameEn).toEqual('Hatsune Miku');
          expect(cardDataResult.setNameEn).toEqual('Hatsune Miku');
          expect(res).toMatch(/\/data\/HMK\/01\/HMK_01-001.json/);
        });
    });
  });

  describe('downloadImage', () => {
    beforeEach(() => {
    })
    let correctImagePath = path.join(
      __dirname,
      '..',
      'data',
      'SSSS',
      '01',
      'SSSS_01-001.jpg'
    );
    it(
      'Should accept a card URL and download the card image and write it to the correct folder',
      () => {

        let cardUrl = 'http://p-memories.com/node/926791';
        return ripper
          .downloadImage(cardUrl)
          .then((imagePath) => {
            expect(typeof imagePath).toBe('string');
            expect(imagePath).toEqual(correctImagePath);
          });
      }
    );
    it(
      'Should download a card image and place it in the correct folder',
      () => {
        let imageUrl = 'http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg';
        return ripper
          .downloadImage(imageUrl)
          .then((imagePath) => {
            expect(typeof imagePath).toBe('string');
            expect(imagePath).toEqual(correctImagePath);
          });
      }
    );
    it(
      'should accept a card data object, download the image specified within, and place it in the correct folder',
      () => {
        let cardData = require(path.join(__dirname, '..', 'fixtures', 'SSSS_01-001.json'));
        return ripper
          .downloadImage(cardData)
          .then((imagePath) => {
            expect(typeof imagePath).toBe('string');
            expect(imagePath).toEqual(correctImagePath);
          });
      }
    )
  });

  describe('buildImagePath', () => {
    it('should build an image path given an image URL', () => {
      // input: http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg
      // output: ../SSSS/SSSS_01-001.jpg
      let path = ripper.buildImagePath('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
      expect(path).toMatch(/\/data\/SSSS\/01\/SSSS_01-001.jpg/);
    });
  });

  describe('buildCardDataPath', () => {
    it('should build a card data path given a card JSON data file', () => {
      let path = ripper.buildCardDataPath(require('../fixtures/HMK_01-001.json'));
      expect(path).toMatch(/\/data\/HMK\/01\/HMK_01-001.json/);
    });
  });

  describe('identifyUrl', () => {
    it('should return the string, "card" when fed a card URL', () => {
      let urlType = ripper.identifyUrl('http://p-memories.com/node/906300');
      expect(urlType).toEqual('card');
    });
    it('should return the string, "set" when fed a card URL', () => {
      let urlType = ripper.identifyUrl('http://p-memories.com/card_product_list_page?field_title_nid=845152-NEW+GAME%21');
      expect(urlType).toEqual('set');
    });
    it('should return the String, "unknown" when fed an empty URL', () => {
      let urlType = ripper.identifyUrl('');
      expect(urlType).toEqual('unknown');
    });
    it(
      'should return the String, "unknown" when fed a foreign URL',
      () => {
        let urlType = ripper.identifyUrl('https://www.youtube.com/watch?v=JQlkfkvR9A0');
        expect(urlType).toEqual('unknown');
      }
    );
  });

  describe('loadSetAbbrIndex', () => {
    // @TODO mock this function
    it('should return a Promise', () => {
      let index = ripper.loadSetAbbrIndex()
      expect(index).toBeInstanceOf(Promise)
    })
    it('should resolve with an array of objects containing setAbbr and setUrl keys', () => {

      let index = ripper.loadSetAbbrIndex()
      expect(index).resolves.toContainEqual({
        setAbbr: 'HMK',
        url: 'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
      })
    })
    it('should reject with an Error if setAbbrIndex.json does not exist', () => {

    })
  })

  describe('getSetSuggestion', () => {
    const setAbbrIndex = [
      {
        setAbbr: 'oreimo',
        setUrl: 'http://example.com'
      },
      {
        setAbbr: 'ORE2',
        setUrl: 'http://example2.com'
      }
    ]
    it('Should accept an {Array} setAbbrIndex and {String} setAbbr', () => {
      let suggestions = ripper.getSetSuggestion(setAbbrIndex, 'oreimo')
    })
    it('Should throw if not receiving required params', () => {
      expect(() => { ripper.getSetSuggestion() }).toThrow()
    })
    it('Should return an {Array} of suggestions', () => {
      let suggestions = ripper.getSetSuggestion(setAbbrIndex, 'OREIMO')
      expect(suggestions.length).toBeGreaterThanOrEqual(2)
      expect(suggestions).toEqual(expect.arrayContaining(['oreimo', 'ORE2']))
    })
  })

  describe('getSetUrlFromSetAbbr', () => {
    it('Should return a promise', () => {
      let url = ripper.getSetUrlFromSetAbbr('HMK')
      return expect(url).toBeInstanceOf(Promise);
    })
    it('Should reject with an error if the Set Index does not exist', () => {
      const index = jest.spyOn(ripper, 'loadSetAbbrIndex').mockImplementation(() => undefined)
      let url = ripper.getSetUrlFromSetAbbr('HMK')
      expect(index).toHaveBeenCalledTimes(1)
      return expect(url).rejects.toThrow('Set Abbreviation Index does not exist')
    })
    it('Should reject with an error which makes a suggestion when the user submits a set that doesnt exist', () => {
      let url = ripper.getSetUrlFromSetAbbr('OREIMO');
      return expect(url).rejects.toThrow(/Did you mean/);
    });
    it('Should return the correct URL for SSSS.GRIDMAN', () => {
      return ripper.getSetUrlFromSetAbbr('SSSS')
        .then((url) => {
          expect(url).toEqual(
            'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on'
          )
        });
    });
    it('Should return the correct URL for ookami', () => {
      return ripper.getSetUrlFromSetAbbr('ookami')
        .then((url) => {
          expect(url).toEqual(
            'http://p-memories.com/card_product_list_page?field_title_nid=4539-%E3%82%AA%E3%82%AA%E3%82%AB%E3%83%9F%E3%81%95%E3%82%93%E3%81%A8%E4%B8%83%E4%BA%BA%E3%81%AE%E4%BB%B2%E9%96%93%E3%81%9F%E3%81%A1&s_flg=on'
          );
        });
    });

    it('Should return an error if an unknown set is requested', () => {
      let promise = ripper.getSetUrlFromSetAbbr('tacobell6969')
      expect(promise).rejects.toThrow(/matchingPair not found/)
    });
  })

  describe('getSetAbbrFromImageUrl', () => {
    it('should throw if not receiving param', () => {
      expect(() => { ripper.getSetAbbrFromImageUrl() }).toThrow(/undefined/)
    })
    it(
      'Should return SSSS when receiving param http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg',
      () => {
        let setAbbr = ripper.getSetAbbrFromImageUrl('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
        expect(setAbbr).toEqual('SSSS');
      }
    )
  })


  describe('getFirstCardImageUrl', () => {
    it(
      'Should accept a set URL and return the image URL for the first card in the set',
      () => {
        return ripper.getFirstCardImageUrl('http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on')
          .then((imageUrl) => {
            expect(imageUrl).toEqual('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
          });
      }
    )
  });

  xdescribe('getImageUrlFromEachSet', () => {
    // @TODO I don't know how to do this without mocking every 100+ set pages, which doesn't seem like a good idea
    it(
      'Should accept no parameters and return an array of objects with sampleCardUrl and setUrl k/v',
      () => {
        return ripper.getImageUrlFromEachSet()
          .then((imageUrls) => {
            let indexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json');
            expect(Array.isArray(imageUrls)).toBe(true);
            expect(imageUrls.length).toBeGreaterThan(94);
            expect(typeof imageUrls[0]).toBe('object');
            expect(typeof imageUrls[0].setUrl).toBe('string');
            expect(typeof imageUrls[0].sampleCardUrl).toBe('string');
          })
      }
    );
  });

  describe('createSetAbbreviationIndex', () => {
    it('should create setAbbrIndex.json in the data folder', () => {
      return ripper.createSetAbbreviationIndex()
        .then((imageUrls) => {
          let indexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json');
          let setAbbrIndex = require(indexPath);
          expect(Array.isArray(setAbbrIndex)).toBe(true);
          expect(typeof setAbbrIndex[0].setUrl).toBe('string');
          expect(typeof setAbbrIndex[0].setAbbr).toBe('string');
        });
    })
  })

  describe('saveCardData', () => {
    it('Should accept an object and return a promise', () => {
      let cardData = require('../fixtures/HMK_01-001.json');
      return expect(ripper.saveCardData(cardData)).resolves.toStrictEqual(expect.anything())
    })
    it('Should resolve to be an {Array} containing paths of image & json on disk', () => {
      let cardData = require('../fixtures/HMK_01-001.json');
      let promise = ripper.saveCardData(cardData)
      return promise.then((res) => {
        const [imagePath, jsonPath] = res
        expect(imagePath).toBe(path.join(__dirname, '..', 'data', 'HMK', '01', 'HMK_01-001.jpg'))
        expect(jsonPath).toBe(path.join(__dirname, '..', 'data', 'HMK', '01', 'HMK_01-001.json'))
      })
    })
  })
})
