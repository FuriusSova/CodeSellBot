const fs = require("fs");
const path = require("path")

const clearAccsFolder = async (id) => {
    fs.rm(`${path.resolve("./")}\\productsToSend\\formatSeparateFolders\\accs-${id}`, { recursive: true, force: true }, err => {
        if (err) {
            throw err;
        }
    });
}

module.exports = clearAccsFolder;