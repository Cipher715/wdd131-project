const currentdate = new Date();

document.querySelector('#year').textContent = currentdate.getFullYear();
document.querySelector('#lastModified').textContent = `Last Modified: ${document.lastModified}`;