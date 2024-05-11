let datalist = document.querySelector(".datalist");
let saveBtn = document.querySelector(".save-btn");
let importInp = document.querySelector(".import-inp");
let exportBtn = document.querySelector(".export-btn");
let { dictionary } = await chrome.storage.local.get("dictionary");
window.dictionary = dictionary;
updateDatalist();

function loadData() {
  chrome.storage.local.get("dictionary", ({ dictionary: dict }) => {
    dictionary = dict;
    updateDatalist();
  });
}

function download(content, fileName, contentType = "text/plain") {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

function deleteRow({ target }) {
  if (!target.parentElement.parentElement.nextSibling) return;
  target.parentElement.parentElement.remove();
}

function addEmptyRow() {
  let tr = document.createElement("tr");
  let tdName = document.createElement("td");
  tdName.contentEditable = "plaintext-only";
  tdName.spellcheck = false;
  tdName.addEventListener("input", onTextChanged);
  let tdEmoji = document.createElement("td");
  tdEmoji.contentEditable = "plaintext-only";
  tdEmoji.spellcheck = false;
  tdEmoji.addEventListener("input", onTextChanged);
  let tdDelete = document.createElement("td");
  let btnDelete = document.createElement("button");
  btnDelete.innerText = "Delete";
  btnDelete.classList.add("red");
  btnDelete.addEventListener("click", deleteRow);
  tdDelete.appendChild(btnDelete);
  tr.appendChild(tdName);
  tr.appendChild(tdEmoji);
  tr.appendChild(tdDelete);
  datalist.appendChild(tr);
}

function onTextChanged({ target }) {
  let row = target.parentElement;
  if (
    row.children[0].textContent.length == 0 &&
    row.children[1].textContent.length == 0 &&
    row.nextSibling
  ) {
    row.remove();
  } else if (
    !row.nextSibling &&
    (row.children[0].textContent.length != 0 ||
      row.children[1].textContent.length != 0)
  ) {
    addEmptyRow();
  }
}

function updateDatalist() {
  datalist.innerHTML = "";
  for (const [key, value] of Object.entries(dictionary)) {
    let tr = document.createElement("tr");
    let tdName = document.createElement("td");
    let txtName = document.createTextNode(key);
    tdName.appendChild(txtName);
    tdName.contentEditable = "plaintext-only";
    tdName.spellcheck = false;
    tdName.addEventListener("input", onTextChanged);
    let tdEmoji = document.createElement("td");
    let txtEmoji = document.createTextNode(value);
    tdEmoji.appendChild(txtEmoji);
    tdEmoji.contentEditable = "plaintext-only";
    tdEmoji.spellcheck = false;
    tdEmoji.addEventListener("input", onTextChanged);
    let tdDelete = document.createElement("td");
    let btnDelete = document.createElement("button");
    btnDelete.innerText = "Delete";
    btnDelete.classList.add("red");
    btnDelete.addEventListener("click", deleteRow);
    tdDelete.appendChild(btnDelete);
    tr.appendChild(tdName);
    tr.appendChild(tdEmoji);
    tr.appendChild(tdDelete);
    datalist.appendChild(tr);
  }
  addEmptyRow();
}

saveBtn.addEventListener("click", () => {
  let newDictionary = {};
  for (let i = 0; i < datalist.children.length - 1; i++) {
    let name = datalist.children[i].children[0].textContent;
    let emoji = datalist.children[i].children[1].textContent;
    if (name.length == 0) {
      alert(`Row ${i + 1}: Name cannot be empty.`);
      return;
    }
    if (emoji.length == 0) {
      alert(`Row ${i + 1}: Emoji cannot be empty.`);
      return;
    }
    if (name.includes(" ")) {
      alert(`Row ${i + 1}: Name cannot include white space.`);
      return;
    }
    if (name.includes(":")) {
      alert(`Row ${i + 1}: Name cannot include colon.`);
      return;
    }
    if (newDictionary.hasOwnProperty(name)) {
      alert(`Row ${i + 1}: Name has already existed.`);
      return;
    }

    newDictionary[name] = emoji;
  }

  chrome.storage.local.set({ dictionary: newDictionary }).then(() => {
    alert("Save successfully!");
    loadData();
  });
});

exportBtn.addEventListener("click", async () => {
  let { dictionary: downloadData } = await chrome.storage.local.get("dictionary");
  downloadData = JSON.stringify(downloadData);
  download(downloadData, "emoji_data.json");
});

importInp.addEventListener("change", (e) => {
  let file = e.target.files[0];
  if (file) {
    let reader = new FileReader();
    let fileContent = "";
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
      fileContent = evt.target.result;
      try {
        dictionary = JSON.parse(fileContent);
        chrome.storage.local.set({ dictionary }).then(() => {
          alert("Import sucessfully!");
          loadData();
        });
      } catch (e) {
        alert("Wrong format!");
      }
    };
    reader.onerror = function () {
      alert("Error reading file!");
    };
  }
});
