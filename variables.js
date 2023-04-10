const wallet = "TCZHTU7pMdSCjku4WppSMvucbsrPRqTS9a";
const adminChatId = /* 392255827 */ 645845348;

const supportText = "Иди нахуй"
const reviewsText = "Ссылка на чат с отзывами. И иди нахуй"

const productDescription = `
Ваш продукт:    %s
Количество:     %d
Цена в USDT:    %d USDT

%s
`

const productTopUpDescription = `
Ваш продукт:    %s
Логин:          %s
Цена в USDT:    %d USDT

%s
`

const mainMenuText = "----- Главное меню -----";
const mainMenuKeyboard = [
    [
        {
            text: 'Коды',
            callback_data: "codes"
        },
        {
            text: "Аккаунты",
            callback_data: "accs"
        }
    ],
    [
        {
            text: 'Пополнить Steam',
            callback_data: "topupSteam"
        }
    ],
    [
        {
            text: 'Поддержка',
            callback_data: "support"
        },
        {
            text: 'Отзывы',
            callback_data: "reviews"
        }
    ]
];

const codesKeyboard = [
    [
        {
            text: "Турция",
            callback_data: "turkey-code"
        }
    ],
    [
        {
            text: "Европа",
            callback_data: "europe-code"
        }
    ],
    [
        {
            text: "Доллары",
            callback_data: "dollars-code"
        }
    ],
    [
        {
            text: "В главное меню",
            callback_data: "backToMain"
        }
    ]
]

const euCodesPriceKeyboard = [
    [
        {
            text: "5$",
            callback_data: "eu-code-5dol"
        }
    ],
    [
        {
            text: "10$",
            callback_data: "eu-code-10dol"
        }
    ],
    [
        {
            text: "20$",
            callback_data: "eu-code-20dol"
        }
    ],
    [
        {
            text: "В главное меню",
            callback_data: "backToMain"
        }
    ]
]

const dolCodesPriceKeyboard = [
    [
        {
            text: "5$",
            callback_data: "dol-code-5dol"
        }
    ],
    [
        {
            text: "10$",
            callback_data: "dol-code-10dol"
        }
    ],
    [
        {
            text: "20$",
            callback_data: "dol-code-20dol"
        }
    ],
    [
        {
            text: "В главное меню",
            callback_data: "backToMain"
        }
    ]
]

const turkishCodesPriceKeyboard = [
    [
        {
            text: "20 TL",
            callback_data: "turkey-code-20tl"
        }
    ],
    [
        {
            text: "50 TL",
            callback_data: "turkey-code-50tl"
        }
    ],
    [
        {
            text: "100 TL",
            callback_data: "turkey-code-100tl"
        }
    ],
    [
        {
            text: "200 TL",
            callback_data: "turkey-code-200tl"
        }
    ],
    [
        {
            text: "В главное меню",
            callback_data: "backToMain"
        }
    ]
]

const accsKeyboard = [
    [
        {
            text: "Открыт трейд, Мафайл + доступ к первой почте",
            callback_data: "acc1"
        }
    ],
    [
        {
            text: "Открыт трейд, открыта тп привязан двухфакторка + доступ к первой почте",
            callback_data: "acc2"
        }
    ],
    [
        {
            text: "Аккаунт с ксго 15$",
            callback_data: "acc3"
        }
    ],
    [
        {
            text: "В главное меню",
            callback_data: "backToMain"
        }
    ]
]

const backToMainButton = [
    [
        {
            text: "В главное меню",
            callback_data: "backToMain"
        }
    ]
]

const payButton = [
    [
        {
            text: "Оплатить",
            callback_data: "pay"
        }
    ]
]

const formatKeyboard = [
    [
        {
            text: "TXT + MaFiles folder",
            callback_data: "txt-mafiles"
        },
        {
            text: "Separate folders",
            callback_data: "sep-folders"
        }
    ],
    [
        {
            text: "В главное меню",
            callback_data: "backToMain"
        }
    ]
]


module.exports = {
    mainMenuKeyboard,
    wallet,
    codesKeyboard,
    turkishCodesPriceKeyboard,
    euCodesPriceKeyboard,
    dolCodesPriceKeyboard,
    accsKeyboard,
    formatKeyboard,
    backToMainButton,
    mainMenuText,
    adminChatId,
    productDescription,
    productTopUpDescription,
    payButton,
    supportText,
    reviewsText
}