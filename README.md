# Precious Data

*a.k.a. Pirate Memories because that's more fun.*

Precious Data is a project to copy and mirror trading card data from the official Precious Memories (P-Memories) website.

P-Memories is a Japanese exclusive card game with card titles, text, and flavor text primarily written in Hiragana, Katakana, and Kanji.

The goal of this project is to create a dataset of English translated P-Memories cards. With this dataset, myself and third-parties will be empowered to create apps which encourage English speaking players to better enjoy P-Memories card game.

## What the Precious Data project does

Precious Data has three parts.

### 1) Data Ripper

The data ripper uses Javascript to request, parse, and organize card data from P-Memories.com. Once parsed, card data is saved on disk in set-labelled folders as JSON files. Because of the nature of this script, this functionality is throttled, and not meant to be used often, as doing so too fast or too often could be seen as malicious.

Additionally, card images are downloaded and stored on disk in the same set-labelled folders.

For example, cards belonging to the Hatsune Miku card set will be saved in the abbreviated set-labelled folder, `HMK`. SSSS.GRIDMAN cards are saved in the set-labelled folder, `SSSS`.

As future updates and additions to P-Memories cards are anticipated, the ripper is smart enough to merge official data with unofficial translations. This means that the card JSON files are safe to edit manually, and work will not be lost during future data rips.

#### Usage:

    npm run rip

#### Advanced Usage:

Advanced usage of the CLI tool `p-data.js` allows the user to download specific sets, specific URLs, or all precious-memories cards in existence. The `-i` (incremental) flag can significantly reduce network usage by only downloading card data which has not already been downloaded.

##### Examples

Download all cards in the Hatsune Miku set.

    ./p-data.js rip -s HMK

Download a card from a p-memories.com URL

    ./p-data.js rip -u http://p-memories.com/node/942168

Download a card given it's unique ID

    ./p-data.js rip -n ERMG_01-001

Download all P-Memories cards in existence.

    ./p-data.js rip -a

Download all cards in existence, waiting 3 seconds between each network request. Only download card data which hasn't already been downloaded.

    ./p-data.js rip -a -t 3 -i

Show commandline usage and help

    ./p-data.js -h
    ./p-data.js rip -h


### 2) Data Display

JSON is not a good way for humans to look through large collections of data. For this reason, Precious Data has a simple HTML display of the downloaded card data.

This data display is meant to be a quick way to browse card data and verify that the data ripper ran successfully and produced a good dataset. It is not meant to be a full featured card browser with fantastic UI at this time.

**Usage:**

    npm start

### 3) Tests

**Unit tests** are implemented in Precious Data as a method for ensuring that the code functions as the programmer intended.

**Integration tests** are implemented in Precious Data as a method for ensuring that the ripper code can correctly retrieve data from the official P-Memories website. In other words, integration tests give the Precious Data operator an indication of whether or not the P-Memories website has changed to the point where Precious Data software will not know where to look for the data.

**Usage:**

    npm run test

(see below note on fixtures.)


## TL;DR:

This project creates a JSON/JPG card dataset using p-memories.com as the source. `npm run start`.
