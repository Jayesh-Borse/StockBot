const axios = require('axios');
const Discord = require('discord.js');
const { json } = require('express');
const QuickChart = require('quickchart-js');

class CryptoCharts {
    chartHandler = chartHandler
}

function chartHandler(message, msg){
    if(msg[2] === "M"){
        cryptoMonthlyChart(message, msg[1]);
    }
    else if(msg[2] === "D"){
        cryptoDailyChart(message,msg[1]);
    }
    else if(msg[2] === "Y"){

    }
    else if(msg[2] === "H"){

    }
}

async function getMonthlyData(companySymbol) {
    url = "https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol="+companySymbol+"&market=CNY&apikey="+ process.env.API_KEY;
    var dataDict = {
        "labels" : [],
        "dataset" : []
    }
    await axios({
        method : 'get',
        url: url,
        responseType: json,
      })
       .then((res) => {
            console.log(res);
            var dailyData = res['data']['Time Series (Digital Currency Daily)']
            var i = 30;
            for (let key of Object.keys(dailyData)) {
                var month = key.split('-')[1];
                var day = key.split('-')[2];
                dataDict["labels"].push(month+"/"+day)
                i--;
                if(i == 0)
                    break;

            }
            i = 30;
            for (let value of Object.values(dailyData)) { 
                dataDict["dataset"].push(parseFloat(value['4b. close (USD)']))
                i--;
                if(i == 0)
                    break;
            }
    });
    return dataDict;
}

async function cryptoMonthlyChart(message, companySymbol){

    var dict = await getMonthlyData(companySymbol);
    console.log(dict);
    if(dict["dataset"][0] < dict["dataset"][dict["dataset"].length-1])
        color = '#43FF33'
    else
        color = '#c45850'
    const myChart = new QuickChart();
    myChart
    .setConfig({
        type: 'line',
        data: { 
            labels: dict["labels"].reverse(), 
            datasets: [
                { 
                    data: dict["dataset"].reverse(),
                    borderColor: color,
                    label : 'closing price',
                    fill: false
                }
            ]},
        responsive: true,
        options: {
            scales: {
                xAxes: [
                  {
                    scaleLabel: {
                      display: true,
                      labelString: 'Date (MM/DD) ' + new Date().toISOString().slice(0,4),
                      fontSize: 20,
                    }
                  }
                ],
                yAxes: [
                  {
                    scaleLabel: {
                      display: true,
                      labelString: 'Crypto Price in Dollars($)',
                       fontSize: 20,
                    }
                  }
                ]
              },
            title: {
                display: true,
                text: companySymbol
            }
        }
    })
    .setWidth(1200)
    .setHeight(600)

    const chartMessage = new Discord.MessageEmbed()
        .setColor('#f5e31b')
        .setTitle(companySymbol + " (Crypto Price - Last 30 days)")
        .setImage(myChart.getUrl())
        .setTimestamp()
    message.reply(chartMessage);
}

async function getDailyData(companySymbol) {
    url = "https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol="+companySymbol+"&market=USD&interval=5min&apikey="+ process.env.API_KEY;
    var dataDict = {
        "labels" : [],
        "dataset" : []
    }
    await axios({
        method : 'get',
        url: url,
        responseType: json,
      })
       .then((res) => {
            //console.log(res);
            var dailyData = res['data']['Time Series Crypto (5min)']
            var i = 1;
            for (let key of Object.keys(dailyData)) {
                var time = key.split(' ')[1];
                var hr = time.split(':')[0];
                var min = time.split(':')[1];
                
                if(i%2 != 0)
                    dataDict["labels"].push(hr+":"+min);
                i++;

            }
            i = 1;
            for (let value of Object.values(dailyData)) { 
                if(i%2 != 0)
                    dataDict["dataset"].push(parseFloat(value['4. close']))
                i++;
            }
    });
    return dataDict;
}

async function cryptoDailyChart(message,companySymbol)
{
    var dict = await getDailyData(companySymbol);
    console.log(dict);
    if(dict["dataset"][0] < dict["dataset"][dict["dataset"].length-1])
        color = '#43FF33'
    else
        color = '#c45850'
    const myChart = new QuickChart();
    myChart
    .setConfig({
        type: 'line',
        data: { 
            labels: dict["labels"].reverse(), 
            datasets: [
                { 
                    data: dict["dataset"].reverse(),
                    borderColor: color,
                    label : 'closing price',
                    fill: false
                }
            ]},
        responsive: true,
        options: {
            scales: {
                xAxes: [
                  {
                    scaleLabel: {
                      display: true,
                      labelString: 'Time (Hrs:Mins) ',
                      fontSize: 20,
                    }
                  }
                ],
                yAxes: [
                  {
                    scaleLabel: {
                      display: true,
                      labelString: 'Crypto Price in Dollars($)',
                       fontSize: 20,
                    }
                  }
                ]
              },
            title: {
                display: true,
                text: companySymbol
            }
        }
    })
    .setWidth(1200)
    .setHeight(600)

    const chartMessage = new Discord.MessageEmbed()
        .setColor('#f5e31b')
        .setTitle(companySymbol + " (Crypto Price - INTRADAY)")
        .setImage(myChart.getUrl())
        .setTimestamp()
    message.reply(chartMessage);
}
module.exports = CryptoCharts