import pug from "pug";
import fs from "fs";
import UglifyJS from "uglify-js";
import CleanCSS from "clean-css";

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

const minifySrc = (file) => {
  const [filename, extension] = file.split(".");
  const content = fs.readFileSync(`./src/${file}`, "utf8");
  if (extension === "css") {
    const cleanCSS = new CleanCSS({ compatibility: "ie9" });
    const result = cleanCSS
      .minify(content)
      .styles.replaceAll("2nof", "2n of")
      .replaceAll("2n+1of", "2n+1 of");
    return fs.writeFileSync(`./public/${filename}.min.${extension}`, result);
  } else if (extension === "js") {
    const result = UglifyJS.minify(content).code;
    return fs.writeFileSync(`./public/${filename}.min.${extension}`, result);
  }
};

minifySrc("strings.js");
minifySrc("utils.js");
minifySrc("styles.css");

const root = pug.renderFile("./src/root.jade", {
  env: process.env.NODE_ENV,
  categories,
});

const tabs = pug.renderFile("./src/tabs.jade", {
  env: process.env.NODE_ENV,
  categories,
});

fs.writeFileSync(
  "./public/itemlist.min.js",
  `document.querySelector('main').innerHTML=\`${tabs}\`;finishLoading()`
);
fs.writeFileSync("./index.html", root);
