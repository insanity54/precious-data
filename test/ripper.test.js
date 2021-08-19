const Ripper = require('../lib/ripper')
const path = require('path')
const Promise = require('bluebird')
const axios = require('axios')
const { Readable } = require('stream');
const { setupRecorder } = require('nock-record');
const fs = require('fs');
const fsp = fs.promises;

const setAbbrIndexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json');
const setAbbrIndexFixturePath = path.join(__dirname, '..', 'fixtures', 'setAbbrIndex.json');
const setAbbrIndexFixture = require(setAbbrIndexFixturePath);
const hmk01001DataPath = path.join(__dirname, '..', 'data', 'HMK', '01', 'HMK_01-001.json');
const hmk01001FixturePath = path.join(__dirname, '..', 'fixtures', 'HMK_01-001.json');
const hmk01001Fixture = require(hmk01001FixturePath);


const record = setupRecorder();



let ripper
beforeEach(() => {
  ripper = new Ripper();
  setAbbrIndexSpy = jest.spyOn(ripper, 'loadSetAbbrIndex');
  setAbbrIndexSpy.mockImplementation(() => {
    return Promise.resolve(setAbbrIndexFixture)
  })
})

describe('Ripper', () => {
  describe('getCardUrlsFromSetPage', () => {
    it(
      'should accept a card number and setUrl and resolve an object with cardUrl and cardImageUrl',
      async () => {
        const { completeRecording, assertScopesFinished } = await record("getCardUrlsFromSetPage");
        const card = await ripper.getCardUrlsFromSetPage('01-050', 'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on')
        completeRecording();
        assertScopesFinished();
        expect(typeof card).toBe('object');
        expect(card).toHaveProperty('cardUrl', 'http://p-memories.com/node/926840');
        expect(card).toHaveProperty('cardImageUrl', 'http://p-memories.com/images/product/SSSS/SSSS_01-050.jpg');
      }
    )
  })

  describe('lookupCardUrl', () => {
    it('should throw an error if not receiving a parameter', () => {
      return expect(() => {
        ripper.lookupCardUrl()
      }).toThrow(/Got undefined/)
    })
    it('should throw an error if receiving an empty string', () => {
      return expect(() => {
        ripper.lookupCardUrl('')
      }).toThrow(/Got an empty string/)
    })
    it(
      'should resolve { cardUrl, cardImageUrl } when given a card ID',
      async () => {
        const { completeRecording, assertScopesFinished } = await record("lookupCardUrl1");
        const card = await ripper.lookupCardUrl('SSSS_01-001')
        completeRecording();
        assertScopesFinished();
        expect(card).toHaveProperty('cardUrl', 'http://p-memories.com/node/926791')
        expect(card).toHaveProperty('cardImageUrl', 'http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg')
      }
    )
  });

  describe('isValidPMemoriesUrl', () => {
    it(
      'should return true when receiving p-memories.com url as param',
      () => {
        let valid = ripper.isValidPMemoriesUrl('http://p-memories.com/node/926791');
        expect(valid).toBeTruthy()
      }
    );
    it(
      'should return true when receiving www.p-memories url as param',
      () => {
        let valid = ripper.isValidPMemoriesUrl('http://www.p-memories.com/node/926791');
        expect(valid).toBeTruthy()
      }
    )
    it('should return false when receiving a foreign url as param', () => {
      let invalid = ripper.isValidPMemoriesUrl('http://google.com');
      expect(invalid).toBeFalsy()
    });
    it('should return false when receiving a card ID', () => {
      let invalid = ripper.isValidPMemoriesUrl('SSSS_01-001')
      expect(invalid).toBeFalsy()
    })
  });

  describe('isLocalData', () => {
    it(
      'should return a promise with true for a card that exists on disk',
      () => {
        let cardData = require('../fixtures/HMK_01-001.json')
        let p = ripper.isLocalData(cardData)
        return expect(p).resolves.toBeTruthy()
      }
    );
    it(
      'should return a promise with false for a card that does not exist on disk',
      () => {
        let fakeCardData = require('../fixtures/BBQ_OZ-541.json');
        let p = ripper.isLocalData(fakeCardData);
        return expect(p).resolves.toBeFalsy();
      }
    );
  });

  describe('getSets', () => {
    it('should resolve a list objects which contains {String} setUrl and {String} setName', async () => {
      const { completeRecording, assertScopesFinished } = await record("getSets");
      const sets = await ripper.getSets()
      completeRecording();
      assertScopesFinished();
      expect(sets).toEqual(expect.arrayContaining([
        {
          setUrl: 'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on',
          setName: 'SSSS.GRIDMAN'
        }
      ]))
    })
  })

  describe('getSetNames', () => {
    it('should resolve a list of {String} setNames', async () => {
      const { completeRecording, assertScopesFinished } = await record("getSetNames1");
      const names = await ripper.getSetNames()
      completeRecording();
      assertScopesFinished();
      expect(names).toEqual(expect.arrayContaining([
        'SSSS.GRIDMAN',
        '初音ミク',
        'ハロー！！きんいろモザイク'
      ]))
    })
  })

  describe('getSetUrls', () => {
    it(
      'should return a list of all set URLs found on p-memories.com',
      async () => {
        const { completeRecording, assertScopesFinished } = await record("placeholder");
        const setList = await ripper.getSetUrls()
        completeRecording();
        assertScopesFinished();
        expect(setList).toBeInstanceOf(Array)
        expect(setList.length).toBeGreaterThanOrEqual(94)
        expect(setList[0]).toEqual(expect.stringMatching(/http:\/\/p-memories.com\/card_product_list_page\?/))
        expect(setList).toEqual(expect.arrayContaining([
          'http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on',
          'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on',
          'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
        ]));
      }
    );
  });




  describe('ripSetData', () => {
    jest.setTimeout(300000) // 5 minutes
    it('should accept a setURL as parameter and return a promise', async () => {
      const { completeRecording, assertScopesFinished } = await record("ripSetData1");
      const imagePromise = ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on');
      await expect(imagePromise).resolves.toStrictEqual(expect.anything())
      completeRecording();
      assertScopesFinished();
    })
    it('should throw if not receiving a setURL as param', () => {
      let promise = ripper.ripSetData()
      return expect(promise).rejects.toThrow(/param/)
    })
    it('should resolve with an array of objects containing cardUrl and cardImageUrl', async () => {
        const { completeRecording, assertScopesFinished } = await record("ripSetData2");
        const data = await ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on')
        completeRecording();
        assertScopesFinished();
        expect(data).toBeArray();
        expect(data.length).toBe(1);
        expect(data[0].cardImageUrl).toBeString();
        expect(data[0].cardUrl).toBeString();
    })
    it('should rip a set which contains more than one page', async () => {
      const { completeRecording, assertScopesFinished } = await record("ripSetData3");
      const data = await ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on')
      completeRecording();
      assertScopesFinished();
      expect(data).toBeArray();
      expect(data.length).toBeGreaterThanOrEqual(403);
    })

    it('should cope with a relative p-memories.com URL', async () => {
      const { completeRecording, assertScopesFinished } = await record("ripSetData4");
      const data = await ripper.ripSetData('/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on')
      completeRecording();
      assertScopesFinished();
      expect(data).toBeInstanceOf(Array)
      expect(data.length).toBe(1)
    })

    it('should download madoka release 03', async () => {
      const { completeRecording, assertScopesFinished } = await record("ripSetData5");
      const setData = await ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=313372-%E5%8A%87%E5%A0%B4%E7%89%88+%E9%AD%94%E6%B3%95%E5%B0%91%E5%A5%B3%E3%81%BE%E3%81%A9%E3%81%8B%E2%98%86%E3%83%9E%E3%82%AE%E3%82%AB&s_flg=on')
      completeRecording();
      assertScopesFinished();
      expect(setData).toBeInstanceOf(Array);
      expect(setData.length).toBeGreaterThan(1);
    })
  })



  describe('ripCardData', () => {
    it('Should throw an error if not receiving any param', () => {
      return expect(() => {
        ripper.ripCardData()
      }).toThrow(/Got undefined/)
    })
    it('Should throw an error if receiving an empty string', () => {
      return expect(() => {
        ripper.ripCardData('')
      }).toThrow(/Got an empty string/)
    })
    it('Should accept a card URL and resolve to card data', async () => {
        const { completeRecording, assertScopesFinished } = await record("ripCardData1");
        const data = await ripper.ripCardData('http://p-memories.com/node/926791')
        completeRecording();
        assertScopesFinished();
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
    });

    it('should accept a card ID as first param', async () => {
      const { completeRecording, assertScopesFinished } = await record("ripCardData2");
      const data = await ripper.ripCardData('http://p-memories.com/node/926791');
      completeRecording();
      assertScopesFinished();
      expect(data).toBeObject()
      expect(data).toHaveProperty('number', '01-001')
      expect(data).toHaveProperty('url', 'http://p-memories.com/node/926791')
      expect(data).toHaveProperty('image', 'http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg')
    });

    xit(
      'should accept a second parameter, a cardImageUrl, which will be used to determine whether or not to make a network request to rip card data.',
      async () => {
        // https://github.com/insanity54/precious-data/issues/4
        const { completeRecording, assertScopesFinished } = await record("ripCardData3");
        const imageStream = await ripper.ripCardData('http://p-memories.com/node/932341', '/images/product/GPFN/GPFN_01-030a.jpg')
        completeRecording();
        assertScopesFinished();
        expect(typeof data).toBe('object');
        expect(data.number).toEqual('01-030a');
        expect(data.url).toEqual('http://p-memories.com/node/932341');
        expect(data.id).toEqual('GPFN 01-030a');
    });


    it('should cope with a relative P-memories URL', async () => {
        const { completeRecording, assertScopesFinished } = await record("ripCardData5");
        const data = await ripper.ripCardData('/node/926791')
        completeRecording();
        assertScopesFinished();
        expect(typeof data).toBe('object');
        expect(data.number).toEqual('01-001');
        expect(data.url).toEqual('http://p-memories.com/node/926791');
    })

  });

  describe('downloadImage', () => {
    jest.setTimeout(20000)
    it(
      'Should accept a card image URL, image and resolve with a Readable stream',
      async () => {

        const { completeRecording, assertScopesFinished } = await record("downloadImage1");
        const imageStream = await ripper.downloadImage('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');

        // put the stream into flowing mode and save the file (straight to /dev/null is fine)
        // so nock actually records the stream's contents
        await new Promise((resolve, reject) => {
          imageStream.pipe(fs.createWriteStream('/dev/null'))
          imageStream.on('end', resolve);
          imageStream.on('error', reject);
        })


        // Complete the recording, allow for Nock to write fixtures
        completeRecording();

        // Optional; assert that all recorded fixtures have been called
        assertScopesFinished();

        // Perform your own assertions
        expect(imageStream).toBeInstanceOf(Readable)
      }
    );
    it(
      'Should accept a card URL, download the card image and resolve with a Readable stream',
      async () => {
        const { completeRecording, assertScopesFinished } = await record("downloadImage2");
        const imageStream = await ripper.downloadImage('http://p-memories.com/node/926791');
        // put the stream into flowing mode and save the file (straight to /dev/null is fine)
        // so nock actually records the stream's contents
        await new Promise((resolve, reject) => {
          imageStream.pipe(fs.createWriteStream('/dev/null'))
          imageStream.on('end', resolve);
          imageStream.on('error', reject);
        })
        completeRecording();
        assertScopesFinished();
        expect(imageStream).toBeInstanceOf(Readable);
      }
    );
    it(
      'should accept a card data object, download the image specified within, and resolve with a Readable stream',
      async () => {
        let cardData = require(path.join(__dirname, '..', 'fixtures', 'HMK_01-001.json'));
        const { completeRecording, assertScopesFinished } = await record("downloadImage3");
        const imageStream = await ripper.downloadImage(cardData);
        // put the stream into flowing mode and save the file (straight to /dev/null is fine)
        // so nock actually records the stream's contents
        await new Promise((resolve, reject) => {
          imageStream.pipe(fs.createWriteStream('/dev/null'))
          imageStream.on('end', resolve);
          imageStream.on('error', reject);
        })
        completeRecording();
        assertScopesFinished();
        expect(imageStream).toBeInstanceOf(Readable);
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
    it('should return a Promise', () => {
      let index = ripper.loadSetAbbrIndex()
      return expect(index).resolves.toStrictEqual(expect.anything())
    })

    it('should resolve with an array of objects containing setAbbr and setUrl keys', () => {
      let index = ripper.loadSetAbbrIndex()
      return expect(index).resolves.toContainEqual({
        setAbbr: 'HMK',
        setUrl: 'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
      })
    })

    it('should reject with an Error if setAbbrIndex.json does not exist', () => {
      setAbbrIndexSpy.mockImplementation(() => {
        return Promise.reject(Error('ENOENT: no such file or directory'))
      })
      let index = ripper.loadSetAbbrIndex()
      return expect(index).rejects.toThrow(/ENOENT/)
    })
  })

  describe('getSetSuggestion', () => {
    const setAbbrIndex = [{
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
      expect(() => {
        ripper.getSetSuggestion()
      }).toThrow()
    })
    it('Should return an {Array} of suggestions', () => {
      let suggestions = ripper.getSetSuggestion(setAbbrIndex, 'OREIMO')
      expect(suggestions.length).toBeGreaterThanOrEqual(2)
      expect(suggestions).toEqual(expect.arrayContaining(['oreimo', 'ORE2']))
    })
  })

  describe('getSetUrlFromSetAbbr', () => {
    it('Should call loadSetAbbrIndex()', () => {
      let url = ripper.getSetUrlFromSetAbbr('HMK');
      expect(setAbbrIndexSpy).toHaveBeenCalled()
    })
    it('Should return a promise', () => {
      let url = ripper.getSetUrlFromSetAbbr('HMK')
      return expect(url).toHaveProperty('then');
    })
    it('Should throw an error if the Set Index does not exist', () => {
      setAbbrIndexSpy.mockImplementation(() => {
        return Promise.reject(Error('ENOENT: no such file or directory'))
      })
      let url = ripper.getSetUrlFromSetAbbr('HMK')
      return expect(url).rejects.toThrow('ENOENT')
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
      expect(() => {
        ripper.getSetAbbrFromImageUrl()
      }).toThrow(/undefined/)
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
      async () => {
        const { completeRecording, assertScopesFinished } = await record("getFirstCardImageUrl1");
        const imageUrl = await ripper.getFirstCardImageUrl('http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on');
        completeRecording();
        assertScopesFinished();
        expect(imageUrl).toEqual('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg')
      })

    it(
      'should return normalized URLs', 
      async () => {
        const { completeRecording, assertScopesFinished } = await record("getFirstCardImageUrl2");
        const imageUrl = await ripper.getFirstCardImageUrl('http://p-memories.com/card_product_list_page?field_title_nid=4539-%E3%82%AA%E3%82%AA%E3%82%AB%E3%83%9F%E3%81%95%E3%82%93%E3%81%A8%E4%B8%83%E4%BA%BA%E3%81%AE%E4%BB%B2%E9%96%93%E3%81%9F%E3%81%A1&s_flg=on')
        completeRecording();
        assertScopesFinished();
        expect(imageUrl).toEqual('http://p-memories.com/images/product/ookami/ookami_01-001.jpg')
      })
    })


  describe('getImageUrlFromEachSet', () => {
    let mockedGetSetUrls
    beforeEach(() => {
      mockedGetSetUrls = jest.spyOn(ripper, 'getSetUrls').mockImplementation(() => {
        return new Promise.resolve([
          'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on',
          'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on',
          'http://p-memories.com/card_product_list_page?field_title_nid=931488-%E3%82%AC%E3%83%BC%E3%83%AB%E3%82%BA%EF%BC%86%E3%83%91%E3%83%B3%E3%83%84%E3%82%A1%E3%83%BC%E3%80%80%E6%9C%80%E7%B5%82%E7%AB%A0&s_flg=on'
        ])
      })
    })
    afterEach(() => {
      mockedGetSetUrls.mockRestore()
    })
    it(
      'Should accept no parameters and return an array of objects with sampleCardUrl and setUrl k/v',
      async () => {
        const { completeRecording, assertScopesFinished } = await record("getImageUrlFromEachSet");
        const imageUrls = await ripper.getImageUrlFromEachSet()
        completeRecording();
        assertScopesFinished();
        expect(imageUrls).toBeArray()
        expect(imageUrls[0]).toBeObject()
        expect(imageUrls[0].setUrl).toBeString()
        expect(imageUrls[0].sampleCardUrl).toBeString()
    })
  });

  describe('createSetAbbreviationIndex', () => {
    let mockedGetSetUrls
    beforeEach(() => {
      mockedGetSetUrls = jest.spyOn(ripper, 'getSetUrls').mockImplementation(() => {
        return new Promise.resolve([
          'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on',
          'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on',
          'http://p-memories.com/card_product_list_page?field_title_nid=931488-%E3%82%AC%E3%83%BC%E3%83%AB%E3%82%BA%EF%BC%86%E3%83%91%E3%83%B3%E3%83%84%E3%82%A1%E3%83%BC%E3%80%80%E6%9C%80%E7%B5%82%E7%AB%A0&s_flg=on'
        ])
      })
    })
    afterEach(() => {
      mockedGetSetUrls.mockRestore()
    })
    it('should create setAbbrIndex.json in the data folder', async () => {
      const { completeRecording, assertScopesFinished } = await record("createSetAbbreviationIndex1");
      const imageUrls = await ripper.createSetAbbreviationIndex();
      completeRecording();
      assertScopesFinished();
      expect(setAbbrIndexPath).toEqual(path.join(__dirname, '..', 'data', 'setAbbrIndex.json'));
    })
  })

})
