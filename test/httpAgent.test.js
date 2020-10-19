
const { httpAgent, normalizeUrl } = require('../lib/httpAgent')

describe('httpAgent module', () => {
  xdescribe('httpAgent', () => {

  })
  describe('normalizeUrl', () => {
    it('should take a partial URL and make it a full URL.', () => {
      let url = normalizeUrl('/card_product_list_page?page=1&field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on');
      expect(url).toEqual(
        'http://p-memories.com/card_product_list_page?page=1&field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
      )
    });
  });
})
