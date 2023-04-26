//import fetch from 'node-fetch'
var data;
var album;
var photo;
var astore;
var pstore;
var abc;
var xyz;
var aphotos;
var z;
var psearchdata;
var grid = document.getElementsByClassName('grid-container')[0];
var modalgrid = document.getElementsByClassName('box')[0];
var modal = document.getElementById("myModal");
var box = document.getElementsByClassName("box")[0];
var cross = document.getElementsByClassName("close")[0];
async function api(url) {
    await fetch(url)
        .then(response => response.json()) //fetching data
        .then(json => data = json);
    return data;
}
(async () => {
    album = await api('https://jsonplaceholder.typicode.com/albums');
    //calling function for fetch
    photo = await api('https://jsonplaceholder.typicode.com/photos');
    const request = window.indexedDB.open("AssesDB", 5); //creating/opening a DB
    request.onupgradeneeded = e => //upgrading
     {
        const db = request.result;
        let astore = db.createObjectStore('albums', { keyPath: "albumId" }); //object store for albums
        astore.createIndex("userId", ["userId"], { unique: false });
        astore.createIndex("albumTitle", ["albumTitle"], { unique: false }); //creating indexes
        let pstore = db.createObjectStore('photos', { keyPath: "photoId" }); //object store for photos
        pstore.createIndex("albumId", ["albumId"]);
        pstore.createIndex("photoTitle", ["photoTitle"]);
        pstore.createIndex("photoURL", ["photoURL"]); //creating indexes
        pstore.createIndex('thumbnailURL', ["thumbnailURL"]);
    };
    request.onsuccess = e => {
        console.log("DB opened successfully");
        const db = request.result;
        const transaction1 = db.transaction("albums", 'readwrite');
        const astore = transaction1.objectStore("albums"); //add to album object store
        album.forEach((element) => {
            astore.put({ albumId: element.id, userId: element.userId, albumTitle: element.title });
        });
        const transaction2 = db.transaction("photos", 'readwrite');
        const pstore = transaction2.objectStore("photos"); //add to photo object store
        photo.forEach((element) => {
            pstore.put({ photoId: element.id, albumId: element.albumId, photoTitle: element.title, photoURL: element.url, thumbnailURL: element.thumbnailUrl });
        });
        const alb = astore.index('albumTitle');
        const albumdata = alb.getAll();
        albumdata.onsuccess = () => {
            abc = albumdata.result;
            abc.forEach((element) => {
                grid.innerHTML += `<div class="grid-item" id="${element.albumId}" onclick="openModal(${element.albumId});"><div id="title">${element.albumTitle}</div></div>`;
            });
        };
        const photodata = pstore.index('photoURL').getAll();
        photodata.onsuccess = () => {
            xyz = photodata.result;
        };
        transaction1.oncomplete = () => db.close();
    };
    request.onerror = e => {
        console.error(`Database error`);
    };
})();
function search() {
    grid.innerHTML = "";
    var t = document.getElementById('search-input');
    var text = t.value; //search function
    if (text.length != 0) {
        abc.forEach((element) => {
            if ((element.albumTitle).includes(text)) {
                if (grid.innerHTML.includes(element.albumTitle)) { }
                else {
                    grid.innerHTML += `<div class="grid-item" id="${element.albumId}" onclick="openModal(${element.albumId});"><div id="title">${element.albumTitle}</div></div>`;
                }
            }
        });
    }
    else {
        grid.innerHTML = "";
        abc.forEach((element) => {
            grid.innerHTML += `<div class="grid-item" id="${element.albumId}" onclick="openModal(${element.albumId});"><div id="title">${element.albumTitle}</div></div>`;
        });
    }
}
function debounce(func, timeout = 500) {
    let timer; //debounce function
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}
const processChange = debounce(() => search());
const eventChange = debounce(() => modalsearch());
function modalsearch() {
    box.innerHTML = "";
    var t = document.getElementById('p-search-input');
    var text = t.value;
    const request = window.indexedDB.open("AssesDB", 5);
    request.onsuccess = () => {
        const db = request.result;
        const transaction1 = db.transaction("photos", 'readwrite');
        const p = transaction1.objectStore("photos");
        const pdata = p.index("albumId");
        const ptitle = pdata.getAll([z]);
        ptitle.onsuccess = function () {
            if (text.length != 0) {
                ptitle.result.forEach((element) => {
                    if ((element.photoTitle).includes(text)) {
                        if (box.innerHTML.includes(element.photoTitle)) { }
                        else {
                            box.innerHTML += `<div class='photo-card'><img id="albumphoto" src="${element.photoURL}"><div class="ptitle">${element.photoTitle}</div></div>`;
                        }
                    }
                });
            }
            else {
                box.innerHTML = "";
                console.log('hi');
                ptitle.result.forEach((element) => {
                    box.innerHTML += `<div class='photo-card'><img id="albumphoto" src="${element.photoURL}"><div class="ptitle">${element.photoTitle}</div></div>`;
                });
            }
        };
    };
}
function openModal(id) {
    z = id; //opening the modal
    const request = window.indexedDB.open("AssesDB", 5);
    request.onsuccess = () => {
        const db = request.result;
        const transaction1 = db.transaction("photos", 'readwrite');
        const p = transaction1.objectStore("photos");
        const pdata = p.index("albumId");
        const p2 = pdata.getAll([id]);
        p2.onsuccess = function () {
            p2.result.forEach((element) => {
                box.innerHTML += `<div class='photo-card'><img id="albumphoto" src="${element.photoURL}"><div class="ptitle">${element.photoTitle}</div></div>`;
            });
        };
    };
    modal.style.display = "block";
    box.innerHTML = "";
    cross.onclick = function () {
        modal.style.display = "none";
    };
}
function deleteDB() {
    var request = indexedDB.deleteDatabase("AssesDB");
}
