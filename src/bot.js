require('dotenv').config()
const axios = require('axios');

var express = require('express');
var app     = express();

app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
// app.get('/', function(request, response) {
//     var result = 'App is running'
//     response.send(result);
// }).listen(app.get('port'), function() {
//     console.log('App is running, server is listening on port ', app.get('port'));
// });

const Discord = require('discord.js');
const client = new Discord.Client();
const { json } = require('express');

const StockMarket = require('./models/stock.js')
const stockMarket = new StockMarket()

const CryptoMarket = require('./models/crypto.js')
const cryptoMarket = new CryptoMarket()


client.on("ready", () => {
    console.log(`${client.user.tag} is ready !`);
});

client.on('message', (message) => {
    console.log(message.author.tag);
    var greet = ["Hello","hello","Hii","Hi","hi","hii","Hey","hey","Hi there","Hello there","hello there","heyy","Heyy","helloooooo","hellooo", "hey there","stock bot", "StockBot", "stockbot", "Stock Bot", "🤖"]
    const userMsg = message.content;
    
    if(greet.includes(userMsg) === true){
        console.log(message.content);
        stockMarket.helpMenu(message);
    }
    if(!message.author.bot){
        var msg = message.content.split(' ');
        if(msg[0]==='$help')
        {
            const helpMessage = new Discord.MessageEmbed()
            .setColor('#00FF00')
            .setTitle('Stock Market Commands')
            .setThumbnail('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWtRb8O3CD3WRfd6MaEEZASSOlj1FKHcUGFsfV9HXU459LT1n8tDPeAj9Wj_SLyBK7pm4&usqp=CAU')
            .addFields(
                { name: '\n\nPrice', value: '`eg.$price AAPL`' , inline: true},
                { name: '\u200B', value: '\u200B', inline: true },
                { name: '\n\nOverview', value: '`eg.$overview AAPL`', inline: true},
                { name: '\n\nChart (Month-M, Day-D)', value: '`eg.$chart AAPL D`', inline: true},
                { name: '\u200B', value: '\u200B', inline: true },
                { name: '\n\nCompare 2 stocks', value: '`eg.$chart compare AAPL TSLA`',inline:true},
                { name: '\n\nLatest news', value: '`eg.$news AAPL`',inline:true},
                { name: '\u200B', value: '\u200B', inline: true },
                { name: '\n\nEnd of the day overview', value: '`eg.$marketOverview`',inline:true},
            )
            .setTimestamp()
            message.reply(helpMessage);
        }
        else if(msg[0]==='!help')
        {
            const helpMessage = new Discord.MessageEmbed()
            .setColor('#00FF00')
            .setTitle('Crypto Commands')
            .setThumbnail('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWtRb8O3CD3WRfd6MaEEZASSOlj1FKHcUGFsfV9HXU459LT1n8tDPeAj9Wj_SLyBK7pm4&usqp=CAU')
            .addFields(
                { name: '\n\nPrice', value: '`eg.!price BTC`' },
                { name: '\n\nExchangeRate', value: '`eg.!exchangeRate BTC ETH`'},
                { name: '\n\nChart (Month-M, Day-D)', value: '`eg.!chart BTC M`'},
            )
            .setTimestamp()
            message.reply(helpMessage);
        }
        else if(msg[0].charAt(0)==='!'){
            cryptoMarket.CryptoCommands(message);
        }
        else if(msg[0].charAt(0)==='$'){
            stockMarket.stockCommands(message, msg);
        }
        // else if(){
        //     message.reply("`Invalid Command`");
        // }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
