const path = require("path")
const AdmZip = require("adm-zip");

const createZipSepFolders = async (accs, id) => {
    let zip = new AdmZip();
    zip.addLocalFolder(`${path.resolve("./")}/productsToSend/formatSeparateFolders/accs-${id}`);
    zip.writeZip(`${path.resolve("./")}\\productsToSend\\formatSeparateFolders\\${id}-accs.zip`);
}

module.exports = createZipSepFolders;