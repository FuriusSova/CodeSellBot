require("dotenv").config();
const path = require("path")
const fs = require("fs");
const util = require("util");
// Configure the bot
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
// Connect database
const sequelize = require("./database/db");
sequelize.sync(/* {force:true} */).then(() => console.log("Database has been connected"));
// Local dependencies
const vars = require("./variables");
const createProduct = require("./createProduct/createProduct");
const checkTransaction = require("./checkTransaction");
const clearZipFiles = require("./clearZipFiles");
const clearCodesFiles = require("./clearCodesFiles");
const clearUserData = require("./clearUserData");
const checkAmount = require("./checkAmount");
const User = require("./database/UserModel");

// Bot on messages

bot.onText(/\/start/, async (msg) => {
    await bot.sendMessage(msg.chat.id, vars.mainMenuText, {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: vars.mainMenuKeyboard
        }
    });
    const createdUser = await User.findOne({ where: { chat_id: msg.chat.id } });
    if (!createdUser) {
        await User.create({
            chat_id: msg.chat.id,
            username: msg.chat.username
        })
        return;
    } else if (createdUser.username != msg.chat.username) {
        createdUser.username = msg.chat.username;
    }

    await clearUserData(createdUser);
})

bot.onText(/\/check_payment (.+)/, async (msg, match) => {
    const createdUser = await User.findOne({ where: { chat_id: msg.chat.id } });

    if (!createdUser.paymentVerify) {
        await bot.sendMessage(msg.chat.id, 'Вы не нажимали кнопку "Оплата"');
        return;
    }

    if (!(createdUser.fee && createdUser.product && createdUser.amount) && !(createdUser.isTopUpSteam && createdUser.product && createdUser.fee)) {
        await bot.sendMessage(msg.chat.id, "Вы не выбрали какой продукт оплачивать");
        return;
    }

    await bot.sendMessage(msg.chat.id, "Проверяем оплату...");

    const resp = match[1];

    const transactions = JSON.parse(fs.readFileSync(`${path.resolve("./")}\\completedTransactions\\transactions.json`));
    for (const transaction of transactions) {
        if (transaction == resp) {
            await bot.deleteMessage(msg.chat.id, msg.message_id + 1);
            await bot.sendMessage(msg.chat.id, "Не, не прокатит", {
                reply_markup: {
                    resize_keyboard: true,
                    inline_keyboard: vars.backToMainButton
                }
            });
            return;
        }
    }

    let response = await checkTransaction(resp, createdUser.fee);
    // Check if response is true, then give him a product
    if (!response) {
        await bot.sendMessage(msg.chat.id, "Оплата не прошла, повторите попытку или обратитесь в поддержку", {
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: vars.backToMainButton
            }
        });
        return;
    }
    // Check if response is true, then give him a product

    transactions.push(resp);
    fs.writeFileSync(`${path.resolve("./")}\\completedTransactions\\transactions.json`, `${JSON.stringify(transactions)}`);

    const product = JSON.parse(createdUser.product)[0];

    if (product == "codes") {
        await bot.deleteMessage(msg.chat.id, msg.message_id + 1);
        await createProduct(createdUser.product, createdUser.amount, msg.chat.id, "codes");
        await bot.sendMessage(msg.chat.id, "Ваши коды:");
        await bot.sendDocument(msg.chat.id, `${path.resolve("./")}\\productsToSend\\codes\\codes-${msg.chat.id}.txt`);
        await bot.sendMessage(msg.chat.id, vars.mainMenuText, {
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: vars.mainMenuKeyboard
            }
        });
        await clearCodesFiles(msg.chat.id);
    } else if (product == "accounts") {
        await bot.deleteMessage(msg.chat.id, msg.message_id + 1);
        await bot.sendMessage(msg.chat.id, "Выберите формат аккаунтов", {
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: vars.formatKeyboard
            }
        })
    } else if (product == "Top up Steam") {
        await bot.sendMessage(msg.chat.id, "Ваш Steam будет пополнен в течении 30 минут", {
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: vars.backToMainButton
            }
        })

        await bot.sendMessage(vars.adminChatId, `Пополни стим этому дурику: @${msg.chat.username}. Логин стим: ${createdUser.loginSteam} на ${createdUser.fee}$. Хеш транзакции: ${resp}`);
        await clearUserData(createdUser);
    }
});

bot.onText(/^[0-9]+$/, async (msg) => {
    const createdUser = await User.findOne({ where: { chat_id: msg.chat.id } });
    const amount = +msg.text;
    createdUser.amount = amount;

    if (createdUser.isChooseAmount && !createdUser.isTopUpSteam && !createdUser.replyLogin) {
        const amountAvailable = await checkAmount(createdUser.product);
        if (amountAvailable < amount) {
            await bot.sendMessage(msg.chat.id, `Такое количество недоступно, в наличии: ${amountAvailable}`, {
                reply_markup: {
                    resize_keyboard: true,
                    inline_keyboard: vars.backToMainButton
                }
            })
            return;
        }

        createdUser.fee = amount * createdUser.fee;
        await createdUser.save();

        const product = JSON.parse(createdUser.product)[1];
        const productToShow = product == "Турция" || product == "Европа" || product == "Доллары" ? `Коды: ${product}` : product;

        await bot.sendMessage(msg.chat.id, util.format(vars.productDescription, productToShow, createdUser.amount, createdUser.fee, 'Если все верно, жмите кнопку "Оплатить" снизу'), {
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: vars.payButton
            }
        });
    } else if (createdUser.isTopUpSteam && !createdUser.isChooseAmount && !createdUser.replyLogin) {
        await bot.sendMessage(msg.chat.id, "Напишите пожалуйста логин от своего Steam аккаунта", {
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: vars.backToMainButton
            }
        });
        createdUser.replyLogin = true;
        await createdUser.save();
    }
})

// Bot on messages
bot.on('message', async (msg) => {
    if (!msg.text) return;
    if(msg.text.includes("/start") || msg.text.includes("/check_payment")) return;
    const createdUser = await User.findOne({ where: { chat_id: msg.chat.id } });

    if (createdUser.replyLogin) {
        createdUser.loginSteam = msg.text;

        await bot.sendMessage(msg.chat.id, `Вы хотите пополнить баланс Steam с именем пользователя ${msg.text} на ${createdUser.amount}$. Если это верно, нажмите кнопку "Оплатить" снизу`, {
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: vars.payButton
            }
        });

        createdUser.product = JSON.stringify(["Top up Steam"]);
        createdUser.fee = createdUser.amount;
        createdUser.replyLogin = false;
        createdUser.save();
    }
})

// Bot on buttons
bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const msg = callbackQuery.message;
    const createdUser = await User.findOne({ where: { chat_id: msg.chat.id } });

    let wayToProductFolder;

    // Accs
    if (data == "acc1") {
        wayToProductFolder = ["accounts", "Открыт трейд, Мафайл + доступ к первой почте"];
        createdUser.fee = 1.7;
    } else if (data == "acc2") {
        wayToProductFolder = ["accounts", "Открыт трейд, открыта тп привязан двухфакторка + доступ к первой почте"];
        createdUser.fee = 4.5;
    } else if (data == "acc3") {
        wayToProductFolder = ["accounts", "Аккаунт с ксго 15$"];
        createdUser.fee = 17;
        // Codes
    } else if (data == "turkey-code-20tl") {
        wayToProductFolder = ["codes", "Турция", "20 TL"];
        createdUser.fee = 1.04;
    } else if (data == "turkey-code-50tl") {
        wayToProductFolder = ["codes", "Турция", "50 TL"];
        createdUser.fee = 2.61;
    } else if (data == "turkey-code-100tl") {
        wayToProductFolder = ["codes", "Турция", "100 TL"];
        createdUser.fee = 5.22;
    } else if (data == "turkey-code-200tl") {
        wayToProductFolder = ["codes", "Турция", "200 TL"];
        createdUser.fee = 10.45;
    } else if (data == "eu-code-5dol") {
        wayToProductFolder = ["codes", "Европа", "5$"];
        createdUser.fee = 5;
    } else if (data == "eu-code-10dol") {
        wayToProductFolder = ["codes", "Европа", "10$"];
        createdUser.fee = 10;
    } else if (data == "eu-code-20dol") {
        wayToProductFolder = ["codes", "Европа", "20$"];
        createdUser.fee = 20;
    } else if (data == "dol-code-5dol") {
        wayToProductFolder = ["codes", "Доллары", "5$"];
        createdUser.fee = 5;
    } else if (data == "dol-code-10dol") {
        wayToProductFolder = ["codes", "Доллары", "10$"];
        createdUser.fee = 10;
    } else if (data == "dol-code-20dol") {
        wayToProductFolder = ["codes", "Доллары", "20$"];
        createdUser.fee = 20;
    }

    // Choose product -------------------------------
    if (data == "codes") {
        await bot.editMessageText("Коды", {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        await bot.editMessageReplyMarkup({
            resize_keyboard: true,
            inline_keyboard: vars.codesKeyboard
        }, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });

        await clearUserData(createdUser);
    } else if (data == "turkey-code") {
        await bot.editMessageText("Выберите ценовую категорию", {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        await bot.editMessageReplyMarkup({
            resize_keyboard: true,
            inline_keyboard: vars.turkishCodesPriceKeyboard
        }, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
    } else if (data == "europe-code") {
        await bot.editMessageText("Выберите ценовую категорию", {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        await bot.editMessageReplyMarkup({
            resize_keyboard: true,
            inline_keyboard: vars.euCodesPriceKeyboard
        }, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
    } else if (data == "dollars-code") {
        await bot.editMessageText("Выберите ценовую категорию", {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        await bot.editMessageReplyMarkup({
            resize_keyboard: true,
            inline_keyboard: vars.dolCodesPriceKeyboard
        }, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
    } else if (data == "turkey-code-20tl" || data == "turkey-code-50tl" || data == "turkey-code-100tl" || data == "turkey-code-200tl" || data == "eu-code-5dol" || data == "eu-code-10dol" || data == "eu-code-20dol" || data == "dol-code-5dol" || data == "dol-code-10dol" || data == "dol-code-20dol") {
        await bot.editMessageText("Напишите и отправьте кол-во кодов", {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        await bot.editMessageReplyMarkup({
            resize_keyboard: true,
            inline_keyboard: vars.backToMainButton
        }, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        createdUser.product = JSON.stringify(wayToProductFolder);
        createdUser.isChooseAmount = true;
        await createdUser.save();
    } else if (data == "accs") {
        await bot.editMessageText("Аккаунты", {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        await bot.editMessageReplyMarkup({
            resize_keyboard: true,
            inline_keyboard: vars.accsKeyboard
        }, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });

        await clearUserData(createdUser);
    } else if (data == "acc1" || data == "acc2" || data == "acc3") {
        await bot.editMessageText("Напишите и отправьте кол-во аккаунтов", {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        await bot.editMessageReplyMarkup({
            resize_keyboard: true,
            inline_keyboard: vars.backToMainButton
        }, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        createdUser.product = JSON.stringify(wayToProductFolder);
        createdUser.isChooseAmount = true;
        await createdUser.save();
        // Top Up Steam
    } else if (data == "topupSteam") {
        await bot.editMessageText("Напишите и отправьте сумму на которую Вам нужно выполнить пополнение", {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        await bot.editMessageReplyMarkup({
            resize_keyboard: true,
            inline_keyboard: vars.backToMainButton
        }, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        await clearUserData(createdUser);

        createdUser.isTopUpSteam = true;
        createdUser.save();

        // Pay -------------------------------
    } else if (data == "pay") {
        const product = JSON.parse(createdUser.product)[1] == undefined ? JSON.parse(createdUser.product)[0] : JSON.parse(createdUser.product)[1];
        const productToShow = product == "Турция" || product == "Европа" || product == "Доллары" ? `Коды: ${product}` : product;

        if (productToShow == "Top up Steam") {
            await bot.editMessageText(util.format(vars.productTopUpDescription, productToShow, createdUser.loginSteam, createdUser.fee, 'После оплаты, используйте команду /check_payment hash , где hash - это hash вашей транзакции, к примеру: /check_payment 2d28df502a597560bcf5a26b55b8c3de8cd588a2766e8ee63c5d96687bac57d5'), {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else {
            await bot.editMessageText(util.format(vars.productDescription, productToShow, createdUser.amount, createdUser.fee, 'После оплаты, используйте команду /check_payment hash , где hash - это hash вашей транзакции, к примеру: /check_payment 2d28df502a597560bcf5a26b55b8c3de8cd588a2766e8ee63c5d96687bac57d5'), {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        }
        await bot.editMessageReplyMarkup({
            resize_keyboard: true,
            inline_keyboard: vars.backToMainButton
        }, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        createdUser.paymentVerify = true;
        createdUser.save();
        // Back to main menu -------------------------------
    } else if (data == "backToMain") {
        await bot.editMessageText(vars.mainMenuText, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
        await bot.editMessageReplyMarkup({
            resize_keyboard: true,
            inline_keyboard: vars.mainMenuKeyboard
        }, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });

        await clearUserData(createdUser);
        // Choose format -------------------------------
    } else if (data == "txt-mafiles") {
        await bot.deleteMessage(msg.chat.id, msg.message_id);
        await bot.sendMessage(msg.chat.id, "Формируем файлы...");
        await createProduct(createdUser.product, createdUser.amount, msg.chat.id, data);
        await bot.editMessageText("Ваши файлы сформированы:", {
            chat_id: msg.chat.id,
            message_id: msg.message_id + 1
        })
        await bot.sendDocument(msg.chat.id, `${path.resolve("./")}\\productsToSend\\formatTxtMaFiles\\${msg.chat.id}-accs.zip`)
        await bot.sendMessage(msg.chat.id, vars.mainMenuText, {
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: vars.mainMenuKeyboard
            }
        });
        await clearZipFiles("formatTxtMaFiles", msg.chat.id);
        await clearUserData(createdUser);
    } else if (data == "sep-folders") {
        await bot.deleteMessage(msg.chat.id, msg.message_id);
        await bot.sendMessage(msg.chat.id, "Формируем файлы...");
        await createProduct(createdUser.product, createdUser.amount, msg.chat.id, data);
        await bot.editMessageText("Ваши файлы сформированы:", {
            chat_id: msg.chat.id,
            message_id: msg.message_id + 1
        })
        await bot.sendDocument(msg.chat.id, `${path.resolve("./")}\\productsToSend\\formatSeparateFolders\\${msg.chat.id}-accs.zip`)
        await bot.sendMessage(msg.chat.id, vars.mainMenuText, {
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: vars.mainMenuKeyboard
            }
        });
        await clearZipFiles("formatSeparateFolders", msg.chat.id);
        await clearUserData(createdUser);
    } else if (data == "support"){
        await bot.sendMessage(msg.chat.id, vars.supportText);
    } else if (data == "reviews"){
        await bot.sendMessage(msg.chat.id, vars.reviewsText);
    }
});

