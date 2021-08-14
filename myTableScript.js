const config = {
  parent: '#usersTable1',
  columns: [
    {title: 'Имя', value: 'name'},
    {title: 'Фамилия', value: 'surname'},
    {title: 'Возраст', value: 'age'},
  ],
  apiUrl: "https://mock-api.shpp.me/adavydenko/users"
};

const users = [
  {id: 30050, name: 'Вася', surname: 'Петров', age: 12},
  {id: 30051, name: 'Петя', surname: 'Васечкин', age: 15},
];

DataTable(config);

/**
 * Creates and renders thead and tbody elements with all
 * tr-s and td-s as well as the content the user provided.
 * 
 * @param {object} config is an object containing names and values
 * of the columns that shall be displayed
 * @param {array} data is an array of objects with the actual data
 * to be displayed. The objects` keys shall have the exact same names
 * as the columns` values in the config object.
 */
async function DataTable(config, data) {
  let serverData;
  let useLocalData = true;
  let numOfColumns;
  let serverTableHeaders;

  if (data === undefined) {
    useLocalData = false;
    serverData = await getServerData(config);
    numOfColumns = Object.keys(serverData.data[Object.keys(serverData.data)[0]]).length + 2;
    serverTableHeaders = Object.keys(serverData.data[Object.keys(serverData.data)[0]]);
    serverTableHeaders.unshift("№");
  } else {
    numOfColumns = config.columns.length + 1;
  }

  const table = createTableWrapperAndTable(config);
  const tHead = createTableHead(table);
  const tHeadTr = createTableHeadTr(tHead);
  createTableHeadTds(tHeadTr, config, numOfColumns, useLocalData, serverTableHeaders);
  const tBody = createTableBody(table);
  createBodyTrs(data, numOfColumns, tBody, useLocalData, serverData, config.parent);
}

async function getServerData(config) {
  let data = await fetch(config.apiUrl);
  data = await data.json();
  return data;
}

/**
 * Queries the element the user specified as the parent element in
 * the config-object and makes it a table wrapper. After that creates
 * a table DOM-element, assigns it a class and adds to the table wrapper
 * as its child.
 * 
 * @param {object} config is an object containing names and values
 * of the columns that shall be displayed
 * @returns the table html-element
 */
function createTableWrapperAndTable(config) {
  const tableWrapper = document.getElementById(`${config.parent.slice(1)}`);
  const table = document.createElement("table");
  table.classList.add("my-table");
  tableWrapper.appendChild(table);
  return table;
}

/**
 * Creates a thead html-element, assigns it a class and adds to the table
 * as its child.
 * 
 * @param {DOM-object} table is the table html-element.
 * @returns thead html-element
 */
function createTableHead(table) {
  const tHead = document.createElement("thead");
  tHead.classList.add("my-table__header");
  table.appendChild(tHead);
  return tHead;
}

/**
 * Creates a tr html-element inside the thead element, assigns it a class
 * and adds to the thead as its child.
 * 
 * @param {DOM-object} tHead is the thead html-element.
 * @returns tr html-element.
 */
function createTableHeadTr(tHead) {
  const tHeadTr = document.createElement("tr");
  tHeadTr.classList.add("my-table__header-row");
  tHead.appendChild(tHeadTr);
  return tHeadTr;
}

/**
 * Creates a td html-elements inside the tr element, assigns them classes
 * and adds to the tr element as its children. Each td-element gets also
 * an attribute which will be used as an identifier. Based on this identifier
 * td-elements inside tbody will get a particular value.
 * 
 * @param {DOB-object} tHeadTr is the tr html-element inside a thead element
 * @param {object} config is an object containing names and values
 * of the columns that shall be displayed
 * @param {integer} numOfColumns is the number of columns the user wants to render on screen
 */
function createTableHeadTds(tHeadTr, config, numOfColumns, useLocalData, serverTableHeaders) {
  for (let i = 0; i < numOfColumns; i++) {
    const tHeadTd = document.createElement("td");
    tHeadTd.classList.add("my-table__header-cell");

    if (useLocalData) {
      tHeadTd.textContent = i === 0 ? "№" : config.columns[i - 1].title; 
      tHeadTd.textContent === "№" ? tHeadTd.setAttribute("data-my-table", "number") : tHeadTd.setAttribute("data-my-table", config.columns[i - 1].value);
    } else {
      tHeadTd.textContent = serverTableHeaders[i]; 
      tHeadTd.setAttribute("data-my-table", serverTableHeaders[i]);
    }
    
    tHeadTr.appendChild(tHeadTd);
  }
}

/**
 * Creates a tbody html-element, assigns it a class and adds to the table
 * as its child.
 * 
 * @param {DOM-object} table is the table html-element.
 * @returns tbody html-element.
 */
function createTableBody(table) {
  const tBody = document.createElement("tbody");
  tBody.classList.add("my-table__body");
  table.appendChild(tBody);
  return tBody;
}

/**
 * Creates tr html-elements inside the tbody element. The number of the
 * tr-elements to be created depends on the number of items in the data-array
 * since each item (object) represents a separte row in the table.
 * 
 * @param {array} data is an array of objects with the actual data
 * to be displayed. The objects` keys shall have the exact same names
 * as the columns` values in the config object.
 * @param {integer} numOfColumns is the number of columns the user wants to render on screen
 * @param {DOM-object} tBody is the tbody html-element
 */
function createBodyTrs(data, numOfColumns, tBody, useLocalData, serverData, tableWrapper) {
  if (useLocalData) {
    data.forEach((item, index) => {
      createBodyTr(numOfColumns, tBody, index, item, tableWrapper);
    });
  } else {
    let count = 0;
    for (let item in serverData.data) {
      createBodyTr(numOfColumns, tBody, count, serverData.data[item], tableWrapper);
      count++;
    }
  }
}

/**
 * Creates a single tr html-element inside the tbody element, assigns it a class,
 * appends it with td html-elements and adds it to the tbody as its child.
 * 
 * @param {integer} numOfColumns is the number of columns the user wants to render on screen
 * @param {DOM-object} tBody is the tbody html-element
 * @param {integer} index is the index of a particular item whose data is being extracted
 * and rendered at the moment. The index is used to enter the sequence number of a
 * particular row in the cell with row numbers.
 * @param {array-item} item is a particular item of the data-array consisting 
 * of the objects that shall be display each in a separate table row. 
 * Item is used to create a separate row and fill this row with item`s data.
 */
function createBodyTr(numOfColumns, tBody, index, item, tableWrapper) {
  const tBodyTr = document.createElement("tr");
  tBodyTr.classList.add("my-table__body-row");
  createTableBodyTds(tBodyTr, numOfColumns, index, item, tableWrapper);
  tBody.appendChild(tBodyTr);
}

/**
 * Creates as many td html-elements inside a particular tr-element as the user
 * mentioned in the config.columns array of the config object. Each td-element
 * gets a class.
 * 
 * @param {DOM-object} tBodyTr is the tr html-element as a child of the tbody element.
 * @param {integer} numOfColumns is the number of columns the user wants to render on screen.
 * @param {integer} index is the index of a particular item whose data is being extracted
 * and rendered at the moment. The index is used to enter the sequence number of a
 * particular row in the cell with row numbers.
 * @param {array-item} item is a particular item of the data-array consisting 
 * of the objects that shall be display each in a separate table row. 
 * Item is used to create a separate row and fill this row with item`s data.
 */
function createTableBodyTds(tBodyTr, numOfColumns, index, item, tableWrapper) {
  for (let i = 0; i < numOfColumns; i++) {
    const tBodyTd = document.createElement("td");
    tBodyTd.classList.add("my-table__body-cell");
    tBodyTd.textContent = i === 0 ? index + 1 : getTextContent(i, item, tableWrapper);
    tBodyTr.appendChild(tBodyTd);  
  }
}

/**
 * Creates textContent for td-elements inside the tbody element.
 * If a particular index has value of 2, the script will look for the second td-element
 * in the thead section. After that it will extract the value of uts its data-my-table
 * attribute and use it as a key to the item-object (an object from the data-array).
 * Text under this key will be used as textContent of the particular td-element.
 * 
 * @param {integer} index is the index of a particular item whose data is being extracted
 * and rendered at the moment. The index is used to enter the sequence number of a
 * particular row in the cell with row numbers.
 * @param {array-item} item is a particular item of the data-array consisting 
 * of the objects that shall be display each in a separate table row. 
 * Item is used to create a separate row and fill this row with item`s data.
 * @returns a textContent a particular td-element shall have.
 */
function getTextContent(index, item, tableWrapper) {
  const correspondingHeadTr = document.querySelector(`${tableWrapper} .my-table__header-row td:nth-child(${index + 1})`);
  const key = correspondingHeadTr.getAttribute("data-my-table");
  return (item[key]);
}