function openTab(evt, tabId) {
  const tabcontents = document.getElementsByClassName("tabcontent");
  const tablinks = document.getElementsByClassName("tablinks");

  for (const panel of tabcontents) panel.classList.remove("active");
  for (const link of tablinks) link.classList.remove("active");

  document.getElementById(tabId).classList.add("active");
  evt.currentTarget.classList.add("active");
}

function translateTo(language) {
  setTimeout(() => {
    document.querySelectorAll("[data-en-US]").forEach((element) => {
      element.innerText = element.getAttribute(`data-${language}`);
    });
  }, 1);

  setTimeout(() => {
    document.querySelectorAll(".actionButton.copy").forEach((element) => {
      element.dataset.text = Strings.copy[language];
    });

    document.querySelectorAll(".actionButton.copyN").forEach((element) => {
      element.dataset.text = Strings.copyN[language];
    });

    document.querySelectorAll(".actionButton.batch").forEach((element) => {
      element.dataset.text = Strings.batch[language];
    });
  }, 1);

  Object.entries(Strings).forEach(([key, value]) => {
    const element = document.querySelector(`[data-translate="${key}"]`);
    if (element) element.innerHTML = value[language];
  });

  Object.entries(Strings).forEach(([key, value]) => {
    const element = document.querySelector(`[data-translate-text="${key}"]`);
    if (element) element.dataset.text = value[language];
  });
}

function openCountrySelect() {
  document.getElementById("country-select").classList.toggle("active");
}

function selectCountry(event, country) {
  const element = event.currentTarget;

  history.pushState(null, null, `#${country}`);

  document.getElementById("country-select").classList.remove("active");
  document.getElementById("country-selected").innerHTML = element.innerHTML;
  translateTo(country);
}

function copyWithBypass(id) {
  const bypassId = splitId(id);
  navigator.clipboard.writeText(bypassId).then(
    () => {},
    (err) => {
      prompt("Copy failed! Please copy manually:", bypassId);
      throw err;
    }
  );
}

function isAnimating(element) {
  return element.classList.contains("animating");
}

function animate(element, animatedClass) {
  element.className += " animating hide";
  setTimeout(() => element.classList.remove("hide"), 100);
  setTimeout(() => element.classList.add(animatedClass), 100);
  setTimeout(() => element.classList.add("hide"), 1000);
  setTimeout(
    () => element.classList.remove("hide", "animating", animatedClass),
    1100
  );
}

function clickCopy(event, id) {
  const copyButton = event.currentTarget;
  if (copyButton.classList.contains("animating")) return;

  try {
    copyWithBypass(id);
    batch = [];
    document
      .querySelectorAll(".batched")
      .forEach((element) => element.classList.remove("batched"));
    animate(copyButton, "success");
  } catch (e) {
    animate(copyButton, "error");
  }
}

function clickCopyN(event, id) {
  const copyButton = event.currentTarget;
  if (copyButton.classList.contains("animating")) return;

  try {
    let quantity = parseInt(prompt("Qtd (max. 999):", 1), 10);
    if (isNaN(quantity)) throw new Error("Invalid quantity");
    quantity = quantity > 999 ? 999 : quantity;
    quantity = quantity < 1 ? 1 : quantity;
    const bypassId = splitId(id.repeat(quantity));
    prompt("Copy (CTRL + C):", bypassId);
    batch = [];
    document
      .querySelectorAll(".batched")
      .forEach((element) => element.classList.remove("batched"));
    animate(copyButton, "success");
  } catch (e) {
    animate(copyButton, "error");
  }
}

let batch = [];
function clickBatch(event, id) {
  const copyButton = event.currentTarget;
  if (copyButton.classList.contains("animating")) return;
  try {
    const batchRow = document.getElementById(id);
    if (batchRow.classList.contains("batched")) {
      batchRow.classList.remove("batched");
      batch = batch.filter((item) => item !== id);
      copyWithBypass(batch.join(""));
      animate(copyButton, "error");
      return;
    } else {
      batch.push(id);
      copyWithBypass(batch.join(""));
      batchRow.classList.add("batched");
      animate(copyButton, "success");
    }
  } catch (e) {
    animate(copyButton, "error");
  }
}

const filters = {};
function toggleFilter(event, category, filter) {
  const filterButton = event.currentTarget;
  if (filters[category]?.[filter]) {
    delete filters[category][filter];
    filterButton.classList.remove("active");
  } else {
    if (!filters[category]) filters[category] = {};
    filters[category][filter] = true;
    filterButton.classList.add("active");
  }
  updateFilters(category);
}

function updateFilters(category) {
  const rows = document.querySelectorAll(
    `main div#${category} table tbody tr:not(:nth-of-type(1))`
  );
  const showAll =
    filters[category] && Object.keys(filters[category]).length === 0;

  rows.forEach((row) => {
    if (showAll) return row.classList.remove("hidden");
    if (filters[category]?.[row.dataset.type])
      return row.classList.remove("hidden");
    else return row.classList.add("hidden");
  });
}

const codepoints = {
  32: 15,
  33: 9,
  34: 15,
  35: 27,
  36: 30,
  37: 33,
  38: 27,
  39: 9,
  40: 15,
  41: 15,
  42: 24,
  43: 27,
  44: 12,
  45: 18,
  46: 9,
  47: 21,
  48: 21,
  49: 24,
  50: 21,
  51: 24,
  52: 18,
  53: 21,
  54: 24,
  55: 21,
  56: 21,
  57: 21,
  58: 9,
  59: 12,
  60: 27,
  61: 33,
  62: 24,
  63: 24,
  64: 24,
  65: 21,
  66: 27,
  67: 27,
  68: 27,
  69: 27,
  70: 24,
  71: 30,
  72: 27,
  73: 9,
  74: 18,
  75: 24,
  76: 24,
  77: 33,
  78: 27,
  79: 30,
  80: 27,
  81: 30,
  82: 27,
  83: 27,
  84: 27,
  85: 27,
  86: 27,
  87: 39,
  88: 27,
  89: 27,
  90: 27,
  91: 12,
  92: 21,
  93: 12,
  94: 21,
  95: 27,
  96: 12,
  97: 24,
  98: 21,
  99: 21,
  100: 24,
  101: 21,
  102: 18,
  103: 21,
  104: 21,
  105: 9,
  106: 15,
  107: 18,
  108: 12,
  109: 33,
  110: 21,
  111: 21,
  112: 21,
  113: 24,
  114: 21,
  115: 21,
  116: 18,
  117: 24,
  118: 21,
  119: 27,
  120: 21,
  121: 21,
  122: 21,
  123: 21,
  124: 9,
  125: 21,
  126: 24,
  127: 46,
  128: 18,
  129: 18,
  130: 18,
  131: 18,
  132: 18,
  133: 21,
  134: 18,
  135: 18,
  136: 18,
  137: 18,
  138: 18,
  139: 18,
  140: 18,
  141: 18,
  142: 18,
  143: 18,
  144: 18,
  145: 18,
  146: 18,
  147: 18,
  148: 18,
  149: 18,
  150: 18,
  151: 18,
  152: 18,
  153: 18,
  154: 18,
  155: 18,
  156: 18,
  157: 18,
  158: 18,
  159: 18,
  160: 15,
  161: 12,
  162: 21,
  163: 27,
  164: 27,
  165: 27,
  166: 27,
  167: 27,
  168: 24,
  169: 27,
  170: 21,
  171: 24,
  172: 27,
  173: 21,
  174: 30,
  175: 30,
  176: 18,
  177: 21,
  178: 18,
  179: 18,
  180: 12,
  181: 27,
  182: 27,
  183: 12,
  184: 15,
  185: 15,
  186: 18,
  187: 24,
  188: 33,
  189: 36,
  190: 33,
  191: 24,
  192: 21,
  193: 21,
  194: 21,
  195: 21,
  196: 21,
  197: 21,
  198: 30,
  199: 27,
  200: 24,
  201: 24,
  202: 24,
  203: 24,
  204: 12,
  205: 15,
  206: 15,
  207: 15,
  208: 27,
  209: 27,
  210: 30,
  211: 30,
  212: 30,
  213: 30,
  214: 30,
  215: 24,
  216: 33,
  217: 27,
  218: 27,
  219: 27,
  220: 27,
  221: 27,
  222: 21,
  223: 24,
  224: 24,
  225: 24,
  226: 24,
  227: 24,
  228: 24,
  229: 24,
  230: 33,
  231: 21,
  232: 21,
  233: 21,
  234: 21,
  235: 21,
  236: 9,
  237: 12,
  238: 12,
  239: 12,
  240: 21,
  241: 21,
  242: 21,
  243: 21,
  244: 21,
  245: 21,
  246: 21,
  247: 21,
  248: 24,
  249: 24,
  250: 24,
  251: 24,
  252: 24,
  253: 21,
  254: 21,
  255: 21,
  376: 27,
  8212: 34,
  8213: 33,
  8214: 17,
  8215: 30,
  8216: 11,
  8217: 11,
  8218: 11,
  8219: 11,
  8220: 18,
  8221: 18,
  8222: 18,
  8223: 18,
  8224: 29,
  8225: 29,
  8226: 17,
  8227: 17,
  8228: 11,
  8229: 24,
  8230: 29,
  8231: 11,
  8232: 54,
  8233: 21,
  8234: 21,
  8235: 21,
  8236: 21,
  8237: 21,
  8238: 21,
  8239: 28,
  8240: 52,
  8241: 69,
  8242: 13,
  8243: 19,
  8244: 24,
  8245: 13,
  8246: 19,
  8247: 24,
  8248: 21,
  8249: 17,
  8250: 17,
  8364: 27,
  9825: 34,
};

const spacing = 2;
const limit = 233;
const lbs = calculateWidth("${^^");

function calculateWidth(str) {
  let totalWidth = 0;
  for (let i = 0; i < str.length; i++) {
    const codepoint = str.codePointAt(i);
    totalWidth += codepoints[codepoint] - spacing;
  }
  return totalWidth;
}

function splitId(str, parsed = "") {
  if (calculateWidth(str) <= limit) return parsed + str;
  for (let i = 0; i < str.length; i++) {
    const size = calculateWidth(str.substr(0, i));
    if (size + lbs > limit) {
      return splitId(
        "}$" + str.substr(i - 1),
        parsed + str.substr(0, i - 1) + "${^^\n"
      );
    }
  }
}

setTimeout(() => {
  if (window.location.hash) {
    const language = window.location.hash.substring(1);
    const button = document.getElementById("select-" + language);
    if (button) button.click();
  }
}, 1);

Object.entries(Strings).forEach(([key, value]) => {
  const element = document.querySelector(`[data-translate-text="${key}"]`);
  if (element) element.dataset.text = value["en-US"];
});
