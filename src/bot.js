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

// const { Client }  = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client();
const { json } = require('express');
const cheerio = require('cheerio');

function companyEODOverview(url){
    axios({
        method : 'get',
        url: url,
        responseType: json,
        //headers: {'User-Agent': 'request'}
      })
       .then((res) => {
          var date = res.data['Meta Data']['3. Last Refreshed'];
          var company = msg[1];
          const botMessage = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(company)
            .setDescription('Last Refreshed : ' + date)
            .addFields(
                { name: 'Open', value: res.data['Time Series (Daily)'][date]['1. open'], inline: true},
                { name: 'Close', value: res.data['Time Series (Daily)'][date]['4. close'], inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: 'High', value: res.data['Time Series (Daily)'][date]['2. high'], inline: true },
                { name: 'Low', value: res.data['Time Series (Daily)'][date]['3. low'], inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: 'Volume', value: res.data['Time Series (Daily)'][date]['5. volume']},
            )
            .setTimestamp()
          message.reply(botMessage);
    });
}

function helpMenu(message){
    const helpMessage = new Discord.MessageEmbed()
        .setColor('#00FF00')
        .setTitle('Hii There👋')
        //.setURL('https://discord.js.org/')
        //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
        .setDescription('\n\n\nI am StockBot 🤖. \n Get To Know Every Activity in Stock Market Around The Globe with Easy Commands.')
        .setThumbnail('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWtRb8O3CD3WRfd6MaEEZASSOlj1FKHcUGFsfV9HXU459LT1n8tDPeAj9Wj_SLyBK7pm4&usqp=CAU')
        .addFields(
            { name: '\n\n$price companySymbol \neg., $price AAPL', value: 'Current Price Info about Company Stock\n\n' },
            { name: '\n\n$overview companySymbol \neg., $overview AAPL', value: 'Company Overview\n\n'},
            { name: '\n\n!exchangeRate fromCryptoSymbol toCryptoSymbol\neg., !exchangeRate BTC ETH', value: 'Know the Exchange Rates from one Cryptocurrency to another\n\n'},
        )
        //.addField('Inline field title', 'Some value here', true)
        //.setImage('https://i.imgur.com/wSTFkRM.png')
        .setTimestamp()
        //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');

    message.reply(helpMessage);
}

function marketEODOverview(){
    var url = 'https://www.moneycontrol.com/mc/widget/marketaction/getTopGainerLoserData?show=dashboard&classic=true'
    //const $ = cheerio.load(data);
    axios({
        method : 'get',
        url: url,
        responseType: json,
        //headers: {'User-Agent': 'request'}
      })
       .then((res) =>{
           //console.log(res['data'])
           const $ = cheerio.load(res['data'])
           console.log($['_root']['children'][1]['children'][1]['children'][0]['children'][0]['parent']['children'][1])
       })
}

client.on("ready", () => {
    console.log(`${client.user.tag} is ready !`);
});

client.on('message', (message) => {
    console.log(message.author.tag);
    //marketEODOverview();
    var greet = ["Hello","hello","Hii","Hi","hi","hii","Hey","hey","Hi there","Hello there","hello there","heyy","Heyy","helloooooo","hellooo", "hey there","stock bot", "StockBot", "stockbot", "Stock Bot", "🤖"]
    const userMsg = message.content;
    if(greet.includes(userMsg) === true){
        console.log(message.content);
        helpMenu(message);
    }
    else if(!message.author.bot){
        var msg = message.content.split(' ');
        console.log(msg)

        if(msg.length > 1 &&  msg[0] === '$price'){
            var url;
            if(msg[1].substr(0,4) === 'BSE:')
                url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ "BSE:"+msg[1].substr(4,msg[1].length - 4) +'&apikey='+process.env.API_KEY
            else
                url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ msg[1] +'&apikey='+process.env.API_KEY
            companyEODOverview(url);
        }else{
            message.reply("`Provide Valid Company Symbol`");
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

