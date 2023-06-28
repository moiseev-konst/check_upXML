console.log("js start");
const label = document.getElementById('label')
const root = document.getElementById("root");
const fileReader = new FileReader();
const fileXML = document.getElementById("file");
let partyAlcohol = {};


fileXML.addEventListener("change", handleFile);

function handleFile() {
    const file = fileXML.files[0];
    console.log(file);
    const rem = root.querySelector('table')
    if (rem) {
        rem.remove()
    }
    const fileText = reader(file);
}

function reader(file) {
    fileReader.readAsText(file);
    fileReader.onload = function() {
        const fileText = fileReader.result;
        let parser = new DOMParser();
        let XMlDoc = parser.parseFromString(fileText, "application/xml");
        console.log(XMlDoc);
        let boxes = XMlDoc.getElementsByTagName("ns:Box");
        console.log(boxes);
        partyAlcohol = {};
        extractInfo(Array.from(boxes));
        console.log(partyAlcohol);
        createTable(partyAlcohol);
    };
    fileReader.onerror = function() {
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

        //console.log(partyAlcohol);

        Array.from(collection[i].getElementsByTagName("ns:Code")).forEach(
            (mark) => {
                let str = mark.textContent;
                pref = pref || str.match(/(?<=193)\d{3}/)[0];
                start = start || str.match(/(?<=193\d{3})\d{8}/)[0];
                end = str.match(/(?<=193\d{3})\d{8}/)[0];
                count = +end - +start;
                if (pref != str.match(/(?<=193)\d{3}/)[0] || +start + count != +end) {
                    ranges.push(range);
                    range = {};
                    pref = str.match(/(?<=193)\d{3}/)[0];
                    start = str.match(/(?<=193\d{3})\d{8}/)[0];
                    count = +end - +start;
                }
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

    let tableRow = Object.getOwnPropertyNames(partyAlcohol);

    const tableHead = document.createElement("thead");
    tableHead.innerHTML = `<tr>
    <th>Alcohol Code</th>
    <th>Range mark</th>
    <th>Amount of marks</th>
</tr>`;
    const tableBody = document.createElement("tbody");
    let str = "";
    let tr = "";
    let td = "";
    for (let i = 0; i < tableRow.length; i++) {
        tr = "";
        td = "";
        if (partyAlcohol[tableRow[i]].length > 1) {
            str += `<div>`
            td = `<td rowspan=${partyAlcohol[tableRow[i]].length}>${tableRow[i]}`;

            for (let j = 0; j < partyAlcohol[tableRow[i]].length; j++) {
                td += `<td>${partyAlcohol[tableRow[i]][j].pref} ${
          partyAlcohol[tableRow[i]][j].start
        } - ${partyAlcohol[tableRow[i]][j].end}</td>
        <td>${partyAlcohol[tableRow[i]][j].count + 1} </td>`;

                tr = `\n <tr connect=true>${td}</tr>`;
                str += tr;
                td = "";
            }
            str += `</div>`
        } else {
            td = `
    <td>${tableRow[i]}</td>
    <td>${partyAlcohol[tableRow[i]][0].pref} ${
        partyAlcohol[tableRow[i]][0].start
      } - ${partyAlcohol[tableRow[i]][0].end}</td>
    <td>${partyAlcohol[tableRow[i]][0].count + 1} </td>
    `;
            tr = `\n <tr> ${td} </tr>`;
            str += tr;
        }
    }

    let table
    if (table) {
        table.remove()
    }
    table = document.createElement("table");
    tableBody.innerHTML = str;
    table.appendChild(tableHead);
    table.appendChild(tableBody);
    table.classList.add('table')
    label.classList.add('corn')

    root.appendChild(table);
}