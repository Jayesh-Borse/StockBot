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

client.on("ready", () => {
    console.log(`${client.user.tag} is ready !`);
});

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

client.on('message', (message) => {
    console.log(message.author.tag);
    if(message.content === 'Hello'){
        message.reply("Hii There");
    }
    if(!message.author.bot){
        var msg = message.content.split(' ');
        console.log(msg)
        var datetime = new Date();
        var todaysDate = datetime.toISOString().slice(0,10)
        console.log(datetime.toISOString().slice(0,10));
        var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ msg[1] +'&apikey='+process.env.API_KEY
        var overviewUrl = 'https://www.alphavantage.co/query?function=OVERVIEW&symbol='+ msg[1] +'&apikey='+process.env.API_KEY
        var newsUrl = 'https://finnhub.io/api/v1/company-news?symbol='+msg[1]+'&from='+todaysDate+'&to='+todaysDate+'&token='+process.env.FINHUB_API_KEY
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
       
        if(msg.length > 1 &&  msg[0] === '$overview')
        {
            CompanyOverview(overviewUrl,msg[1],message)
            
        }
        if(msg.length > 1 &&  msg[0] === '$news')
        {
            CompanyNews(newsUrl,msg[1],message)
            
        }
         else{
            message.reply("`Provide Valid Company Symbol`");
        }
        

    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

