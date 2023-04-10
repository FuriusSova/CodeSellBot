const fs = require("fs");
const path = require("path");

const clearZipFiles = async (folder, id) => {
    fs.unlinkSync(`${path.resolve("./")}\\productsToSend\\${folder}\\${id}-accs.zip`)
}

module.exports = clearZipFiles;