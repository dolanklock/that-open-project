'use strict';


const newUserBtn = document.getElementById('new-user-btn');
const newUserDialog = document.getElementById('dialog');
const dialogCloseBtn = document.getElementById('cancel-btn');

newUserBtn.addEventListener('click', function(event) {
    event.preventDefault();
    newUserDialog.showModal();
});

// dialogCloseBtn.addEventListener('click', function() {
//     newUserDialog.close();
// })




