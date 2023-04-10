const clearUserData = async (user) => {
    user.fee = null;
    user.product = null;
    user.amount = null;
    user.loginSteam = null;
    user.isChooseAmount = false;
    user.isTopUpSteam = false;
    user.paymentVerify = false;
    user.replyLogin = false;

    await user.save();
}

module.exports = clearUserData;