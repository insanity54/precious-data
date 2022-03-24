import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

(async () => {
  const db = await open({
    filename: path.join(dataDir, '/precious-data.sqlite'),
    driver: sqlite3.cached.Database
  })

  await db.exec('CREATE TABLE cards (col TEXT)');
  await db.exec('INSERT INTO cards VALUES ("test")');

  const result = await db.run('INSERT INTO cards(col) VALUES (:col)', {
    ':col': 'something'
  })


})()


     // /** Data gathered from the card data table on the webpage */
     // data.number = $('.cardDetail > dl:nth-child(1) > dd:nth-child(2)').text();
     // data.rarity = $('.cardDetail > dl:nth-child(2) > dd:nth-child(2)').text();
     // data.setName = $('.cardDetail > dl:nth-child(3) > dd:nth-child(2)').text();
     // data.name = $('.cardDetail > dl:nth-child(4) > dd:nth-child(2)').text();
     // data.type = $('.cardDetail > dl:nth-child(5) > dd:nth-child(2)').text();
     // data.cost = $('.cardDetail > dl:nth-child(6) > dd:nth-child(2)').text();
     // data.source = $('.cardDetail > dl:nth-child(7) > dd:nth-child(2)').text();
     // data.color = $('.cardDetail > dl:nth-child(8) > dd:nth-child(2)').text();
     // data.characteristic = splitTextList($('.cardDetail > dl:nth-child(9) > dd:nth-child(2)').text());
     // data.ap = $('.cardDetail > dl:nth-child(10) > dd:nth-child(2)').text();
     // data.dp = $('.cardDetail > dl:nth-child(11) > dd:nth-child(2)').text();
     // data.parallel = $('.cardDetail > dl:nth-child(12) > dd:nth-child(2)').text();
     // data.text = $('.cardDetail > dl:nth-child(13) > dd:nth-child(2)').text();
     // data.flavor = $('.cardDetail > dl:nth-child(14) > dd:nth-child(2)').text();

     // /** Data that I think is good which isn't explicitly in the page */

     // data.image = normalizeUrl($('.Images_card > img:nth-child(1)').attr('src'))
     // data.url = `http://p-memories.com/node/${$('body').attr('id').split('-').pop()}`;

     // data.setAbbr = (typeof data.image === 'undefined') ? null : productSetAbbrRegex.exec(data.image)[1];
     // let {
     //   num,
     //   release,
     //   id
     // } = parseCardId(data.image);
     // data.num = num;
     // data.release = release;
     // data.id = id;
     // resolve(data)