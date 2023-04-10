const path = require("path")
const AdmZip = require("adm-zip");

const createZipTxtMafiles = async (accs, id) => {
    let zip = new AdmZip();
    zip.addFile("accounts.txt", Buffer.from(accs.join("\r\n"), "utf8"));
    zip.addLocalFolder(`${path.resolve("./")}/productsToSend/formatTxtMaFiles/maFiles-${id}`);
    zip.writeZip(`${path.resolve("./")}\\productsToSend\\formatTxtMaFiles\\${id}-accs.zip`);
}

module.exports = createZipTxtMafiles;