const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')

const token='5526663711:AAFgzZl8hjT1LP8U_p-qbJ6HKAv_v1FrMrQ'
const webAppUrl = 'https://willowy-shortbread-781f01.netlify.app'

const bot = new TelegramBot(token, {polling: true})
const app = express()

app.use(express.json())
app.use(cors())

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start'){
        //Большая кнопка keyboard
        await bot.sendMessage(chatId, 'Ниже появится кнопка', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })

        //Инлайновая кнопка inline_keyboard
        await bot.sendMessage(chatId, 'Заходи в наш магазин', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Инлайн кнопка', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if(msg?.web_app_data?.data){
        try {
            const data = JSON.parse(msg?.web_app_data?.data)

            await bot.sendMessage(chatId, `Спасибо за обратную связь!\nВаша страна: ${data?.country}\nВаша улица: ${data?.street}`)

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию Вы получите в этом чате')
            }, 3000)
        } catch (e) {
            console.log(e)
        }
    }
})

app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: `Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({})
    } catch (error) {
        return res.status(500).json({})
    }
        
})

const PORT = 8000
app.listen(PORT, () => console.log('Server started on PORT: ' + PORT))