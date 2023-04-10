const axios = require("axios");
// Local dependencies
const vars = require("./variables");

const checkTransaction = async (id, fee) => {
    return await axios.get(`https://apilist.tronscan.org/api/transaction-info?hash=${id}`)
        .then(({ data }) => {
            if(!data) return false;

            let amountOfNumbers = data.tokenTransferInfo.amount_str.length - data.tokenTransferInfo.decimals;
            let cost = +(data.tokenTransferInfo.amount_str.slice(0, amountOfNumbers) + "." + data.tokenTransferInfo.amount_str.slice(amountOfNumbers))

            if(data.contractRet != "SUCCESS") return false;
            if(data.tokenTransferInfo.to_address != vars.wallet) return false;
            /* if(cost != fee && cost < fee) return false; */

            return true;
        });
};

module.exports = checkTransaction;
