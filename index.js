const TelegramApi = require('node-telegram-bot-api')

const {gameOptions, againOptions} = require('./options')

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

const start = () => {
  bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === '/start') {
      await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/304/c4c/304c4c53-263b-4bee-a9d6-6d89ee579114/6.webp')
      return bot.sendMessage(chatId, `${msg.from.first_name}, добро пожаловать в телеграм бот, который с вероятностью 50% определяет, гей ты или нет!`)
    }
    if (text === '/info') {
      if (msg.from.last_name === undefined) {
        await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/1c5/0a9/1c50a938-54e6-41b0-a9fd-293f3599a7e9/192/16.webp')
        return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name}`)
      } else {
        await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/1c5/0a9/1c50a938-54e6-41b0-a9fd-293f3599a7e9/192/16.webp')
        return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`)
      }
    }
    if (text === '/game') {
      return startGame(chatId)
    }

    await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/629/439/62943973-f1e5-422a-91ff-0436fd9c9722/31.webp')
    return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй ещё раз!')
  })

  bot.on('callback_query', msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id
    if (data === '/again') {
      return startGame(chatId)
    }
    if (data == chats[chatId]) {
      return bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`, againOptions)
    } else {
      return bot.sendMessage(chatId, `К сожалению ты не угадал, я загадал цифру ${chats[chatId]}`, againOptions)
    }
  })
}

start()