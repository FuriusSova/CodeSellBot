const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db");

class User extends Model {}

User.init({
    chat_id:        { type: DataTypes.BIGINT,   unique: true },
    username:       { type: DataTypes.STRING,   unique: true },
    fee:            { type: DataTypes.DOUBLE,  defaultValue: null },
    product:        { type: DataTypes.TEXT,   defaultValue: null },
    amount:         { type: DataTypes.INTEGER,  defaultValue: null },
    format:         { type: DataTypes.STRING,  defaultValue: null },
    paymentVerify:  { type: DataTypes.BOOLEAN,  defaultValue: false },
    isChooseAmount: { type: DataTypes.BOOLEAN,  defaultValue: false },
    isTopUpSteam:   { type: DataTypes.BOOLEAN,  defaultValue: false },
    replyLogin:     { type: DataTypes.BOOLEAN,  defaultValue: false },
    loginSteam:     { type: DataTypes.STRING,  defaultValue: null }   
}, { sequelize, modelName: "user_model", timestamps: false })

module.exports = User;