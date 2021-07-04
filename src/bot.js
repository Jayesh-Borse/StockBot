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

function companyEODOverview(url, message, msg){
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
        .setDescription('\n\n\nI am StockBot 🤖. \n Get To Know Every Activity in Stock Market Around The Globe with Easy Commands.')
        .setThumbnail('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWtRb8O3CD3WRfd6MaEEZASSOlj1FKHcUGFsfV9HXU459LT1n8tDPeAj9Wj_SLyBK7pm4&usqp=CAU')
        .addFields(
            { name: '\n\n$price companySymbol \neg., $price AAPL', value: 'Current Price Info about Company Stock\n\n' },
            { name: '\n\n$overview companySymbol \neg., $overview AAPL', value: 'Company Overview\n\n'},
            { name: '\n\n!exchangeRate fromCryptoSymbol toCryptoSymbol\neg., !exchangeRate BTC ETH', value: 'Know the Exchange Rates from one Cryptocurrency to another\n\n'},
        )
        .setTimestamp()
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

function CompanyNews(newsUrl,symb,message){
    return axios({
        method : 'get',
        url: newsUrl,
        responseType: json,
      })
       .then((res) => {
          var company = symb;
          const botMessage = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(` Today's ${company} News`)
            .setTimestamp()
            res.data.forEach((entry) => {
                botMessage.addFields(
                    {name: entry['headline'],value: entry['summary'] != "" ?entry['summary']+'\n'+entry['url']:entry['url']},
                    ).setImage(entry['image']);
                        // .addField('Summary',entry['summary'])
                console.log(entry['summary'])
              });
            message.reply(botMessage);
    });
}

function CompanyOverview(overviewUrl,symb,message){
    return axios({
        method : 'get',
        url: overviewUrl,
        responseType: json,
      })
       .then((res) => {
          var company = symb;
          const botMessage = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(company + ' Overview')
            .addFields(
                { name: 'Asset Type', value: res.data['AssetType'], inline: true},
                { name: '\u200B', value: '\u200B',inline:true},
                { name: 'Name', value: res.data['Name'], inline: true},
                { name: 'Currency', value: res.data['Currency'], inline: true},
                { name: 'PE Ratio', value: res.data['PERatio'], inline: true},
                { name: 'PEG Ratio', value: res.data['PEGRatio'], inline: true},
                { name: '52 Week High', value: res.data['52WeekHigh'], inline: true},
                { name: '52 Week Low', value: res.data['52WeekLow'], inline: true},
                { name: 'Dividend Yeild', value: res.data['DividendYield'], inline: true},
            )
            .setTimestamp()
            message.reply(botMessage);
    });
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
    var greet = ["Hello","hello","Hii","Hi","hi","hii","Hey","hey","Hi there","Hello there","hello there","heyy","Heyy","helloooooo","hellooo", "hey there","stock bot", "StockBot", "stockbot", "Stock Bot", "🤖"]
    const userMsg = message.content;
    if(greet.includes(userMsg) === true){
        console.log(message.content);
        helpMenu(message);
    }
    if(!message.author.bot){
        var msg = message.content.split(' ');
        if(msg[0].charAt(0)==='!'){
            CryptoCommands(message);
        }
        else if(msg[0].charAt(0)==='$')
        {
            console.log(msg)
            var datetime = new Date();
            var todaysDate = datetime.toISOString().slice(0,10)
            console.log(datetime.toISOString().slice(0,10));
            var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ msg[1] +'&apikey='+process.env.API_KEY
            var overviewUrl = 'https://www.alphavantage.co/query?function=OVERVIEW&symbol='+ msg[1] +'&apikey='+process.env.API_KEY
            var newsUrl = 'https://finnhub.io/api/v1/company-news?symbol='+msg[1]+'&from='+todaysDate+'&to='+todaysDate+'&token='+process.env.FINHUB_API_KEY
            
            if(msg.length > 1 &&  msg[0] === '$price'){
                companyEODOverview(url, message, msg)
            }
            else if(msg.length > 1 &&  msg[0] === '$overview'){
                CompanyOverview(overviewUrl,msg[1],message)
            }
            else if(msg.length > 1 &&  msg[0] === '$news'){
                CompanyNews(newsUrl,msg[1],message)
            }
        }
        // else{
        //     message.reply("`Invalid Command`");
        // }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
