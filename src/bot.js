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
// const client = new Client() ; //client is bot

function CryptoCommands(message)
{
    var msg=message.content.split(' ');
    if(msg.length == 3 && msg[0] === '!exchangeRate')
    {
        ExchangeRate(msg[1],msg[2],message);
    }
    else if(msg.length == 2 && msg[0] === '!healthIndex')
    {
        HealthIndex(msg[1],message);
    }
    else if(msg.length == 2 && msg[0] === '!price')
    {
        DailyPrice(msg[1],message);
    }
    else
    {
        message.reply("`Provide Valid Company Symbol`");
    }
}

function ExchangeRate(crypto1,crypto2,message)
{
    var url ='https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency='+ crypto1 +'&to_currency='+ crypto2 +'&apikey='+process.env.API_KEY
    axios({
        method : 'get',
        url: url,
        responseType: json,
      })
       .then((res) => {
          var date = res.data['Realtime Currency Exchange Rate']['6. Last Refreshed'];
          const botMessage = new Discord.MessageEmbed()
            .setColor('#f5e31b')
            .setTitle('Realtime Currency Exchange Rate')
            .setDescription('Last Refreshed : ' + date)
            .addFields(
                { name: 'From', value: res.data['Realtime Currency Exchange Rate']['2. From_Currency Name'], inline: true},
                { name: 'To', value: res.data['Realtime Currency Exchange Rate']['4. To_Currency Name'], inline: true },
                { name: '\u200B', value: '\u200B', inline:true},
                { name: 'Exchange Rate', value: res.data['Realtime Currency Exchange Rate']['5. Exchange Rate'], inline: true }, 
            )
            .setTimestamp()
          message.reply(botMessage);
    });
}
function HealthIndex(index,message)
{
    console.log('exchange');
}

function DailyPrice(currency,message)
{
    var url ='https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol='+ currency +'&market=CNY&apikey='+process.env.API_KEY
    axios({
        method : 'get',
        url: url,
        responseType: json,
      })
       .then((res) => {
          var date = res.data['Meta Data']['6. Last Refreshed'];
          date1=date.split(' ');
          const botMessage = new Discord.MessageEmbed()
            .setColor('#f5e31b')
            .setTitle(currency)
            .setDescription('Last Refreshed : ' + date1[0])
            .addFields(
                { name: 'Open', value: res.data['Time Series (Digital Currency Daily)'][date1[0]]['1b. open (USD)'], inline: true},
                { name: 'Close', value: res.data['Time Series (Digital Currency Daily)'][date1[0]]['4b. close (USD)'], inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: 'High', value: res.data['Time Series (Digital Currency Daily)'][date1[0]]['2b. high (USD)'], inline: true },
                { name: 'Low', value: res.data['Time Series (Digital Currency Daily)'][date1[0]]['3b. low (USD)'], inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: 'Volume', value: res.data['Time Series (Digital Currency Daily)'][date1[0]]['5. volume'], inline: true},
                { name: 'Market Cap', value: res.data['Time Series (Digital Currency Daily)'][date1[0]]['6. market cap (USD)'], inline: true },
            )
            .setTimestamp()
          message.reply(botMessage);
    });
}

client.on("ready", () => {
    console.log(`${client.user.tag} is ready !`);
});

client.on('message', (message) => {
    console.log(message.author.tag);
    if(message.content === 'Hello'){
        message.reply("Hii There");
    }
    if(!message.author.bot){
        var msg = message.content.split(' ');
        if(msg[0].charAt(0)==='!')
        {
            CryptoCommands(message);
        }
        else if(msg[0].charAt(0)==='$')
        {
            console.log(msg)
            var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ msg[1] +'&apikey='+process.env.API_KEY
            if(msg.length > 1 &&  msg[0] === '$price'){
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
        }
        else{
            message.reply("`Provide Valid Company Symbol.`");
        }
        
        

    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

