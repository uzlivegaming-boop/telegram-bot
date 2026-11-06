const { Telegraf, Markup } = require('telegraf')
const prisma = require('./prisma')

const bot = new Telegraf(process.env.BOT_TOKEN)




// Start
bot.start(ctx => {
    ctx.reply(`Welcome ${ctx.from.first_name} to my first bot`,
        Markup.keyboard([
            Markup.button.contactRequest('📞 Telefon nomerizni kiriting !?')
        ]).resize().oneTime()
    )
})


bot.command('app', ctx => {
    ctx.reply('📱 Bot ilovas',
        Markup.inlineKeyboard([
           [ Markup.button.webApp('📱 Ilovani ochish', 'https://preview--fn2gameverse.lovable.app/')]
        ])
    )
})


bot.on('contact', async ctx => {

  const exsist = await prisma.user.findUnique({ where:  { phone: ctx.message.contact.phone_number } })

    if (!exsist) {
        await prisma.user.create({
            data: { name: ctx.from.first_name, phone: ctx.message.contact.phone_number }
        })
    }

    await ctx.reply(
        `👋 Assalomu alaykum, ${ctx.from.first_name}!\n\n` +
        '🤖 <b>Ma’lumotlar botiga xush kelibsiz!</b>\n\n' +
        'Kerakli bo‘limni tanlang:',
        {
            parse_mode: 'HTML',
            ...mainKeyboard
        }
    )

    await ctx.reply(exsist ? 'Siz avval ro‘yxatdan o‘tgansiz.' : '✅ Muvaffaqiyatli ro‘yxatdan o‘tdingiz!',
    Markup.inlineKeyboard([
      [Markup.button.url('1 chi kanal', 'https://t.me/visualstudiodownload')],
      [Markup.button.callback(`✅ Obuna bo'ldim`, 'done')],
    ])
  )
})

bot.action('done', async ctx => {
  await ctx.answerCbQuery()
  const member = await ctx.telegram.getChatMember('@visualstudiodownload', ctx.from.id)
  console.log(member)
  const isMember = ['creator', 'administrator', 'member'].includes(member.status) ||
    (member.status === 'restricted' && member.is_member)

  if (!isMember)
    return ctx.reply("Avval kanalga obuna bo'ling !?")

  return ctx.reply("✅ Obuna bo'lganingiz tekshirildi !?")
})



const mainKeyboard = Markup.keyboard([
    ['👤 Men haqimda'],
    ['🤖 Bot haqida'],
    ['📋 User va Bot ma’lumotlari']
]).resize()

function getValue(value) {
    if (value === undefined || value === null || value === '') {
        return 'Mavjud emas'
    }

    return String(value)
}

function getBoolean(value) {
    if (value === undefined || value === null) {
        return 'Mavjud emas'
    }

    return value ? 'Ha' : 'Yo‘q'
}

function userInfo(user) {
    return [
        '👤 <b>FOYDALANUVCHI MA’LUMOTLARI</b>',
        '',
        `🆔 <b>ID:</b> <code>${getValue(user.id)}</code>`,
        `👤 <b>Ism:</b> ${getValue(user.first_name)}`,
        `👥 <b>Familiya:</b> ${getValue(user.last_name)}`,
        `🔗 <b>Username:</b> ${user.username ? '@' + user.username : 'Mavjud emas'}`,
        `🤖 <b>Bot hisoblanadimi:</b> ${getBoolean(user.is_bot)}`,
        `⭐ <b>Premium:</b> ${getBoolean(user.is_premium)}`,
        `🌐 <b>Til kodi:</b> ${getValue(user.language_code)}`,
        `📎 <b>Attachment menyusi:</b> ${getBoolean(user.added_to_attachment_menu)}`,
        `💬 <b>Botga xabar yozishga ruxsat:</b> ${getBoolean(user.can_connect_to_business)}`
    ].join('\n')
}

function botInfo(botData) {
    return [
        '🤖 <b>BOT MA’LUMOTLARI</b>',
        '',
        `🆔 <b>Bot ID:</b> <code>${getValue(botData.id)}</code>`,
        `📛 <b>Bot nomi:</b> ${getValue(botData.first_name)}`,
        `🔗 <b>Username:</b> ${botData.username ? '@' + botData.username : 'Mavjud emas'}`,
        `🤖 <b>Bot hisoblanadimi:</b> ${getBoolean(botData.is_bot)}`,
        `👥 <b>Guruhlarga qo‘shish:</b> ${getBoolean(botData.can_join_groups)}`,
        `📨 <b>Guruh xabarlarini o‘qish:</b> ${getBoolean(botData.can_read_all_group_messages)}`,
        `⚡ <b>Inline rejim:</b> ${getBoolean(botData.supports_inline_queries)}`,
        `💼 <b>Business ulanishi:</b> ${getBoolean(botData.can_connect_to_business)}`,
        `🌐 <b>Mini App:</b> ${getBoolean(botData.has_main_web_app)}`,
        '',
        '🛠 <b>Texnologiyalar</b>',
        '• Node.js',
        '• Telegraf.js',
        '• Telegram Bot API',
        '',
        '📌 <b>Vazifasi:</b> User va bot ma’lumotlarini ko‘rsatish.'
    ].join('\n')
}

bot.hears('👤 Men haqimda', async (ctx) => {
    await ctx.reply(userInfo(ctx.from), {
        parse_mode: 'HTML',
        ...Markup.keyboard([
            ['👤 Men haqimda'],
            ['🤖 Bot haqida'],
            ['📋 User va Bot ma’lumotlari']
        ]).resize()
    })
})

bot.hears('🤖 Bot haqida', async (ctx) => {
    const botData = await ctx.telegram.getMe()

    await ctx.reply(botInfo(botData), {
        parse_mode: 'HTML',
        ...mainKeyboard
    })
})

bot.hears('📋 User va Bot ma’lumotlari', async (ctx) => {
    const botData = await ctx.telegram.getMe()

    const message = [
        '📋 <b>USER VA BOT — TO‘LIQ MA’LUMOT</b>',
        '',
        userInfo(ctx.from),
        '',
        '━━━━━━━━━━━━━━━━━━',
        '',
        botInfo(botData)
    ].join('\n')

    await ctx.reply(message, {
        parse_mode: 'HTML',
        ...mainKeyboard
    })
})

bot.help(async (ctx) => {
    await ctx.reply(
        'ℹ️ <b>Yordam</b>\n\n' +
        'Pastdagi tugmalardan birini tanlang.\n' +
        'Bosh menyuni ochish uchun /start buyrug‘ini yuboring.',
        {
            parse_mode: 'HTML',
            ...mainKeyboard
        }
    )
})

bot.catch((error, ctx) => {
    console.error('Bot xatosi:', error.message)
    ctx.reply('❌ Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.')
})




module.exports = bot