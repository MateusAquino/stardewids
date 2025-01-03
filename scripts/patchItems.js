import * as fs from "node:fs";
import sharp from "sharp";

const languages = [
  "",
  ".tr-TR",
  ".ru-RU",
  ".pt-BR",
  ".ko-KR",
  ".ja-JP",
  ".it-IT",
  ".hu-HU",
  ".fr-FR",
  ".es-ES",
  ".de-DE",
  ".zh-CN",
];

const languageDataCodes = {
  "": "data-en-US",
  ".tr-TR": "data-tr-TR",
  ".ru-RU": "data-ru-RU",
  ".pt-BR": "data-pt-BR",
  ".ko-KR": "data-ko-KR",
  ".ja-JP": "data-ja-JP",
  ".it-IT": "data-it-IT",
  ".hu-HU": "data-hu-HU",
  ".fr-FR": "data-fr-FR",
  ".es-ES": "data-es-ES",
  ".de-DE": "data-de-DE",
  ".zh-CN": "data-zh-CN",
};

const textRegex = /^\[LocalizedText Strings\\(.*?):(.*?)]$/;
const languageCache = {};
const imageMetadataCache = {};

function translateLocalized(localizedText, language) {
  const [_fullMatch, context, textId] = localizedText.match(textRegex);
  const languageFile = safeURL(`./assets/Strings/${context}${language}.json`);
  if (!languageCache[language]) languageCache[language] = {};
  if (!languageCache[language][context]) {
    const data = fs.readFileSync(languageFile);
    languageCache[language][context] = JSON.parse(data);
  }
  return languageCache[language][context][textId];
}

function translate(dataId, id, path, language) {
  const languageFile = safeURL(
    `./assets/${path.replace(".json", "")}${language}.json`
  );
  if (!languageCache[language]) languageCache[language] = {};
  if (!languageCache[language][path]) {
    const data = fs.readFileSync(languageFile);
    languageCache[language][path] = JSON.parse(data);
  }
  const data = languageCache[language][path][id];
  if (!data) return id;
  else return data.split("/")[dataId];
}

async function patchCategory(category, data) {
  const rows = [];
  const typeIndex = {};
  const spriteSize = category.spriteSize || 16;

  if (category.fixedNames) {
    const fixedNames = category.fixedNames;
    const fixedWidth = category.fixedWidth;
    const fixedHeight = category.fixedHeight;

    for (const categoryTexture of category.textures) {
      const texturePath = categoryTexture.path;
      const imagePath = safeURL(
        `./assets/${texturePath.replace("\\", "/")}.png`
      );
      const texture = sharp(imagePath);
      const rawTexture = sharp(imagePath).raw();
      const metadata = await sharp(imagePath).metadata();

      const textureCrop = categoryTexture.crop || [
        0,
        0,
        metadata.width,
        metadata.height,
      ];

      const width = textureCrop[2] - textureCrop[0];
      const height = textureCrop[3] - textureCrop[1];

      const image = texture.extract({
        left: textureCrop[0],
        top: textureCrop[1],
        width,
        height,
      });
      const rawImage = rawTexture.extract({
        left: textureCrop[0],
        top: textureCrop[1],
        width,
        height,
      });

      let id = 0;
      while (true) {
        const x = (id * fixedWidth) % width;
        const y = Math.floor((id * fixedWidth) / width) * fixedHeight;
        const bounding = {
          left: x,
          top: y,
          width: fixedWidth,
          height: fixedHeight,
        };
        if (y >= height) break;
        const instance = image.extract(bounding);
        const rawInstance = rawImage.extract(bounding);
        const data = await instance.toBuffer();
        const raw = await rawInstance.toBuffer();

        if (raw.every((v) => v === 255) || raw.every((v) => v === 0)) {
          id++;
          continue;
        }

        rows.push({
          id: categoryTexture.prefix + id++,
          image: data.toString("base64"),
          names: fixedNames,
        });
      }
    }

    return fs.writeFileSync(`./dist/${category.id}.json`, JSON.stringify(rows, null, "\t"));
  }

  for (let [id, item] of Object.entries(data)) {
    if (typeof item === "string")
      item = parseItemString(item, category.itemFormat);
    const {
      Texture: texture,
      SpriteIndex: mainSpriteIndex,
      SheetIndex: sheetSpriteIndex,
      MenuSpriteIndex: menuSpriteIndex,
      DisplayName: displayName,
      TilesheetSize: tilesheetSize,
      Rotations: rotations,
      TypeIndicator: type,
      Type: objectType,
    } = item;
    const typeTextureId = `${type}_${texture}`;
    if (typeIndex[typeTextureId] === undefined) typeIndex[typeTextureId] = 0;
    const index = typeIndex[typeTextureId];
    let spriteIndex = menuSpriteIndex > 0 ? menuSpriteIndex : mainSpriteIndex;
    spriteIndex = sheetSpriteIndex > 0 ? sheetSpriteIndex : spriteIndex;
    if (spriteIndex === undefined && category.idAsSpriteId) {
      spriteIndex = Number(id);
    } else if (spriteIndex === undefined) {
      spriteIndex = index;
      const indexOffset = Number(rotations) || 1;
      typeIndex[typeTextureId] += indexOffset > 3 ? 3 : indexOffset;
    }

    const defaultSourceRect =
      category.defaultSourceRect?.[type] || category.defaultSourceRect?.default;

    const texturePath = texture ? texture : category.defaultTexture;
    const imagePath = safeURL(`./assets/${texturePath.replace("\\", "/")}.png`);
    const sFw = parseXY(tilesheetSize, 0) || parseXY(defaultSourceRect, 0);
    const sFh = parseXY(tilesheetSize, 1) || parseXY(defaultSourceRect, 1);

    if (!imageMetadataCache[imagePath])
      imageMetadataCache[imagePath] = await sharp(imagePath).metadata();

    let bounding;
    const image = sharp(imagePath);
    const widthFactor =
      category?.typeFactors?.[type]?.[0] || category.widthFactor || 1;
    const heightFactor =
      category?.typeFactors?.[type]?.[1] || category.heightFactor || 1;
    const metadata = imageMetadataCache[imagePath];

    const gapX = category.gapX ? category.gapX * spriteSize : 0;
    const yOffset = category.yOffset ? category.yOffset * spriteSize : 0;
    const textureWidth = metadata.width / (category.splitWidth || 1);
    const textureLength = textureWidth / (gapX + spriteSize);

    if (!sFw) {
      const spriteX = spriteIndex % textureLength;
      const spriteY = Math.floor(
        (spriteIndex * (spriteSize + gapX)) / textureWidth
      );
      const gapOffsetX = spriteX * gapX;
      const gapOffsetY = spriteY * yOffset;

      bounding = {
        left: spriteSize * spriteX * widthFactor + gapOffsetX,
        top: spriteSize * spriteY * heightFactor + gapOffsetY + yOffset,
        width: spriteSize * widthFactor,
        height: spriteSize * heightFactor - (category.subtractHeight || 0),
      };
    } else {
      const sourceRectWidth = sFw * spriteSize;
      const sourceRectHeight = sFh * spriteSize;

      if (isNaN(Number(id))) {
        const sourceRectX = (spriteIndex % textureLength) * spriteSize;
        const sourceRectY =
          Math.floor(spriteIndex / textureLength) * spriteSize;
        bounding = {
          left: sourceRectX,
          top: sourceRectY,
          width: sourceRectWidth,
          height: sourceRectHeight - (id === "DecorativeJojaDoor" ? 3 : 0),
        };
      } else {
        const which = isNaN(Number(id)) ? undefined : Number(id);
        const rX = (which * spriteSize) % textureWidth;
        const rY = Math.floor((which * spriteSize) / textureWidth) * spriteSize;
        bounding = {
          left: rX,
          top: rY,
          width: sourceRectWidth,
          height: sourceRectHeight,
        };
      }
    }
    try {
      const instance = image.extract(bounding);

      for (let i = 1; i < (category.splitWidth || 1); i++) {
        instance.composite([
          {
            input: await sharp(imagePath)
              .extract({ ...bounding, left: bounding.left + textureWidth })
              .toBuffer(),
          },
        ]);
      }

      const data = await instance.toBuffer();
      rows.push({
        id,
        objectType,
        image: data.toString("base64"),
        names: languages.reduce((acc, lang) => {
          const dataCode = languageDataCodes[lang];
          if (category.translateUsingDataId)
            acc[dataCode] = translate(
              category.translateUsingDataId,
              id,
              category.path,
              lang
            );
          else acc[dataCode] = translateLocalized(displayName || "", lang);
          return acc;
        }, {}),
      });
    } catch (e) {
      console.log("Error Processing", category.id, id);
      console.error(e);
      console.log(metadata);
      console.log(bounding);
    }
  }

  fs.writeFileSync(`./dist/${category.id}.json`, JSON.stringify(rows, null, "\t"));
}

const categories = JSON.parse(fs.readFileSync("./categories.json"));

categories.forEach((category) => {
  if (category.path) {
    const data = fs.readFileSync(`./assets/${category.path}`);
    const jsonData = JSON.parse(data);
    patchCategory(category, jsonData);
  } else patchCategory(category, {});
});

function safeURL(url) {
  return url.replace(/\\/g, "/").replace("//", "/");
}

function parseXY(xyString, index) {
  const stringSplit = xyString?.split(" ");
  return stringSplit?.length > 1 ? parseInt(stringSplit[index]) : undefined;
}

function parseItemString(itemString, itemFormat) {
  const params = itemString.split("/");
  const fields = itemFormat.split("/");

  return fields.reduce((acc, field, index) => {
    acc[field] = params[index] ? params[index] : undefined;
    return acc;
  }, {});
}
