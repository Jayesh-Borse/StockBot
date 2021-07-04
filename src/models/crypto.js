const axios = require('axios')
const Discord = require('discord.js');
const { json } = require('express');

class CryptoMarket{
    CryptoCommands=CryptoCommands
}

function CryptoCommands(message){
    var msg=message.content.split(' ');
    if(msg.length == 3 && msg[0] === '!exchangeRate'){
        ExchangeRate(msg[1],msg[2],message);
    }
    else if(msg.length == 2 && msg[0] === '!healthIndex'){
        HealthIndex(msg[1],message);
    }
    else if(msg.length == 2 && msg[0] === '!price'){
        DailyPrice(msg[1],message);
    }
    else{
        message.reply("`Provide Valid Company Symbol`");
    }
}

function ExchangeRate(crypto1,crypto2,message){
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

function HealthIndex(index,message){
    console.log('exchange');
}

function DailyPrice(currency,message){
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
                { name: '\u200B', value: '\u200B', inline: true },
            )
            .setTimestamp()
          message.reply(botMessage);
    });
}

module.exports = CryptoMarket