const TelegramApi = require('node-telegram-bot-api')

const {gameOptions, againOptions} = require('./options')

const sequelize = require('./db')

const UserModel = require('./models')

const token = '5242564995:AAHZ76C5-XmtIsa5MXqtFTLerrnNrPE4WF8'

const bot = new TelegramApi(token, {
  polling: true
})

const chats = {}

bot.setMyCommands([{
    command: '/start',
    description: 'Начальное приветствие'
  },
  {
    command: '/info',
    description: 'Информация о пользователе'
  },
  {
    command: '/game',
    description: 'Игра угадай цифру'
  },
])

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен её угадать!`)
  const randomNumber = Math.floor(Math.random() * 10)
  chats[chatId] = randomNumber
  await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = async () => {

  try {
    await sequelize.authenticate()
    await sequelize.sync()
  } catch (e) {
    console.log('Подключение к бд сломалось');
  }

  bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    try {
      if (text === '/start') {
        await UserModel.create({chatId})
        await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/304/c4c/304c4c53-263b-4bee-a9d6-6d89ee579114/6.webp')
        return bot.sendMessage(chatId, `${msg.from.first_name}, добро пожаловать в телеграм бот, который с вероятностью 50% определяет, гей ты или нет!`)
      }
      if (text === '/info') {
        const user = await UserModel.findOne({chatId})
        if (msg.from.last_name === undefined) {
          await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/1c5/0a9/1c50a938-54e6-41b0-a9fd-293f3599a7e9/192/16.webp')
          return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name}, в игре у тебя правильных ответов: ${user.right}, неправильных: ${user.wrong}.`)
        } else {
          await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/1c5/0a9/1c50a938-54e6-41b0-a9fd-293f3599a7e9/192/16.webp')
          return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}, в игре у тебя правильных ответов: ${user.right}, неправильных: ${user.wrong}.`)
        }
      }
      if (text === '/game') {
        return startGame(chatId)
      }

      await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/629/439/62943973-f1e5-422a-91ff-0436fd9c9722/31.webp')
      return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй ещё раз!')
    } catch (e) {
      return bot.sendMessage(chatId, 'Произошла какая-то ошибочка!')
    }    
  })

  bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id
    if (data === '/again') {
      return startGame(chatId)
    }
    const user = await UserModel.findOne({chatId})

    if (data == chats[chatId]) {
      user.right += 1
      await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`, againOptions)
    } else {
      user.wrong += 1
      await bot.sendMessage(chatId, `К сожалению ты не угадал, я загадал цифру ${chats[chatId]}`, againOptions)
    }
    await user.save()
  })
}

start()