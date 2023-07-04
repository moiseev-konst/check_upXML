const label = document.getElementById("label");
const root = document.getElementById("root");
const fileReader = new FileReader();
const fileXML = document.getElementById("file");
let partyAlcohol = {};

fileXML.addEventListener("change", handleFile);

function handleFile() {
  const file = fileXML.files[0];
   const rem = root.querySelector("table");
  if (rem) {
    rem.remove();
  }
  const fileText = reader(file);
}

function reader(file) {
  fileReader.readAsText(file);
  fileReader.onload = function () {
    const fileText = fileReader.result;
    let parser = new DOMParser();
    let XMlDoc = parser.parseFromString(fileText, "application/xml");
    let boxes = XMlDoc.getElementsByTagName("ns:Box");
    partyAlcohol = {};
    extractInfo(Array.from(boxes));

    root.appendChild(createTable(partyAlcohol));
  };
  fileReader.onerror = function () {
    console.log(fileReader.error);
  };
}

function extractInfo(collection) {
  let ranges = [];
  let range = {};
  let count;
  let end;
  let start;
  let pref;
  let alcoholCode;
  for (let i = 0; i < collection.length; i++) {
    if (
      alcoholCode !=
      collection[i].getElementsByTagName("ns:AlcoholCode")[0].textContent
    ) {
      if (alcoholCode) {
        ranges.push(range);
        partyAlcohol[alcoholCode] = ranges;
      }
      ranges = [];
      range = {};
      pref = 0;
      start = 0;
      end = 0;
      count = 0;
    }
    alcoholCode =
      collection[i].getElementsByTagName("ns:AlcoholCode")[0].textContent;

    partyAlcohol[alcoholCode] = { alcoholCode: alcoholCode };

    Array.from(collection[i].getElementsByTagName("ns:Code")).forEach(
      (mark) => {
        let str = mark.textContent;
        pref = pref || str.match(/(?<=19\d)\d{3}/)[0];
        start = start || str.match(/(?<=19\d\d{3})\d{8}/)[0];
        end = str.match(/(?<=19\d\d{3})\d{8}/)[0];
        if (
          pref != str.match(/(?<=19\d)\d{3}/)[0] ||
          Number(start) + Number(count) != Number(end)
        ) {
          ranges.push(range);
          range = {};
          pref = str.match(/(?<=19\d)\d{3}/)[0];
          start = str.match(/(?<=19\d\d{3})\d{8}/)[0];
          count = +end - +start;
        }
        count = +end - +start + 1;
        range["pref"] = pref;
        range["start"] = start;
        range["end"] = end;
        range["count"] = count;
      }
    );
  }
  ranges.push(range);
  partyAlcohol[alcoholCode] = ranges;
}

function createTable(partyAlcohol) {
  const table = document.createElement("table");
  let tableRow = Object.getOwnPropertyNames(partyAlcohol);
  const tableHead = document.createElement("thead");
  tableHead.innerHTML = `<tr>
    <th>Alcohol Code</th>
    <th>Range mark</th>
    <th>Amount of marks</th>
</tr>`;
  for (let i = 0; i < tableRow.length; i++) {
    let tBody = document.createElement("tbody");
    if (partyAlcohol[tableRow[i]].length > 1) {
      let td_r = `<td rowspan=${partyAlcohol[tableRow[i]].length}>${
        tableRow[i]
      }`;
      for (let j = 0; j < partyAlcohol[tableRow[i]].length; j++) {
        let tr = document.createElement("tr");
        let td = `<td>${partyAlcohol[tableRow[i]][j].pref} ${
          partyAlcohol[tableRow[i]][j].start
        } - ${partyAlcohol[tableRow[i]][j].end}</td>
        <td>${partyAlcohol[tableRow[i]][j].count} </td>`;
        tr.innerHTML = j == 0 ? td_r + td : td;
        tBody.appendChild(tr);
      }
      table.appendChild(tBody);
    } else {
      let tr = document.createElement("tr");
      td = `
    <td>${tableRow[i]}</td>
    <td>${partyAlcohol[tableRow[i]][0].pref} ${
        partyAlcohol[tableRow[i]][0].start
      } - ${partyAlcohol[tableRow[i]][0].end}</td>
    <td>${partyAlcohol[tableRow[i]][0].count} </td>`;
      tr.innerHTML = td;
      tBody.appendChild(tr);
      table.appendChild(tBody);
    }
  }
  table.appendChild(tableHead);
  table.classList.add("table");
  label.classList.add("corn");
  return table;
}
