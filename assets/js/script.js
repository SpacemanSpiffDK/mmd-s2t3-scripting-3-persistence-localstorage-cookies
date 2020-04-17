// JS by Dan Høegh
// UCN MMD 2019

// ========================================
// USING 
// ========================================
// to get and set values in session storage 
//
// localStorage.getItem()
// localStorage.setItem()
// localStorage.removeItem();
// 
// ========================================
// to get and set values in local storage 
// 
// sessionStorage.getItem()
// sessionStorage.setItem()
// sessionStorage.removeItem();
// 
// ========================================

let listArray = []; // setup listArray as a global variable, we need this everywhere!

let js = {
    array: {
        item: {
            remove: function (arr, index) {
                // return all other items than the index item (array)
                return arr.slice(0, index).concat(arr.slice(index + 1, arr.length));
            }
        }
    },
    dom: {
        find: function (targetSelector) {
            // return all elements that match the query (array)
            let elms = document.querySelectorAll(targetSelector);
            return elms;
        },
        write: function (targetSelector, content, isErase = true) {
            // write [content] in all elements that match [targetSelector]
            // isErase controls if we should replace (true) or add to current content (false)
            let elms = js.dom.find(targetSelector);
            for (let i = 0; i < elms.length; i++) {
                if (isErase) {
                    elms[i].innerHTML = content;
                } else {
                    elms[i].innerHTML += content;
                }
            }
        },
        empty: function (targetSelector) {
            js.dom.write(targetSelector, "");
        },
        value: function (targetSelector, content) {
            // set a new value (content) for all targeted elements (targetSelector)
            let elms = js.dom.find(targetSelector);
            for (let i = 0; i < elms.length; i++) {
                elms[i].value = content;
            }
        }
    },
    item: {
        edit: function (index) {
            // edit an item on the todo list, parameter (index) is the index of the item we want to edit
            let txt = listArray[index]; // grab the text from the current (index) item
            js.dom.value("#editItem", txt); // put that value into the input field
            js.item.remove(index, false); // remove the current (index) item from the list, don't get confirmation (false)

            js.ui.focus("#editItem"); // set focus to input field
        },
        remove: function (index, isConfirm = true) {
            // remove an item from the list, only ask for confirmation if isConfirm is (true)
            if (isConfirm) {
                let x = confirm("Do you want to delete this item?");
                if (x) {
                    listArray = js.array.item.remove(listArray, index); // call function for removing the item, it returns the array without the index item
                }
            } else {
                listArray = js.array.item.remove(listArray, index); // call function for removing the item, it returns the array without the index item
            }
            js.items.setHtml(); // draw all items in the listArray as todo list items in the HTML
        },
        newItem: function (text) {
            // make new item
            text = text.trim();
            if (text != "") {
                // push new item to listArray
                listArray.push(text);
                // redraw listArray;
                js.items.setHtml();
                // clear input
                js.dom.value("#editItem", "");
                // set focus
                js.ui.focus("#editItem");
            }
        }
    },
    items: {
        save: function () {
            // save listArray to storage as a JSON string
            // builds a string that looks like this:
            // {"items":[{"name": "name of item 1"},{"name": "Name of item 2"}]}
            // Must be a string since that is what local storage, session storage and cookies will accept
            // Save the string to storage "todoList" 
            let dataString = '{"items":[';
            for (let i = 0; i < listArray.length; i++) {
                dataString += `{ "name": "${listArray[i]}" }`;
                if (i != listArray.length - 1) {
                    dataString += ","; // only put a comma if we're NOT at the last item
                }
            }
            dataString += "]}";
            localStorage.setItem("todoList", dataString);
        },
        load: function () {
            // Load from storage here
            // convert from string to object
            // loop the object and put data into the listArray
            // Draw new list in HTML
            if (localStorage.getItem("todoList") != undefined) {
                let dataString = localStorage.getItem("todoList"); // get items from localstorage (string)
                dataJSON = JSON.parse(dataString); // convert string to JSON

                listArray = []; // Empty the listArray
                let list = dataJSON.items; // new var with the list of items from the JSON object
                for (let i = 0; i < list.length; i++) { // loop the items
                    listArray.push(list[i].name); // add (push) each item to listArray
                }
                js.items.setHtml(); // draw all items in the listArray as todo list items in the HTML
            }
        },
        setHtml: function () {
            // draw all items from arrayList as items on the todo list in the HTML

            const tooltip = "Left click to edit the item, right click to delete";
            let content = ""; // new empty string variable
            for (let i = 0; i < listArray.length; i++) { // loop listArray
                // add a new <a> tag for each item in listArray
                content += `
                    <a href="#" title="${tooltip}"  
                        onclick="javascript: js.item.edit(${i}); return false"
                        oncontextmenu="javascript: js.item.remove(${i}); return false"
                    >${listArray[i]}</a>
                `;
            }
            js.dom.write("#list", content); // write the string to HTML in the #list element
            js.items.save(); // save the list
        },
        deleteAll: function () {
            // delete the entire key/value in local storage
            let x = confirm("Do you want to delete the list?");
            if (x) {
                localStorage.removeItem("todoList"); // delete the "todoList" key from local storage
                listArray = []; // empty the listArray global variable
                js.dom.empty("#list"); // Remove all HTML in the #list HTML element
            }
        }
    },
    ui: {
        init: function () {
            // set event listener on input
            let elm = document.querySelector("#editItem");
            elm.addEventListener("keyup", function (event) {
                if (event.keyCode == 13) {
                    js.item.newItem(this.value);
                }
            });

            // set event listener on submit button
            document.querySelector("#submitBtn").addEventListener("click", function () {
                let elm = document.querySelector("#editItem");
                js.item.newItem(elm.value);
            });


            // set event listener on delete button
            document.querySelector("#deleteBtn").addEventListener("click", function () {
                js.items.deleteAll();
            });


            js.items.load(); // load items from local storage 
            js.ui.focus("#editItem"); // set focus to input
        },
        focus: function (targetSelector) {
            let elms = js.dom.find(targetSelector); // find elements
            elms[0].focus(); // set focus on the first element
        }
    }
}

js.ui.init();