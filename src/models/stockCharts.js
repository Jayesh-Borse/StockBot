const axios = require('axios');
const { data } = require('cheerio/lib/api/attributes');
const Discord = require('discord.js');
const { json } = require('express');
const QuickChart = require('quickchart-js');

class StockCharts {
    chartHandler = chartHandler
}

function chartHandler(message, msg){
    if(msg[2] === "M"){
        companyMonthlyChart(message, msg[1]);
    }
    else if(msg[2] === "D"){
        companyIntradayChart(message, msg[1]);
    }
    else if(msg[2] === "Y"){

    }
    else if(msg[2] === "H"){

    }
}

async function getMonthlyData(companySymbol) {
    url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+companySymbol+"&apikey="+ process.env.API_KEY;
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
            //console.log(res['data']['Time Series (Daily)']);
            var dailyData = res['data']['Time Series (Daily)']
            //console.log(dailyData)
            var i = 30;
            for (let key of Object.keys(dailyData)) {
                var month = key.split('-')[1];
                var day = key.split('-')[2];
                dataDict["labels"].push(month+"/"+day)
                i--;
                if(i == 0)
                    break;

            }
            //console.log(dataDict)
            i = 30;
            for (let value of Object.values(dailyData)) {
                //console.log(value['4. close']); 
                dataDict["dataset"].push(parseFloat(value['4. close']))
                i--;
                if(i == 0)
                    break;
            }
    });
    dataDict["labels"].reverse();
    dataDict["dataset"].reverse();
    return dataDict;
}

async function companyMonthlyChart(message, companySymbol){

    var dict = await getMonthlyData(companySymbol);
    console.log(dict);
    const myChart = new QuickChart();
    myChart
    .setConfig({
        type: 'line',
        data: { 
            labels: dict["labels"], 
            datasets: [
                { 
                    data: dict["dataset"],
                    borderColor: "#c45850",
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
                      labelString: 'Stock Price in Dollars($)',
                    //   fontColor: '#ff0000',
                       fontSize: 20,
                    //   fontStyle: 'bold',
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
        .setColor('#00FF00')
        .setTitle(companySymbol + " (Stock Price - Last 30 days)")
        .setImage(myChart.getUrl())
        .setTimestamp()
    message.reply(chartMessage);
    console.log(myChart.getUrl());
}

async function getIntradayData(companySymbol){
    url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+companySymbol+"&interval=15min&apikey="+ process.env.API_KEY;
    var dataDict = {
        "metadata" : [],
        "labels" : [],
        "dataset" : []
    }
    await axios({
        method : 'get',
        url: url,
        responseType: json,
      })
       .then((res) => {
            //console.log(res['data']['Time Series (Daily)']);
            var dailyData = res['data']['Time Series (15min)']
            var date = res['data']['Meta Data']['3. Last Refreshed'].split(' ')[0]
            dataDict["metadata"].push(date)
            // console.log(dailyData)
            // console.log(res)
            i = 0;
            for (let key of Object.keys(dailyData)) {
                var time = key.split(' ')[1].split(':')[0] + ":" + key.split(' ')[1].split(':')[1];
                //console.log(time)
                if(i%2 == 0)
                    dataDict["labels"].push(time)
                i++;
            }
            //console.log(dataDict)
            i = 0;
            for (let value of Object.values(dailyData)) {
                //console.log(value['4. close']); 
                if(i%2 == 0)
                    dataDict["dataset"].push(parseFloat(value['4. close']))
                i++;
                // if(i == 0)
                //     break;
            }
    });
    dataDict["labels"].reverse();
    dataDict["dataset"].reverse();
    return dataDict;
}

async function companyIntradayChart(message, companySymbol){
    var dict = await getIntradayData(companySymbol);
    console.log(dict);
    const myChart = new QuickChart();
    myChart
    .setConfig({
        type: 'line',
        data: { 
            labels: dict["labels"], 
            datasets: [
                { 
                    data: dict["dataset"],
                    borderColor: "#c45850",
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
                      labelString: 'Time (Hrs:Mins)',
                      fontSize: 20,
                    }
                  }
                ],
                yAxes: [
                  {
                    scaleLabel: {
                      display: true,
                      labelString: 'Stock Price in Dollars($)',
                    //   fontColor: '#ff0000',
                       fontSize: 20,
                    //   fontStyle: 'bold',
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
        .setColor('#00FF00')
        .setTitle(companySymbol + " (Stock Price - " + dict["metadata"][0] + ")")
        .setImage(myChart.getUrl())
        .setTimestamp()
    message.reply(chartMessage);
    console.log(myChart.getUrl());
}

module.exports = StockCharts