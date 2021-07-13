const axios = require('axios')
const Discord = require('discord.js');
const { json } = require('express');
const StockChart = require('./stockCharts.js')
const PythonShell = require('python-shell').PythonShell;
var options = {
    mode: 'json',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: './src/models/',
  }

const stockchart = new StockChart();

class StockMarket {
    helpMenu = helpMenu
    stockCommands=stockCommands
    marketEODOverview=marketEODOverview
}

function stockCommands(message, msg){
    console.log(msg)
    var datetime = new Date();
    var todaysDate = datetime.toISOString().slice(0,10)

    var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ msg[1] +'&apikey='+process.env.API_KEY
    var overviewUrl = 'https://www.alphavantage.co/query?function=OVERVIEW&symbol='+ msg[1] +'&apikey='+process.env.API_KEY
    var newsUrl = 'https://finnhub.io/api/v1/company-news?symbol='+msg[1]+'&from='+todaysDate+'&to='+todaysDate+'&token='+process.env.FINHUB_API_KEY

    console.log(datetime.toISOString().slice(0,10));
    
    if(msg.length > 1 &&  msg[0] === '$price'){
        companyEODOverview(url, message, msg)
    }
    else if(msg.length > 1 &&  msg[0] === '$companyOverview'){
        CompanyOverview(overviewUrl,msg[1],message)
    }
    else if(msg.length > 1 &&  msg[0] === '$news'){
        CompanyNews(newsUrl,msg[1],message)
    }
    else if(msg[0] === '$marketOverview'){
        marketEODOverview(message)
    }
    else if(msg.length > 2 && msg[0] === '$chart'){
        stockchart.chartHandler(message, msg)
    }
}

function helpMenu (message) {
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

function marketEODOverview(message){
    PythonShell.run('script1.py', options, function (err, result) {
        if (err) throw err;
        else{
            console.log(result[0]['Nifty']);
            const botMessage = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(` Today's Market Overview`)
                .setTimestamp()
                .setDescription('`Nifty Gainers-Losers`')
                for(let i=0; i<3; i++){
                    botMessage.addFields(
                            {name: result[0]['Nifty']['Gainers'][i]["companyName"],value: "Closing Price - "+result[0]['Nifty']['Gainers'][i]["closingPrice"] + "\nUp " + result[0]['Nifty']['Gainers'][i]["percentUp"], inline:true},
                            { name: '\u200B', value: '\u200B', inline: true},
                            {name: result[0]['Nifty']['Losers'][i]["companyName"],value: "Closing Price - "+result[0]['Nifty']['Losers'][i]["closingPrice"] + "\nDown " + result[0]['Nifty']['Losers'][i]["percentDown"], inline:true},
                        )
                };
                message.reply(botMessage);

                const botMessage1 = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTimestamp()
                .setDescription('`Sensex Gainers-Losers`')
                for(let i=0; i<3; i++){
                    botMessage1.addFields(
                            {name: result[0]['Sensex']['Gainers'][i]["companyName"],value: "Closing Price - "+result[0]['Sensex']['Gainers'][i]["closingPrice"] + "\nUp " + result[0]['Sensex']['Gainers'][i]["percentUp"], inline:true},
                            { name: '\u200B', value: '\u200B', inline: true},
                            {name: result[0]['Sensex']['Losers'][i]["companyName"],value: "Closing Price - "+result[0]['Sensex']['Losers'][i]["closingPrice"] + "\nDown " + result[0]['Sensex']['Losers'][i]["percentDown"], inline:true},
                        )
                };
                message.reply(botMessage1);
                
        }
    });
}


function companyEODOverview(url, message, msg){
    axios({
        method : 'get',
        url: url,
        responseType: json,
      })
       .then((res) => {
          //var date = res.data['Meta Data']['3. Last Refreshed'];
          var company = msg[1];
          const botMessage = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(company)
            //.setDescription('Last Refreshed : ' + date)
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

module.exports = StockMarket