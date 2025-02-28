<h1 align="center">
    <img width="600" src="public/images/header.png" align="center"></img>
</h1>
<p align="center">🐣 Full Stardew Valley item list IDs (updated for 1.6.15) & assets patcher.</p>

<p align="center">
  <a aria-label="Node version" href="https://github.com/nodejs/node/releases/tag/v20.11.1">
    <img src="https://img.shields.io/badge/nodejs-20.11.1-success?logo=Node.js"></img>
  </a>
  <a aria-label="Pug version" href="https://github.com/pugjs/pug/releases/tag/pug%403.0.2">
    <img src="https://img.shields.io/badge/pug-3.0.2-success?logo=Pug"></img>
  </a>
  <img src="https://visitor-badge.laobi.icu/badge?page_id=mateusaquino.stardewids&format=true&right_color=%23048657"></img>
</p>

## 🐓 Stardew Valley Vanilla IDs

<p align="left">
  <a target="_blank" href="https://mateusaquino.github.io/stardewids/"><img width="128px" alt="Logo" title="Logo" align="right" src="public/favicon/icon_128px.png"/></a>
</p>

This is a tool developed to help you find the IDs of items in Stardew Valley updated for the 1.6 update. It programmatically compiles all [unpacked assets](https://github.com/Pathoschild/StardewXnbHack) to generate a standardized item list separated by item type.

With these both new 1.6 changes, it's now possible to spawn any item in the game:

- [Unique string IDs](https://stardewvalleywiki.com/Modding:Migrate_to_Stardew_Valley_1.6#Unique_string_IDs)
- [New gender replacer dialogue command](https://stardewvalleywiki.com/Modding:Migrate_to_Stardew_Valley_1.6#:~:text=Added%20new%20dialogue%20commands,male%20or%20female)

Previously, some item IDs were too long, and we couldn't [bypass](https://www.reddit.com/r/StardewValley/comments/12hec5j/item_code_name_limit_bypass/) the pet's textbox width limit without breaking the item ID. This tool provides a smart way to use the new gender replacer dialogue command to bypass this limit, enabling us to obtain **every single item** in the game.  

Starting from version [1.6.9](https://stardewvalleywiki.com/Version_History#1.6.9), it’s also possible to spawn items typing `/item <I:itemID> [I:amount] [I:quality]`:  

- [Enabling hidden chat commands](https://stardewvalleywiki.com/Multiplayer#Cheat_commands)
- [Debug commands](https://stardewvalleywiki.com/Modding:Console_commands#Debug_commands)

This is the **only option for mobile players**, this tool includes a tutorial switch and also automatically generates `/item` commands.

The tool is currently being hosted at: https://mateusaquino.github.io/stardewids/

## 🚀 Getting Started

If you want to use the patched data files generated by this tool, all data is available at `/dist` folder, however, if you want to update the item list by yourself (for a new update) first clone the repository and install the dependencies:

```nginx
git clone https://github.com/MateusAquino/stardewids.git
cd stardewids
npm install
```

Then, you'll need to copy stardew valley [unpacked files](https://github.com/Pathoschild/StardewXnbHack) to `/assets` folder. Patching the items can be done by running:

```nginx
npm run update-item-list
```

This will patch all the items in the game to the `/dist` folder separated by item type.

To generate/update the `index.html` page with all the IDs as you change the files, run:

```nginx
npm run dev
```

Or (for production):

```nginx
npm run build
```

## 📜 Itemlist Changelog

Starting from `1.6.14`, every json category from this repository is now formatted with tabs, allowing you to track Stardew Valley items changes (new items, translations and updates) through GitHub diffs:

- Changes for [1.6.15](https://stardewvalleywiki.com/Version_History#1.6.15): [`93a9657`](https://github.com/MateusAquino/stardewids/commit/93a96574eadbc5b6f95dfb5f8b1f8d9cf68ae441).  
