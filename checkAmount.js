const fs = require("fs");
const path = require("path")

const checkAmount = async (product) => {
    const arrOfFolderNames = JSON.parse(product);
    let pathToProductTxt = path.resolve("./");
    for (const folderName of arrOfFolderNames) {
        pathToProductTxt += `\\${folderName}`;
    }
    pathToProductTxt += `\\${arrOfFolderNames[0]}.txt`;
    const arrOfProducts = fs.readFileSync(pathToProductTxt, { encoding: 'utf8' }).split("\r\n");

    return arrOfProducts.length;
}

module.exports = checkAmount;