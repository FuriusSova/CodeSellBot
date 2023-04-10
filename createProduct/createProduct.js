const fs = require("fs");
const path = require("path")
// Local dependencies
const clearMaFilesFolder = require("./clearMafilesFolder");
const clearAccsFolder = require("./clearAccsFolder");
const createZipTxtMafiles = require("./createZipTxtMafiles");
const createZipSepFolders = require("./createZipSepFolders");
const formatTxtMaFiles = require("./formatTxtMaFiles");
const formatSeparateFolders = require("./formatSeparateFolders");

const createProduct = async (product, amount, id, format) => {
    const arrOfFolderNames = JSON.parse(product);
    let pathToProduct = path.resolve("./");
    for (const folderName of arrOfFolderNames) {
        pathToProduct += `\\${folderName}`;
    }
    let pathToProductTxt = pathToProduct;
    pathToProductTxt += `\\${arrOfFolderNames[0]}.txt`;

    if (arrOfFolderNames[0] == "codes") {
        const arrOfCodes = fs.readFileSync(pathToProductTxt, { encoding: 'utf8' }).split("\r\n");
        const codesToSend = [];
        
        for (let i = 0; i < amount; i++) {
            codesToSend.push(arrOfCodes.shift());
        }

        fs.writeFileSync(pathToProductTxt, arrOfCodes.join("\r\n"), { encoding: 'utf8' });
        fs.writeFileSync(`${path.resolve("./")}\\productsToSend\\codes\\codes-${id}.txt`, codesToSend.join("\r\n"), { encoding: 'utf8' });
    } else if (arrOfFolderNames[0] == "accounts") {
        const arrOfAccs = fs.readFileSync(pathToProductTxt, { encoding: 'utf8' }).split("\r\n");

        const accsToSend = [];

        for (let i = 0; i < amount; i++) {
            accsToSend.push(arrOfAccs.shift());
        }

        fs.writeFileSync(pathToProductTxt, arrOfAccs.join("\r\n"), { encoding: 'utf8' });

        if (format == "txt-mafiles") {
            await formatTxtMaFiles(pathToProduct, accsToSend, id);
            await createZipTxtMafiles(accsToSend, id, "formatTxtMaFiles");
            await clearMaFilesFolder(id);
        } else if (format == "sep-folders") {
            await formatSeparateFolders(pathToProduct, accsToSend, id);
            await createZipSepFolders(accsToSend, id, "formatSeparateFolders");
            await clearAccsFolder(id);
        }
    }
}

module.exports = createProduct;