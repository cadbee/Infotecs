let req = new XMLHttpRequest();
req.open("GET", "../../src/json/users.json", false);
req.send(null);
let data = JSON.parse(req.responseText); // Получаем информацию из данного json
let rows = []; // Массив, в котором будут храниться все строки таблицы, необходим для сортировки по столбцам независимо от страницы
let table = document.getElementById("mainTable"); // Элемент таблицы, вынесен отдельно, т.к. многократно используется


// Функция для заполнения массива rows
function createRowsArray() {
    // Проходимся по всем объектам json
    for (let i = 0; i < data.length; i++) {
        // Создаем элемент строки
        let row = document.createElement("tr");
        // Извлекаем данные из json
        JSON.parse(JSON.stringify(data[i]), (key, value) => {
            // Учитываем только необходимые для отображения данные
            if (['firstName', 'lastName', 'about', 'eyeColor'].includes(key)) {
                // Создаем элемент td
                let cell = row.insertCell();
                // Div с классом max-lines-2 необходим для ограничения количества строк в ячейке
                let div = document.createElement("div");
                div.className = "max-lines-2";
                div.append(value);
                // Отображаем eyeColor в виде цвета
                if (key === 'eyeColor') {
                    div.className = "unselectable_div";
                    div.style.backgroundColor = value;
                }
                cell.append(div);
            }
        });
        rows.push(row);
    }
}

// Функция заполнения данными таблицы
function fillTable() {
    let tbody = document.createElement("tbody");
    // Заменяем старое тело таблицы новым, чтобы при переключении страниц кол-во строк оставалось <= 10
    table.tBodies[0].replaceWith(tbody);
    let page = Number(table.dataset.page);
    // По номеру страницы определяем диапазон выводимых строк и добавляем их в новое тело таблицы
    for (let i = 10 * page; i < 10 * (page + 1); i++) {
        tbody.append(rows[i]);
    }
    // Добавляем возможность редактирования для строк
    document.querySelectorAll('#mainTable tbody tr').forEach(tableTH => tableTH.addEventListener('click', () => editRow(tableTH.rowIndex)));
}

// Функция сортировки по столбцам
function sortColumn(column_num) {
    // Устанавливаем порядок сортировки
    const order = table.dataset.order = -(table.dataset.order || -1);
    // Сортируем массив строк по необходимой ячейке с индексом column_num
    rows = Array.from(rows)
        .sort((rowA, rowB) => rowA.cells[column_num].innerHTML > rowB.cells[column_num].innerHTML ? order : -order);
    // Обновляем таблицу
    fillTable();
}

// Функция для отображения контейнера редактирования строки с индексом row_index
const editRow = (row_index) => {
    // Изменяем соотношения контейнеров и отображаем форму для изменения
    document.getElementsByClassName('container')[0].style.width = '100%';
    document.getElementsByClassName('table_container')[0].style.width = '50%';
    document.getElementById("edit_container").style.display = 'block';
    // Получаем строку для редактирования
    let row = table.rows[row_index];
    // Заполняем поля ввода начальными данными
    document.getElementsByName("firstName_input")[0].value = row.children[0].innerText;
    document.getElementsByName("lastName_input")[0].value = row.children[1].innerText;
    document.getElementsByName("about_input")[0].value = row.children[2].innerText;
    document.getElementsByName("eyeColor_input")[0].value = row.children[3].innerText;
    // Запоминаем индекс выбранной строки
    document.getElementById('edit_container').dataset.rowIndex = row_index;
};

// Функция для сохранения внесенных изменений строки
function saveChanges() {
    // Получаем индекс строки и саму строку из массива
    let row_index = Number(document.getElementById('edit_container').dataset.rowIndex - 1);
    row_index += Number(table.dataset.page) * 10;
    let row = rows[row_index];
    // Получаем данные из input-ов формы
    let new_values = document.getElementsByClassName('row_edit');
    for (let i = 0; i < row.children.length; i++) {
        // В ячейке цвета глаз отображаем данные в виде цвета
        if (i === row.children.length - 1) {
            row.children[i].children[0].innerText = new_values[i].value;
            row.children[i].children[0].style.backgroundColor = new_values[i].value;
        } else {
            row.children[i].children[0].innerText = new_values[i].value;
        }
    }
    // Закрываем окно редактирования и возвращаем исходное соотношение контейнеров
    document.getElementsByClassName('container')[0].style.width = '50%';
    document.getElementsByClassName('table_container')[0].style.width = '100%';
    document.getElementById("edit_container").style.display = 'none';
}

// Функция переключения страницы на следующую
function nextPage() {
    // Получаем номер следующей страницы
    let page = Number(table.dataset.page) + 1;
    // Проверяем возможность переключиться на эту страницу
    // Если строк больше нет, то ничего не делаем
    if (page * 10 >= rows.length) return;
    // Если оставшихся строк меньше 10, то выводим их
    let tbody_height = (page + 1) * 10 > rows.length ? rows.length : 10 * (page + 1);
    let tbody = document.createElement("tbody");
    for (let i = 10 * (page); i < tbody_height; i++) {
        tbody.append(rows[i]);
    }
    // Заменяем тело таблицы новым
    table.tBodies[0].replaceWith(tbody);
    // Сохраняем номер страницы и отображаем его
    table.dataset.page = page.toString();
    document.getElementById('mainTable').tFoot.children[0].children[0].innerText = "Page: " + page;
    // Добавляем возможность редактирования для новых строк
    document.querySelectorAll('#mainTable tbody tr').forEach(tableTH => tableTH.addEventListener('click', () => editRow(tableTH.rowIndex)));
}

// Функция для переключения на предыдущую страницу
function prevPage() {
    // Получаем номер предыдущей страницы
    let page = Number(table.dataset.page) - 1;
    if (page * 10 < 0) return; // Если текущая страница первая - ничего не делаем
    let tbody = document.createElement("tbody");
    for (let i = 10 * (page); i < 10 * (page + 1); i++) {
        tbody.append(rows[i]);
    }
    // Заменяем старое тело таблицы
    table.tBodies[0].replaceWith(tbody);
    // Сохраняем новый номер страницы и отображаем его в таблице
    table.dataset.page = page.toString();
    document.getElementById('mainTable').tFoot.children[0].children[0].innerText = "Page: " + page;
    // Добавляем возможность редактирования для строк
    document.querySelectorAll('#mainTable tbody tr').forEach(tableTH => tableTH.addEventListener('click', () => editRow(tableTH.rowIndex)));
}


createRowsArray();
fillTable();



