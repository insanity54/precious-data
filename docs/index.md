## Classes

<dl>
<dt><a href="#Ripper">Ripper</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#splitTextList">splitTextList(textList)</a> ⇒ <code>Array</code></dt>
<dd><p>splitTextList</p>
<p>converts a {String} list such as &#39;&#39; to an array, using comma as delimiter</p>
</dd>
<dt><a href="#parseCardDataFromHtml">parseCardDataFromHtml(html)</a> ⇒ <code>Promise</code></dt>
<dd><p>parseCardDataFromHtml</p>
</dd>
<dt><a href="#parseCardId">parseCardId(cardId)</a> ⇒ <code>Promise</code></dt>
<dd><p>parseCardId</p>
<p>parses the card ID and returns an object containing</p>
<ul>
<li>setAbbr</li>
<li>release</li>
<li>number</li>
<li>num</li>
<li>id</li>
<li>variation</li>
</ul>
</dd>
</dl>

<a name="Ripper"></a>

## Ripper
**Kind**: global class  

* [Ripper](#Ripper)
    * [.buildImagePath(imageUrl)](#Ripper+buildImagePath) ⇒ <code>Promise</code>
    * [.buildCardDataPath(cardUrl)](#Ripper+buildCardDataPath) ⇒ <code>Promise</code>
    * [.downloadImage(targetUrl)](#Ripper+downloadImage) ⇒ <code>Promise</code>
    * [.ripSetData(setUrl, dataAcc)](#Ripper+ripSetData) ⇒ <code>Promise</code>
    * [.isValidPMemoriesUrl(url)](#Ripper+isValidPMemoriesUrl) ⇒ <code>Boolean</code>
    * [.ripCardData(cardRef)](#Ripper+ripCardData) ⇒ <code>Promise</code>
    * [.lookupCardUrl(cardId)](#Ripper+lookupCardUrl) ⇒ <code>Promise</code>
    * [.getCardUrlsFromSetPage()](#Ripper+getCardUrlsFromSetPage)
    * [.getSets()](#Ripper+getSets) ⇒ <code>Promise</code>
    * [.getSetNames()](#Ripper+getSetNames) ⇒ <code>Promise</code>
    * [.getSetUrls()](#Ripper+getSetUrls) ⇒ <code>Promise</code>
    * [.ripAll()](#Ripper+ripAll) ⇒ <code>Promise</code>
    * [.ripUrl(url)](#Ripper+ripUrl) ⇒ <code>Promise</code>
    * [.saveCardData(cardData)](#Ripper+saveCardData) ⇒ <code>Promise</code>
    * [.isLocalData(cardData)](#Ripper+isLocalData) ⇒ <code>Promise</code>
    * [.identifyUrl(url)](#Ripper+identifyUrl) ⇒ <code>String</code>
    * [.rip()](#Ripper+rip) ⇒ <code>Promise</code>
    * [.loadSetAbbrIndex()](#Ripper+loadSetAbbrIndex) ⇒ <code>Promise</code>
    * [.getSetSuggestion(setAbbrIndex, setSuggestion)](#Ripper+getSetSuggestion) ⇒ <code>String</code> \| <code>undefined</code>
    * [.getSetUrlFromSetAbbr(setAbbr)](#Ripper+getSetUrlFromSetAbbr) ⇒ <code>Promise</code>
    * [.getImageUrlFromEachSet()](#Ripper+getImageUrlFromEachSet) ⇒ <code>Promise</code>
    * [.createSetAbbreviationIndex()](#Ripper+createSetAbbreviationIndex) ⇒ <code>Promise</code>
    * [.getSetAbbrFromImageUrl(imageUrl)](#Ripper+getSetAbbrFromImageUrl) ⇒ <code>String</code>
    * [.getFirstCardImageUrl(setUrl)](#Ripper+getFirstCardImageUrl) ⇒ <code>Promise</code>

<a name="Ripper+buildImagePath"></a>

### ripper.buildImagePath(imageUrl) ⇒ <code>Promise</code>
buildImagePath

Accepts an image URL as it's parameter and returns
a string of the perfect path on disk where the image should be saved.
The perfect path includes set abbreviation (ex: HMK,)
release number (ex: 01) and image name. (ex: HMK_01-001.json.)

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns an array if resolved
                           or an error if rejected.  
**Resolve**: <code>String</code>        - An absolute path on disk.  
**Rejects**: <code>Error</code>         - An error which states the cause.  

| Param | Type | Description |
| --- | --- | --- |
| imageUrl | <code>String</code> | the URL to the image. |

**Example**  
```js
buildImagePath('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg')
  => "@/data/SSSS/01/SSSS_01-001.jpg" (where @ is this project root.)
```
<a name="Ripper+buildCardDataPath"></a>

### ripper.buildCardDataPath(cardUrl) ⇒ <code>Promise</code>
buildCardDataPath

Accepts a card URL as it's parameter and returns a string of the
perfect path on disk where the card data JSON should be saved.
The perfect path includes set abbreviation (ex: HMK,)
release number (ex: 01) and image name. (ex: HMK_01-001.json.)

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns a string if resolved
                           or an error if rejected.  
**Resolve**: <code>String</code>        - An absolute path on disk.  
**Rejects**: <code>Error</code>         - An error which states the cause.  

| Param | Type | Description |
| --- | --- | --- |
| cardUrl | <code>String</code> | the URL to the card page on p-memories website. |

**Example**  
```js
buildCardDataPath({"set": "HMK", "number": "01-001", ... })
         => "@/data/HMK/01/HMK_01-001.json" (where @ is project root)
```
<a name="Ripper+downloadImage"></a>

### ripper.downloadImage(targetUrl) ⇒ <code>Promise</code>
downloadImage

Downloads an image from the internet and saves it to disk.
Accepts a card image URL OR card URL as it's parameter.
Returns a string of the path on disk where the image was saved.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns an array if resolved
                           or an error if rejected.  
**Resolve**: <code>Buffer</code>        - A buffer of the downloaded image.  
**Rejects**: <code>Error</code>         - An error which states the cause.  

| Param | Type | Description |
| --- | --- | --- |
| targetUrl | <code>String</code> | the URL to the image or card page |

<a name="Ripper+ripSetData"></a>

### ripper.ripSetData(setUrl, dataAcc) ⇒ <code>Promise</code>
ripSetData

Accepts a set URL as parameter and returns a list of card URLs
which belong in the set.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns an Array if resolved
                         or an error if rejected  
**Resolve**: <code>Array</code> setData - An array of objects which contain cardUrl and cardImageUrl  
**Rejects**: <code>Error</code>       - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| setUrl | <code>String</code> | the URL to the card set |
| dataAcc | <code>Array</code> \| <code>undefined</code> | object accumulator which contains a list of card                          URLs and cardImageUrls.                          Used for recursive calls of this function                          during ripping of multi-page sets. |

<a name="Ripper+isValidPMemoriesUrl"></a>

### ripper.isValidPMemoriesUrl(url) ⇒ <code>Boolean</code>
isValidPMemoriesUrl

Returns true or false depending on whether or not a valid P-memories.com
URL was passed as parameter.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Boolean</code> - isValid - true if the url was p-memories.com url, false otherwise.  

| Param | Type |
| --- | --- |
| url | <code>String</code> | 

<a name="Ripper+ripCardData"></a>

### ripper.ripCardData(cardRef) ⇒ <code>Promise</code>
ripCardData

accepts a card URL as it's parameter and returns an object containing card
data and card image URL.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns an array if resolved
                          or an error if rejected  
**Resolve**: <code>Object</code>       - An object containing card data such as title,
                          description, rarity, type, AP, DP, image URL, etc.  
**Rejects**: <code>Error</code>        - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| cardRef | <code>String</code> | A reference to a specific card. Can be a URL                           or a Card ID |

<a name="Ripper+lookupCardUrl"></a>

### ripper.lookupCardUrl(cardId) ⇒ <code>Promise</code>
lookupCardUrl

Accepts a card ID as parameter, and resolves the appropriate cardUrl and
cardImageUrl belonging to that card.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns an object if resolved
                           or an error if rejected  
**Resolve**: <code>Object</code> card  
**Resolve**: <code>String</code> card.cardUrl       - the url to the card page.
                                       Example: http://p-memories.com/node/926791  
**Resolve**: <code>String</code> card.cardImageUrl  - the image url of the card.
                                       Example: http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg  

| Param | Type |
| --- | --- |
| cardId | <code>String</code> | 

<a name="Ripper+getCardUrlsFromSetPage"></a>

### ripper.getCardUrlsFromSetPage()
getCardUrlsFromSetPage

Accepts a cardNumber and setUrl as parameters, and returns
an object with cardUrl, and cardImageUrl.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
<a name="Ripper+getSets"></a>

### ripper.getSets() ⇒ <code>Promise</code>
getSets

Gets a list of set names and urls on the p-memories.com

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Rejects**: <code>Error</code>  
**Resolve**: <code>Array</code>       - An array containing objects in the shape
                                              { setName, setUrl }  
<a name="Ripper+getSetNames"></a>

### ripper.getSetNames() ⇒ <code>Promise</code>
getSetNames

accepts no params and returns a list of set names found on p-memories.com

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Resolve**: <code>Array</code>  
**Rejects**: <code>Error</code>  
<a name="Ripper+getSetUrls"></a>

### ripper.getSetUrls() ⇒ <code>Promise</code>
getSetUrls

accepts no parameters and returns a list of all set URLs found on p-memories
website.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns an array if resolved
                         or an error if rejected  
**Resolve**: <code>Array</code>       - An array containing set URLs  
**Rejects**: <code>Error</code>       - An error which states the cause  
<a name="Ripper+ripAll"></a>

### ripper.ripAll() ⇒ <code>Promise</code>
ripAll

accepts no parameters and downloads all card data and card images
found p-memories.com.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns a number if resolved
                         or an error if rejected  
**Resolve**: <code>Number</code>      - The number of card data ripped from p-memories  
**Rejects**: <code>Error</code>       - An error which states the cause  
<a name="Ripper+ripUrl"></a>

### ripper.ripUrl(url) ⇒ <code>Promise</code>
ripUrl

Rip a resource. Used by the CLI.
url could be one of several resources.

  * Card URL  (defers to ripCardData)
  * Set URL   (defers to ripSetData)
  * undefined (defers to ripAll)

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns a number if resolved
                            or an error if rejected  
**Resolve**: <code>Number</code>         - The number of card data ripped  
**Rejects**: <code>Error</code>          - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The URL to rip |

<a name="Ripper+saveCardData"></a>

### ripper.saveCardData(cardData) ⇒ <code>Promise</code>
saveCardData

Download the card data and image file

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns a number if resolved
                            or an error if rejected  
**Resolve**: <code>Array</code>          - An array containing result of this.downloadImage
                            and this.writeCardData.  
**Rejects**: <code>Error</code>          - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| cardData | <code>Object</code> | The cardData |

<a name="Ripper+isLocalData"></a>

### ripper.isLocalData(cardData) ⇒ <code>Promise</code>
isLocalData

Returns a promise of True or False depending on whether or not the
card data exists on disk.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Resolve**: <code>Boolean</code>  
**Rejects**: <code>Error</code>  

| Param | Type |
| --- | --- |
| cardData | <code>Object</code> | 

<a name="Ripper+identifyUrl"></a>

### ripper.identifyUrl(url) ⇒ <code>String</code>
identifyUrl

Identify the type of URL the user is sending us. Can be either:

  * card URL
  * Set URL
  * undefined

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>String</code> - urlType - either, "card", or "set"  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | the URL to identify |

<a name="Ripper+rip"></a>

### ripper.rip() ⇒ <code>Promise</code>
rip

Rip card data

Determines the correct method to use to rip card data based on input.
Defers to more specific functions for data rippage.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns a string if resolved
                            or an error if rejected  
**Resolve**: <code>String</code>         - A report of ripped card data  
**Rejects**: <code>Error</code>          - An error which states the cause  
<a name="Ripper+loadSetAbbrIndex"></a>

### ripper.loadSetAbbrIndex() ⇒ <code>Promise</code>
loadSetAbbrIndex

load the Set Abbreviation Index from disk

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns an Array if resolved  
**Resolve**: <code>Array</code>          - The set abbreviation list  
**Rejects**: <code>Error</code>          - An error which states the cause  
**Todo**

- [ ] https://github.com/insanity54/precious-data/issues/5

<a name="Ripper+getSetSuggestion"></a>

### ripper.getSetSuggestion(setAbbrIndex, setSuggestion) ⇒ <code>String</code> \| <code>undefined</code>
getSetSuggestion

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>String</code> \| <code>undefined</code> - setSuggestion  

| Param | Type |
| --- | --- |
| setAbbrIndex | <code>Array</code> | 
| setSuggestion | <code>String</code> | 

<a name="Ripper+getSetUrlFromSetAbbr"></a>

### ripper.getSetUrlFromSetAbbr(setAbbr) ⇒ <code>Promise</code>
getSetUrlFromSetAbbr

taking a set abbreviation as it's sole parameter, resolve a setURL
of the matching card set.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns a string if resolved
                            or an error if rejected  
**Resolve**: <code>String</code>         - A p-memories.com card set URL  
**Rejects**: <code>Error</code>          - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| setAbbr | <code>String</code> | The set abbreviation |

<a name="Ripper+getImageUrlFromEachSet"></a>

### ripper.getImageUrlFromEachSet() ⇒ <code>Promise</code>
getImageUrlFromEachSet

Returns an array containing the url of the first card of each set
of the card set.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Resolves**: <code>Array</code>         - A p-memories.com card set URL  
**Example**  
```js
[
       {
         setUrl: 'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on',
         sampleCardUrl: 'http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg'
       }
       (...)
     ]
```
<a name="Ripper+createSetAbbreviationIndex"></a>

### ripper.createSetAbbreviationIndex() ⇒ <code>Promise</code>
createSetAbbreviationIndex

Create a mapping of set abbreviations to set urls.
This map is used to get set URLs from a set Abbreviation.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Resolves**: <code>String</code>         - An stringified array of setAbbr/setUrl pairs  
**Example**  
```js
[
    {
      "setAbbr": "SSSS",
      "setUrl": "http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on"
    },
    ...
 ]
```
<a name="Ripper+getSetAbbrFromImageUrl"></a>

### ripper.getSetAbbrFromImageUrl(imageUrl) ⇒ <code>String</code>
getSetAbbrFromImageUrl

Determines the set abbreviation given a card image URL.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>String</code> - - A p-memories set abbreviation.  

| Param | Type | Description |
| --- | --- | --- |
| imageUrl | <code>String</code> | A p-memories card image URL. |

<a name="Ripper+getFirstCardImageUrl"></a>

### ripper.getFirstCardImageUrl(setUrl) ⇒ <code>Promise</code>
getFirstCardImageUrl

Accepts a set URL as parameter and returns the URL of the first card in that set.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns an string if resolved
                         or an error if rejected  
**Resolve**: <code>String</code>      - An image URL of the first card in the set  
**Rejects**: <code>Error</code>       - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| setUrl | <code>String</code> | the URL to the card set |

<a name="splitTextList"></a>

## splitTextList(textList) ⇒ <code>Array</code>
splitTextList

converts a {String} list such as '' to an array, using comma as delimiter

**Kind**: global function  
**Returns**: <code>Array</code> - list  

| Param | Type |
| --- | --- |
| textList | <code>String</code> | 

<a name="parseCardDataFromHtml"></a>

## parseCardDataFromHtml(html) ⇒ <code>Promise</code>
parseCardDataFromHtml

**Kind**: global function  
**Returns**: <code>Promise</code> - - A promise which resolves with an object if successful
                           or an error if failed  
**Resolve**: <code>Object</code>        - An object containing card data such as title,
                           description, rarity, type, AP, DP, image URL, etc.  
**Rejects**: <code>Error</code>         - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| html | <code>String</code> | the html to parse |

<a name="parseCardId"></a>

## parseCardId(cardId) ⇒ <code>Promise</code>
parseCardId

parses the card ID and returns an object containing
  * setAbbr
  * release
  * number
  * num
  * id
  * variation

**Kind**: global function  
**Returns**: <code>Promise</code> - - A promise that returns an object if resolved
                         or an error if rejected  
**Resolve**: <code>Object</code>  
**Rejects**: <code>Error</code>  

| Param | Type |
| --- | --- |
| cardId | <code>String</code> | 

