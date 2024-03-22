import pug from "pug";
import fs from "fs";
import UglifyJS from "uglify-js";

let categories = JSON.parse(fs.readFileSync("./categories.json"));
const categoriesDir = fs.readdirSync("./dist");

for (const category of categoriesDir) {
  const categoryName = category.match(/^(.+)\.json/)?.[1];
  if (!categoryName) continue;
  const data = fs.readFileSync(`./dist/${category}`);
  const jsonData = JSON.parse(data);

  categories = categories
    .map((cat) => ({ items: [], ...cat }))
    .map((cat) => {
      if (cat.id === categoryName) cat.items = jsonData.filter((el) => el);
      return cat;
    });
}

const staticStardewIds = pug.renderFile("./src/root.jade", {
  categories,
  filters: {
    "minify-js": function (text, options) {
      const result = UglifyJS.minify(text);
      if (result.code) return result.code;
      throw new Error(result.error);
    },
  },
});

fs.writeFileSync("./index.html", staticStardewIds);
