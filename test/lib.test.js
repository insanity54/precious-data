
const Ripper = require('../lib/ripper');
const path = require('path');
const Promise = require('bluebird')
jest.mock('fs')



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
    it(
      'should resolve { cardUrl, cardImageUrl } when given a card ID',
      () => {
        return ripper.lookupCardUrl('SSSS_01-001').then((card) => {
          expect(typeof card).toBe('object');
          expect(card.cardUrl).toEqual('http://p-memories.com/node/926791');
          expect(card.cardImageUrl).toEqual('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
        });
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
    for Rubular testing:

/images/product/PM_HS/PM_HS_01-002.jpg
PM_HS_03-008
http://p-memories.com/images/product/GPFN/GPFN_01-030a.jpg
SSSS_P-001
http://p-memories.com/images/product/HMK/HMK_01-001.jpg
/images/product/PM_K-ON_Part2/PM_K-ON_Part2_02-048.jpg

     */
    it(
      'should return an object with setAbbr, release, number, and num',
      () => {
        let p = ripper.parseCardId('HMK_01-001');
        expect(p.setAbbr).toEqual('HMK');
        expect(p.release).toEqual('01');
        expect(p.number).toEqual('01-001');
        expect(p.num).toEqual('001');
        expect(p.id).toEqual('HMK_01-001');
        expect(p.variation).toEqual('');
      }
    );

    it('should accept a relative image URL as param', () => {
      let p = ripper.parseCardId('/images/product/YYY2/YYY2_02-001.jpg');
      expect(p.setAbbr).toEqual('YYY2');
      expect(p.release).toEqual('02');
      expect(p.number).toEqual('02-001');
      expect(p.num).toEqual('001');
      expect(p.id).toEqual('YYY2_02-001');
      expect(p.variation).toEqual('');
    });

    it('should accept an image URL as param', () => {
      let p = ripper.parseCardId('http://p-memories.com/images/product/HMK/HMK_01-001.jpg');
      expect(p.setAbbr).toEqual('HMK');
      expect(p.release).toEqual('01');
      expect(p.number).toEqual('01-001');
      expect(p.num).toEqual('001');
      expect(p.id).toEqual('HMK_01-001');
      expect(p.variation).toEqual('');
    });

    it('should reject when the card ID is not valid', () => {
      expect(ripper.parseCardId.bind(ripper, 'tacobell')).toThrow();
    });

    it('should handle a card ID with a letter as the release', () => {
      let p = ripper.parseCardId('SSSS_P-001');
      expect(p.setAbbr).toEqual('SSSS');
      expect(p.release).toEqual('P');
      expect(p.number).toEqual('P-001');
      expect(p.num).toEqual('001');
      expect(p.id).toEqual('SSSS_P-001');
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
        expect(p.id).toEqual('GPFN_01-030a');
        expect(p.variation).toEqual('a');
      }
    )

    it('should handle a card ID an underscore in the setAbbr', () => {
      let p = ripper.parseCardId('PM_HS_03-008');
      expect(p.setAbbr).toEqual('PM_HS');
      expect(p.release).toEqual('03');
      expect(p.number).toEqual('03-008');
      expect(p.num).toEqual('008');
      expect(p.id).toEqual('PM_HS_03-008');
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
        expect(p.id).toEqual('PM_HS_01-002')
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
        expect(p.id).toEqual('PM_K-ON_Part2_02-048')
        expect(p.variation).toEqual('')
      }
    );

    it('should handle GPFN_P-004a', () => {
      let p = ripper.parseCardId('GPFN_P-004a');
      expect(p.setAbbr).toEqual('GPFN')
      expect(p.release).toEqual('P')
      expect(p.number).toEqual('P-004a')
      expect(p.num).toEqual('004')
      expect(p.id).toEqual('GPFN_P-004a')
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


  describe('normalizeUrl', () => {
    it('should take a partial URL and make it a full URL.', () => {
      let url = ripper.normalizeUrl('/card_product_list_page?page=1&field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on');
      expect(url).toEqual(
        'http://p-memories.com/card_product_list_page?page=1&field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
      )
    });
  });

  describe('ripSetData', () => {
    it(
      'should return an array of objects containing cardUrl and cardImageUrl',
      () => {
        // @TODO this is an integration test and it doesn't belong with unit tests
        return ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on')
          .then((data) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBe(1);
            expect(typeof data[0].cardImageUrl).toBe('string');
            expect(typeof data[0].cardUrl).toBe('string');
          });
      }
    );

    xit('should rip a set which contains more than one page', function () {
      // @TODO this is an integration test and it doesn't belong with unit tests
      return ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on')
        .then((data) => {
          expect(Array.isArray(data)).toBe(true);
          expect(data.length).toBe(403);
        });
    });

    xit('should cope with a relative p-memories.com URL', function () {
      // @TODO this is an integration test and it doesn't belong with unit tests
      return ripper.ripSetData('/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on')
        .then((data) => {
          expect(Array.isArray(data)).toBe(true);
          expect(data.length).toBe(1);
        });
    });

    xit('should download madoka release 03', function () {
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

  describe('ripCardById', () => {
    it('should accept a card ID as param and rip the card to disk', () => {
      return ripper.ripCardById('ERMG_01-001').then((writeResult) => {
        expect(typeof writeResult).toBe('object');
        expect(writeResult).toHaveProperty('imagePath')
        expect(writeResult).toHaveProperty('dataPath')
      });
    })
  })

  describe('ripCardData', () => {
    it('Should get card data from a card URL', () => {
      return ripper
      .ripCardData('http://p-memories.com/node/926791')
      .then((data) => {
        expect(typeof data).toBe('object');
        expect(data.number).toEqual('01-001');
        expect(data.rarity).toEqual('SR');
        expect(data.setName).toEqual('SSSS.GRIDMAN');
        expect(data.name).toEqual('響 裕太');
        expect(data.type).toEqual('キャラクター');
        expect(data.usageCost).toEqual('6');
        expect(data.outbreakCost).toEqual('3');
        expect(data.color).toEqual('赤');
        expect(data.characteristic).toEqual('制服');
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
        expect(data.id).toEqual('SSSS_01-001');
        expect(data.num).toEqual('001');
        expect(data.release).toEqual('01');
      });
    });

    it('should accept a card ID as first param', () => {
      return ripper.ripCardData('MZK_01-001').then((data) => {
        expect(typeof data).toBe('object');
        expect(data.number).toEqual('01-001');
        expect(data.url).toEqual('http://p-memories.com/node/942168');
        expect(data.image).toEqual('http://p-memories.com/images/product/MZK/MZK_01-001.jpg');
      });
    });

    it(
      'should accept a second parameter, a cardImageUrl, which will be used to determine whether or not to make a network request to rip card data.',
      () => {
        return ripper
        .ripCardData('http://p-memories.com/node/932341', '/images/product/GPFN/GPFN_01-030a.jpg')
        .then((data) => {
          expect(typeof data).toBe('object');
          expect(data.number).toEqual('01-030a');
          expect(data.url).toEqual('http://p-memories.com/node/932341');
          expect(data.id).toEqual('GPFN_01-030a');
        });
      }
    );

    it(
      'should return a promise which rejects with an error if receiving a URL to a card which has already been downloaded',
      () => {
        let targetCardPath = path.join(__dirname, '..', 'data', 'HMK', '01', 'HMK_01-001.json')
        let creationTimeBefore = fs.statSync(targetCardPath).mtimeMs;
        let cd = ripper.ripCardData('http://p-memories.com/node/383031', 'http://p-memories.com/images/product/HMK/HMK_01-001.jpg');
        return expect(cd).rejects.toThrow(/EEXIST/)
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
      const index = jest.mock(ripper, 'loadSetAbbrIndex').mockImplementation(() => undefined)
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
        return ripper.getFirstCardImageUrl('http://p-memories.com/card_product_list_page?field_title_nid=31466-%E9%9B%BB%E6%B3%A2%E5%A5%B3%E3%81%A8%E9%9D%92%E6%98%A5%E7%94%B7&s_flg=on')
          .then((imageUrl) => {
            expect(imageUrl).toEqual('http://p-memories.com/images/product/DNP/DNP_01-001.jpg');
          });
      }
    )
  });

  describe('getImageUrlFromEachSet', () => {
    it(
      'Should accept no parameters and return an array of objects with sampleCardUrl and setUrl k/v',
      () => {
        return ripper.getImageUrlFromEachSet()
          .then((imageUrls) => {
            let indexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json');
            expect(Array.isArray(imageUrls)).toBe(true);
            expect(imageUrls.length).toBe(94);
            expect(typeof imageUrls[0]).toBe('object');
            expect(typeof imageUrls[0].setUrl).toBe('string');
            expect(typeof imageUrls[0].sampleCardUrl).toBe('string');
            expect(imageUrls).toEqual(
              expect.arrayContaining(['http://p-memories.com/images/product/DNP/DNP_01-001.jpg'])
            );
          });
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
