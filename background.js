const defaultDictionary = {
  thonk: "🤔",
  orz: "🙇‍♂️",
  crying_cat_face: "😿",
  pouting_cat: "😾",
  flushed: "😳",
  penguin: "🐧",
  thermometer_face: "🤒",
  zipper_mouth: "🤐",
  face_vomiting: "🤮",
  heart: "❤",
  yawning_face: "🥱",
  lying_face: "🤥",
  money_mouth: "🤑",
  dizzy_face: "😵",
  smiley_cat: "😺",
  angry: "😠",
  rolling_eyes: "🙄",
  nauseated_face: "🤢",
  woozy_face: "🥴",
  rage: "😡",
  expressionless: "😑",
  persevere: "😣",
  innocent: "😇",
  smiling_face_with_3_hearts: "🥰",
  face_with_monocle: "🧐",
  confounded: "😖",
  hot_face: "🥵",
  grimacing: "😬",
  joy_cat: "😹",
  sweat_smile: "😅",
  upside_down: "🙃",
};

function toggleEnable(enabled) {
  chrome.storage.local.set({ enabled });
}

chrome.runtime.onInstalled.addListener(async () => {
  toggleEnable(true);
  if(!(await chrome.storage.local.get("dictionary")).hasOwnProperty("dictionary")) {
    chrome.storage.local.set({ dictionary: defaultDictionary }).then(() => {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL("options.html"));
      }
    });
  }
});

chrome.runtime.onStartup.addListener(async () => {
  let enabled = Boolean((await chrome.storage.local.get("enabled")).enabled);
  if (enabled)
    chrome.action.setIcon({ path: "icons/happy_128.png" });
  else
    chrome.action.setIcon({ path: "icons/sad_128.png" });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.enabled?.hasOwnProperty("newValue")) {
    if (changes.enabled.newValue)
      chrome.action.setIcon({ path: "icons/happy_128.png" });
    else
      chrome.action.setIcon({ path: "icons/sad_128.png" });
  }
});
