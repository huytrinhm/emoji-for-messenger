const supportedUrls = ["www.messenger.com", "www.facebook.com"];
let switchBtn = document.querySelector(".switch");
let siteLabel = document.querySelector(".site");
let statusLabel = document.querySelector(".status");
let settingsBtn = document.querySelector(".settings-btn");
let url = "";

settingsBtn.addEventListener("click", function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
});

async function updateStatus() {
  siteLabel.innerHTML = url;

  if (supportedUrls.includes(url)) {
    let enabled = Boolean((await chrome.storage.local.get("enabled")).enabled);
    let { dictionary } = (await chrome.storage.local.get("dictionary"));
    if (enabled) {
      statusLabel.innerHTML = `${Object.keys(dictionary).length} <code>:emoji:</code> loaded.`;
      switchBtn.classList.remove("off");
      
    } else {
      statusLabel.innerHTML = "The extension is not running.";
      switchBtn.classList.add("off");
    }
  } else {
    statusLabel.innerHTML = "This page is not supported.";
    switchBtn.classList.add("off");
    switchBtn.disabled = true;
  }
}

switchBtn.addEventListener("click", () => {
  let state = switchBtn.classList.contains("off");
  chrome.storage.local.set({ enabled: state });
  switchBtn.classList.toggle("off");
});

chrome.tabs.query({ active: true }, function ([tab]) {
  url = tab.url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    updateStatus();
    return;
  }

  chrome.tabs.sendMessage(
    tab.id,
    { action: "getHostname" },
    function (response) {
      if (response && response.hostname)
        url = response.hostname;
      updateStatus();
    }
  );
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (
    area === "local" &&
    (changes.enabled?.hasOwnProperty("newValue") ||
      changes.dictionary?.hasOwnProperty("newValue"))
  ) {
    updateStatus();
  }
});
