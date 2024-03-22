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

  for (let [id, item] of Object.entries(data)) {
    if (typeof item === "string")
      item = parseItemString(item, category.itemFormat);
    const {
      Texture: texture,
      SpriteIndex: mainSpriteIndex,
      MenuSpriteIndex: menuSpriteIndex,
      DisplayName: displayName,
      TilesheetSize: tilesheetSize,
      Rotations: rotations,
      TypeIndicator: type,
    } = item;
    const typeTextureId = `${type}_${texture}`;
    if (typeIndex[typeTextureId] === undefined) typeIndex[typeTextureId] = 0;
    const index = typeIndex[typeTextureId];
    let spriteIndex = menuSpriteIndex > 0 ? menuSpriteIndex : mainSpriteIndex;
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

    const image = sharp(imagePath);
    const widthFactor =
      category?.typeFactors?.[type]?.[0] || category.widthFactor || 1;
    const heightFactor =
      category?.typeFactors?.[type]?.[1] || category.heightFactor || 1;
    const metadata = imageMetadataCache[imagePath];
    const textureWidth = metadata.width / (category.splitWidth || 1);
    const textureLength = textureWidth / spriteSize;
    let bounding;
    const offsetX = category.xOffset ? category.xOffset * spriteSize : 0;
    const offsetY = category.yOffset ? category.yOffset * spriteSize : 0;

    if (!sFw) {
      const spriteX = spriteIndex % textureLength;
      const spriteY = Math.floor((spriteIndex * spriteSize) / textureWidth);
      bounding = {
        left:
          spriteSize * spriteX * widthFactor +
          ((spriteIndex * offsetX) % textureLength),
        top: spriteSize * spriteY * heightFactor + offsetY,
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

  fs.writeFileSync(`./dist/${category.id}.json`, JSON.stringify(rows));
}

// farmhouse flooring ((FL)), wallpaper ((WP))).
const categories = JSON.parse(fs.readFileSync("./categories.json"));

categories.forEach((category) => {
  const data = fs.readFileSync(`./assets/${category.path}`);
  const jsonData = JSON.parse(data);
  patchCategory(category, jsonData);
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
