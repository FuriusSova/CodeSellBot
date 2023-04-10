const fs = require("fs");
const path = require("path")

const formatSeparateFolders = async (pathToProduct, accsToSend, id) => {
    fs.mkdirSync(`${path.resolve("./")}\\productsToSend\\formatSeparateFolders\\accs-${id}`);
    fs.mkdirSync(`${path.resolve("./")}\\productsToSend\\formatSeparateFolders\\accs-${id}\\accs-${id}`);

    for (const acc of accsToSend) {
        const maFileName = acc.substring(0, acc.indexOf(":"));
        fs.mkdirSync(`${path.resolve("./")}\\productsToSend\\formatSeparateFolders\\accs-${id}\\accs-${id}\\${maFileName}`);
        fs.renameSync(`${pathToProduct}\\maFiles\\${maFileName}.maFile`, `${path.resolve("./")}\\productsToSend\\formatSeparateFolders\\accs-${id}\\accs-${id}\\${maFileName}\\${maFileName}.maFile`);
        fs.writeFileSync(`${path.resolve("./")}\\productsToSend\\formatSeparateFolders\\accs-${id}\\accs-${id}\\${maFileName}\\${maFileName}.txt`, acc, { encoding: 'utf8' });
    }
}

module.exports = formatSeparateFolders;