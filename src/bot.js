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

client.on('message', (message) => {
    console.log(message.author.tag);
    if(message.content === 'Hello'){
        message.reply("Hii There");
    }
    if(!message.author.bot){
        var msg = message.content.split(' ');
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
        }else{
            message.reply("`Provide Valid Company Symbol`");
        }
        

    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

