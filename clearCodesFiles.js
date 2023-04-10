const fs = require("fs");
const path = require("path");

const clearCodesFiles = async (id) => {
    fs.unlinkSync(`${path.resolve("./")}\\productsToSend\\codes\\codes-${id}.txt`)
}

module.exports = clearCodesFiles;