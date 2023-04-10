const fs = require("fs");
const path = require("path")

const clearMaFilesFolder = async (id) => {
    fs.rm(`${path.resolve("./")}\\productsToSend\\formatTxtMaFiles\\maFiles-${id}`, { recursive: true, force: true }, err => {
        if (err) {
            throw err;
        }
    });
}

module.exports = clearMaFilesFolder;