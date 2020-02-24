## Functions

<dl>
<dt><a href="#buildImagePath">buildImagePath(imageUrl)</a> ⇒ <code>Promise</code></dt>
<dd><p>buildImagePath</p>
<p>Accepts an image URL as it&#39;s parameter and returns
a string of the perfect path on disk where the image should be saved.
The perfect path includes set abbreviation (ex: HMK,)
release number (ex: 01) and image name. (ex: HMK_01-001.json.)</p>
</dd>
<dt><a href="#buildCardDataPath">buildCardDataPath(cardUrl)</a> ⇒ <code>Promise</code></dt>
<dd><p>buildCardDataPath</p>
<p>Accepts a card URL as it&#39;s parameter and returns a string of the
perfect path on disk where the card data JSON should be saved.
The perfect path includes set abbreviation (ex: HMK,)
release number (ex: 01) and image name. (ex: HMK_01-001.json.)</p>
</dd>
<dt><a href="#downloadImage">downloadImage(targetUrl)</a> ⇒ <code>Promise</code></dt>
<dd><p>downloadImage</p>
<p>Accepts a card image URL OR card URL as it&#39;s parameter and returns
a string of the path on disk where the image was saved.</p>
</dd>
<dt><a href="#ripSetData">ripSetData(setUrl, dataAcc)</a> ⇒ <code>Promise</code></dt>
<dd><p>ripSetData</p>
<p>Accepts a set URL as parameter and returns a list of card URLs
which belong in the set.</p>
</dd>
<dt><a href="#ripCardData">ripCardData(cardUrl)</a> ⇒ <code>Promise</code></dt>
<dd><p>ripCardData</p>
<p>accepts a card URL as it&#39;s parameter and returns an object containing card
data and card image URL.</p>
</dd>
<dt><a href="#writeCardData">writeCardData(cardData)</a> ⇒ <code>Promise</code></dt>
<dd><p>writeCardData</p>
<p>Accepts an object containing card data, and creates a JSON string
which is written to the appropriate location on disk.
To prevent the ripper from destroying local english translations,
writes merge JSON data files rather than blindly overwriting.</p>
</dd>
<dt><a href="#getSetUrls">getSetUrls()</a> ⇒ <code>Promise</code></dt>
<dd><p>getSetUrls</p>
<p>accepts no parameters and returns a list of all set URLs found on p-memories
website.</p>
</dd>
<dt><a href="#ripAll">ripAll()</a> ⇒ <code>Promise</code></dt>
<dd><p>ripAll</p>
<p>accepts no parameters and downloads all card data and card images
found p-memories.com.</p>
</dd>
<dt><a href="#ripUrl">ripUrl(url, throttle, incremental)</a> ⇒ <code>Promise</code></dt>
<dd><p>ripUrl</p>
<p>Rip a resource. Used by the CLI.
url could be one of several resources.</p>
<ul>
<li>Card URL  (defers to ripCardData)</li>
<li>Set URL   (defers to ripSetData)</li>
<li>undefined (defers to ripAll)</li>
</ul>
</dd>
<dt><a href="#identifyUrl">identifyUrl(url)</a> ⇒ <code>String</code></dt>
<dd><p>identifyUrl</p>
<p>Identify the type of URL the user is sending us. Can be either:</p>
<ul>
<li>card URL</li>
<li>Set URL</li>
<li>undefined</li>
</ul>
</dd>
<dt><a href="#rip">rip(options)</a> ⇒ <code>Promise</code></dt>
<dd><p>rip</p>
<p>Rip card data</p>
<p>Determines the correct method to use to rip card data based on input.
Defers to more specific functions for data rippage.</p>
</dd>
<dt><a href="#getSetUrlFromSetAbbr">getSetUrlFromSetAbbr(setAbbr, attemptNumber)</a> ⇒ <code>String</code></dt>
<dd><p>getSetUrlFromSetAbbr</p>
<p>taking a set abbreviation as it&#39;s sole parameter, return a setURL
of the card set.</p>
</dd>
<dt><a href="#getImageUrlFromEachSet">getImageUrlFromEachSet()</a> ⇒ <code>Array</code></dt>
<dd><p>getImageUrlFromEachSet</p>
<p>taking a set abbreviation as it&#39;s sole parameter, return a setURL
of the card set.</p>
</dd>
<dt><a href="#createSetAbbreviationIndex">createSetAbbreviationIndex()</a> ⇒ <code>Array</code></dt>
<dd><p>createSetAbbreviationIndex</p>
<p>Create a mapping of set abbreviations to set urls.
This map is used to get set URLs from a set Abbreviation.</p>
</dd>
<dt><a href="#getSetAbbrFromImageUrl">getSetAbbrFromImageUrl(imageUrl)</a> ⇒ <code>String</code></dt>
<dd><p>getSetAbbrFromImageUrl</p>
<p>Determines the set abbreviation given a card image URL.</p>
</dd>
<dt><a href="#getFirstCardImageUrl">getFirstCardImageUrl(setUrl)</a> ⇒ <code>Promise</code></dt>
<dd><p>getFirstCardImageUrl</p>
<p>Accepts a set URL as parameter and returns the URL of the first card in that set.</p>
</dd>
</dl>

<a name="buildImagePath"></a>

## buildImagePath(imageUrl) ⇒ <code>Promise</code>
buildImagePath

Accepts an image URL as it's parameter and returns
a string of the perfect path on disk where the image should be saved.
The perfect path includes set abbreviation (ex: HMK,)
release number (ex: 01) and image name. (ex: HMK_01-001.json.)

**Kind**: global function  
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
<a name="buildCardDataPath"></a>

## buildCardDataPath(cardUrl) ⇒ <code>Promise</code>
buildCardDataPath

Accepts a card URL as it's parameter and returns a string of the
perfect path on disk where the card data JSON should be saved.
The perfect path includes set abbreviation (ex: HMK,)
release number (ex: 01) and image name. (ex: HMK_01-001.json.)

**Kind**: global function  
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
<a name="downloadImage"></a>

## downloadImage(targetUrl) ⇒ <code>Promise</code>
downloadImage

Accepts a card image URL OR card URL as it's parameter and returns
a string of the path on disk where the image was saved.

**Kind**: global function  
**Returns**: <code>Promise</code> - - A promise that returns an array if resolved
                           or an error if rejected.  
**Resolve**: <code>String</code>        - A string which tells where the image was saved.  
**Rejects**: <code>Error</code>         - An error which states the cause.  

| Param | Type | Description |
| --- | --- | --- |
| targetUrl | <code>String</code> | the URL to the image or card page |

<a name="ripSetData"></a>

## ripSetData(setUrl, dataAcc) ⇒ <code>Promise</code>
ripSetData

Accepts a set URL as parameter and returns a list of card URLs
which belong in the set.

**Kind**: global function  
**Returns**: <code>Promise</code> - - A promise that returns an array if resolved
                         or an error if rejected  
**Resolve**: <code>Array</code>       - A list of card URLs contained in this set.  
**Rejects**: <code>Error</code>       - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| setUrl | <code>String</code> | the URL to the card set |
| dataAcc | <code>Array</code> | array accumulator which contains the list of card                          URLs. Used for recursive calls of this function                          during ripping of multi-page sets. |

<a name="ripCardData"></a>

## ripCardData(cardUrl) ⇒ <code>Promise</code>
ripCardData

accepts a card URL as it's parameter and returns an object containing card
data and card image URL.

**Kind**: global function  
**Returns**: <code>Promise</code> - - A promise that returns an array if resolved
                          or an error if rejected  
**Resolve**: <code>Object</code>       - An object containing card data such as title,
                          description, rarity, type, AP, DP, image URL, etc.  
**Rejects**: <code>Error</code>        - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| cardUrl | <code>String</code> | The URL to the card set |

<a name="writeCardData"></a>

## writeCardData(cardData) ⇒ <code>Promise</code>
writeCardData

Accepts an object containing card data, and creates a JSON string
which is written to the appropriate location on disk.
To prevent the ripper from destroying local english translations,
writes merge JSON data files rather than blindly overwriting.

**Kind**: global function  
**Returns**: <code>Promise</code> - - A promise that returns an array if resolved
                           or an error if rejected  
**Resolve**: <code>String</code>        - The abs location on disk where the JSON was saved.  
**Rejects**: <code>Error</code>         - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| cardData | <code>Object</code> | the card data |

<a name="getSetUrls"></a>

## getSetUrls() ⇒ <code>Promise</code>
getSetUrls

accepts no parameters and returns a list of all set URLs found on p-memories
website.

**Kind**: global function  
**Returns**: <code>Promise</code> - - A promise that returns an array if resolved
                         or an error if rejected  
**Resolve**: <code>Array</code>       - An array containing set URLs  
**Rejects**: <code>Error</code>       - An error which states the cause  
<a name="ripAll"></a>

## ripAll() ⇒ <code>Promise</code>
ripAll

accepts no parameters and downloads all card data and card images
found p-memories.com.

**Kind**: global function  
**Returns**: <code>Promise</code> - - A promise that returns a number if resolved
                         or an error if rejected  
**Resolve**: <code>Number</code>      - The number of card data ripped from p-memories  
**Rejects**: <code>Error</code>       - An error which states the cause  
<a name="ripUrl"></a>

## ripUrl(url, throttle, incremental) ⇒ <code>Promise</code>
ripUrl

Rip a resource. Used by the CLI.
url could be one of several resources.

  * Card URL  (defers to ripCardData)
  * Set URL   (defers to ripSetData)
  * undefined (defers to ripAll)

**Kind**: global function  
**Returns**: <code>Promise</code> - - A promise that returns a number if resolved
                            or an error if rejected  
**Resolve**: <code>Number</code>         - The number of card data ripped  
**Rejects**: <code>Error</code>          - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The URL to rip |
| throttle | <code>Number</code> | Seconds to wait between scrape requests.                             used as a way of being a good neighbor, as making                             request too fast may bog down p-memories website                             for other visitors, and we don't want that! |
| incremental | <code>Boolean</code> | If true, data and images are downloaded                                only if they do not already exist on disk. |

<a name="identifyUrl"></a>

## identifyUrl(url) ⇒ <code>String</code>
identifyUrl

Identify the type of URL the user is sending us. Can be either:

  * card URL
  * Set URL
  * undefined

**Kind**: global function  
**Returns**: <code>String</code> - urlType - either, "card", or "set"  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | the URL to identify |

<a name="rip"></a>

## rip(options) ⇒ <code>Promise</code>
rip

Rip card data

Determines the correct method to use to rip card data based on input.
Defers to more specific functions for data rippage.

**Kind**: global function  
**Returns**: <code>Promise</code> - - A promise that returns a string if resolved
                            or an error if rejected  
**Resolve**: <code>String</code>         - A report of ripped card data  
**Rejects**: <code>Error</code>          - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | The URL to identify |

<a name="getSetUrlFromSetAbbr"></a>

## getSetUrlFromSetAbbr(setAbbr, attemptNumber) ⇒ <code>String</code>
getSetUrlFromSetAbbr

taking a set abbreviation as it's sole parameter, return a setURL
of the card set.

**Kind**: global function  
**Returns**: <code>String</code> - - A p-memories.com card set URL  

| Param | Type | Description |
| --- | --- | --- |
| setAbbr | <code>String</code> | The set abbreviation |
| attemptNumber | <code>Number</code> | the number of times getSetUrlFromSetAbbr has                                 tried. Used to limit recursive calls |

<a name="getImageUrlFromEachSet"></a>

## getImageUrlFromEachSet() ⇒ <code>Array</code>
getImageUrlFromEachSet

taking a set abbreviation as it's sole parameter, return a setURL
of the card set.

**Kind**: global function  
**Returns**: <code>Array</code> - - A p-memories.com card set URL  
<a name="createSetAbbreviationIndex"></a>

## createSetAbbreviationIndex() ⇒ <code>Array</code>
createSetAbbreviationIndex

Create a mapping of set abbreviations to set urls.
This map is used to get set URLs from a set Abbreviation.

**Kind**: global function  
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
<a name="getSetAbbrFromImageUrl"></a>

## getSetAbbrFromImageUrl(imageUrl) ⇒ <code>String</code>
getSetAbbrFromImageUrl

Determines the set abbreviation given a card image URL.

**Kind**: global function  
**Returns**: <code>String</code> - - A p-memories set abbreviation.  

| Param | Type | Description |
| --- | --- | --- |
| imageUrl | <code>String</code> | A p-memories card image URL. |

<a name="getFirstCardImageUrl"></a>

## getFirstCardImageUrl(setUrl) ⇒ <code>Promise</code>
getFirstCardImageUrl

Accepts a set URL as parameter and returns the URL of the first card in that set.

**Kind**: global function  
**Returns**: <code>Promise</code> - - A promise that returns an string if resolved
                         or an error if rejected  
**Resolve**: <code>String</code>      - An image URL of the first card in the set  
**Rejects**: <code>Error</code>       - An error which states the cause  

| Param | Type | Description |
| --- | --- | --- |
| setUrl | <code>String</code> | the URL to the card set |

