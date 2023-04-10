const fs = require("fs");
const path = require("path")

const formatTxtMaFiles = async (pathToProduct, accsToSend, id) => {
    fs.mkdirSync(`${path.resolve("./")}\\productsToSend\\formatTxtMaFiles\\maFiles-${id}`);
    fs.mkdirSync(`${path.resolve("./")}\\productsToSend\\formatTxtMaFiles\\maFiles-${id}\\maFiles-${id}`);

    for (const acc of accsToSend) {
        const maFileName = acc.substring(0, acc.indexOf(":"));
        fs.renameSync(`${pathToProduct}\\maFiles\\${maFileName}.maFile`, `${path.resolve("./")}\\productsToSend\\formatTxtMaFiles\\maFiles-${id}\\maFiles-${id}\\${maFileName}.maFile`)
    }
}

module.exports = formatTxtMaFiles;