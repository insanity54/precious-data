<a name="Ripper"></a>

## Ripper
**Kind**: global class  

* [Ripper](#Ripper)
    * [.buildImagePath(imageUrl)](#Ripper+buildImagePath) ⇒ <code>Promise</code>
    * [.buildCardDataPath(cardUrl)](#Ripper+buildCardDataPath) ⇒ <code>Promise</code>
    * [.downloadImage(targetUrl)](#Ripper+downloadImage) ⇒ <code>Promise</code>
    * [.ripSetData(setUrl, dataAcc)](#Ripper+ripSetData) ⇒ <code>Promise</code>
    * [.isValidPMemoriesUrl(url)](#Ripper+isValidPMemoriesUrl) ⇒ <code>Boolean</code>
    * [.ripCardData(cardUrl, cardImageUrl)](#Ripper+ripCardData) ⇒ <code>Promise</code>
    * [.lookupCardUrl(cardId)](#Ripper+lookupCardUrl) ⇒ <code>Promise</code>
    * [.getCardUrlsFromSetPage()](#Ripper+getCardUrlsFromSetPage)
    * [.writeCardData(cardData)](#Ripper+writeCardData) ⇒ <code>Promise</code>
    * [.readCardData(cardId)](#Ripper+readCardData) ⇒ <code>Promise</code>
    * [.getSetUrls()](#Ripper+getSetUrls) ⇒ <code>Promise</code>
    * [.ripCardDataAndSave()](#Ripper+ripCardDataAndSave)
    * [.ripAll()](#Ripper+ripAll) ⇒ <code>Promise</code>
    * [.ripUrl(url)](#Ripper+ripUrl) ⇒ <code>Promise</code>
    * [.saveCardData(cardData)](#Ripper+saveCardData) ⇒ <code>Promise</code>
    * [.isLocalData(cardData)](#Ripper+isLocalData) ⇒ <code>Promise</code>
    * [.isLocalCard(cardId)](#Ripper+isLocalCard) ⇒ <code>Promise</code>
    * [.identifyUrl(url)](#Ripper+identifyUrl) ⇒ <code>String</code>
    * [.rip()](#Ripper+rip) ⇒ <code>Promise</code>
    * [.getSetUrlFromSetAbbr(setAbbr, attemptNumber)](#Ripper+getSetUrlFromSetAbbr) ⇒ <code>Promise</code>
    * [.getImageUrlFromEachSet()](#Ripper+getImageUrlFromEachSet) ⇒ <code>Array</code>
    * [.createSetAbbreviationIndex()](#Ripper+createSetAbbreviationIndex) ⇒ <code>Array</code>
    * [.getSetAbbrFromImageUrl(imageUrl)](#Ripper+getSetAbbrFromImageUrl) ⇒ <code>String</code>
    * [.getFirstCardImageUrl(setUrl)](#Ripper+getFirstCardImageUrl) ⇒ <code>Promise</code>
    * [.parseCardId(cardId)](#Ripper+parseCardId) ⇒ <code>Promise</code>

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

Accepts a card image URL OR card URL as it's parameter and returns
a string of the path on disk where the image was saved.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns an array if resolved
                           or an error if rejected.  
**Resolve**: <code>String</code>        - A string which tells where the image was saved.  
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
| dataAcc | <code>Array</code> | object accumulator which contains a list of card                          URLs and cardImageUrls.                          Used for recursive calls of this function                          during ripping of multi-page sets. |

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

### ripper.ripCardData(cardUrl, cardImageUrl) ⇒ <code>Promise</code>
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
| cardUrl | <code>String</code> | The URL to the card set |
| cardImageUrl | <code>String</code> | The URL to the card image |

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
<a name="Ripper+writeCardData"></a>

### ripper.writeCardData(cardData) ⇒ <code>Promise</code>
writeCardData

Accepts an object containing card data, and creates a JSON string
which is written to the appropriate location on disk.
To prevent the ripper from destroying local english translations,
writes merge JSON data files rather than blindly overwriting.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns an array if resolved
                           or an error if rejected  
**Resolve**: <code>String</code>        - The abs location on disk where the JSON was saved.  
**Rejects**: <code>Error</code>         - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| cardData | <code>Object</code> | the card data |

<a name="Ripper+readCardData"></a>

### ripper.readCardData(cardId) ⇒ <code>Promise</code>
readCardData

reads the card data on disk

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns an object if resolved
                           or an error if rejected  
**Resolve**: <code>Object</code>        - the card data read from disk  
**Rejects**: <code>Error</code>  

| Param | Type | Description |
| --- | --- | --- |
| cardId | <code>String</code> | the card ID number. |

**Example**  
```js
readCardData('HMK_01-001');
```
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
<a name="Ripper+ripCardDataAndSave"></a>

### ripper.ripCardDataAndSave()
ripCardDataAndSave

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
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

Download the card data and image file only if it doesn't already exist
locally.

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

<a name="Ripper+isLocalCard"></a>

### ripper.isLocalCard(cardId) ⇒ <code>Promise</code>
isLocalCard

Returns a promise of True or False depending on whether or not the
card data exists on disk.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Resolve**: <code>Boolean</code>  
**Rejects**: <code>Error</code>  

| Param | Type |
| --- | --- |
| cardId | <code>String</code> | 

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
<a name="Ripper+getSetUrlFromSetAbbr"></a>

### ripper.getSetUrlFromSetAbbr(setAbbr, attemptNumber) ⇒ <code>Promise</code>
getSetUrlFromSetAbbr

taking a set abbreviation as it's sole parameter, return a setURL
of the card set.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns a string if resolved
                            or an error if rejected  
**Resolve**: <code>String</code>         - A p-memories.com card set URL  
**Rejects**: <code>Error</code>          - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| setAbbr | <code>String</code> | The set abbreviation |
| attemptNumber | <code>Number</code> | the number of times getSetUrlFromSetAbbr has |

<a name="Ripper+getImageUrlFromEachSet"></a>

### ripper.getImageUrlFromEachSet() ⇒ <code>Array</code>
getImageUrlFromEachSet

taking a set abbreviation as it's sole parameter, return a setURL
of the card set.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Array</code> - - A p-memories.com card set URL  
<a name="Ripper+createSetAbbreviationIndex"></a>

### ripper.createSetAbbreviationIndex() ⇒ <code>Array</code>
createSetAbbreviationIndex

Create a mapping of set abbreviations to set urls.
This map is used to get set URLs from a set Abbreviation.

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Array</code> - - An array of setAbbr/setUrl pairs  
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

<a name="Ripper+parseCardId"></a>

### ripper.parseCardId(cardId) ⇒ <code>Promise</code>
parseCardId

parses the card ID and returns an object containing
  * setAbbr
  * release
  * number
  * num
  * id
  * variation

**Kind**: instance method of [<code>Ripper</code>](#Ripper)  
**Returns**: <code>Promise</code> - - A promise that returns an object if resolved
                         or an error if rejected  
**Resolve**: <code>Object</code>  
**Rejects**: <code>Error</code>  

| Param | Type |
| --- | --- |
| cardId | <code>String</code> | 

