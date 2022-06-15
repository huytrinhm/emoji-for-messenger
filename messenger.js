(async () => {
  // https://stackoverflow.com/questions/3972014/get-contenteditable-caret-position
  function getCaretPosition(editableDiv) {
    let caret = 0,
      sel,
      range;

    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        if (range.commonAncestorContainer.parentNode == editableDiv)
          caret = range.endOffset;
      }
    }

    return caret;
  }

  function substitute(string, searchString, replaceString, caret) {
    let textBefore = string.substring(0, caret);
    let countBefore = textBefore.split(searchString).length - 1;
    let midPos = string.indexOf(searchString, caret - searchString.length + 1);

    let lengthDiff =
      (replaceString.length - searchString.length) * countBefore +
      (midPos != -1 && caret > midPos
        ? replaceString.length - (caret - midPos)
        : 0);

    let replaceText = string.replaceAll(searchString, replaceString);
    return [replaceText, caret + lengthDiff];
  }

  MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

  let { enabled } = await chrome.storage.local.get("enabled");
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.enabled?.hasOwnProperty("newValue")) {
      enabled = changes.enabled.newValue;
    }
  });

  let { dictionary } = await chrome.storage.local.get("dictionary");
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.dictionary?.hasOwnProperty("newValue")) {
      dictionary = changes.dictionary.newValue;
    }
  });

  let newTextboxObserver = new MutationObserver(function (textboxMutations) {
    for (let i = 0, len = textboxMutations.length; i < len; i++) {
      if (textboxMutations[i].attributeName === "data-lexical-editor") {
        let textbox = textboxMutations[i].target;
        let observer = new MutationObserver(function (mutations) {
          observer.disconnect();
          mutations.forEach((mutation) => {
            if (!enabled) return;
            let caret = getCaretPosition(mutation.target.parentElement);
            let originalText = mutation.target.textContent;
            let replaceText = originalText;
            let newCaret = caret;

            for (const [searchString, replaceString] of Object.entries(dictionary)) {
              [replaceText, newCaret] = substitute(
                replaceText,
                `:${searchString}:`,
                replaceString,
                newCaret
              );
            }
            
            if (replaceText != originalText) {
              mutation.target.textContent = replaceText;

              let range = document.createRange();
              let sel = window.getSelection();
              range.setStart(mutation.target, newCaret);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          });
          observe();
        });

        let observe = () => {
          observer.observe(textbox, {
            characterData: true,
            subtree: true,
          });
        };

        observe();
      }
    }
  });

  newTextboxObserver.observe(document, {
    subtree: true,
    attributes: true,
  });
})();
