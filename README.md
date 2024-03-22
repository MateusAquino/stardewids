# Getting started

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/MateusAquino/stardewids.git
cd stardewids
npm install
```

Then, you'll need to copy stardew valley [unpacked files](https://github.com/Pathoschild/StardewXnbHack) to `/assets` folder. Patching the items can be done by running:

```bash
npm run update-item-list
```

This will patch all the items in the game to a `/dist` folder separated by item type.

To generate/update the `index.html` page with all the IDs as you change the files, run:

```bash
npm run dev
```
