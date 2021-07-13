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
    else if(msg[1] == "compare")
    {
        comparecompany(message,msg[2],msg[3]);
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
            var dailyData = res['data']['Time Series (Daily)']
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

async function comparecompany(message,firstCompanySym,secondCompanySym){
    var dict1 = await getMonthlyData(firstCompanySym)
    var dict2 = await getMonthlyData(secondCompanySym)


    const myChart = new QuickChart();
    myChart.setConfig({
        type: 'line',
        data: { 
            labels: dict1["labels"], 
            datasets: [
                { 
                    data: dict1["dataset"],
                    borderColor: 'green',
                    label : firstCompanySym,
                    fill: false
                },
                {
                    data: dict2["dataset"],
                    borderColor: "blue",
                    label : secondCompanySym,
                    fill: false
                }
            ]},
        responsive: true,
        options: {
            scales: {
                xAxes: [
                  {
                    gridLines: {
                        display: true
                      },
                    scaleLabel: {
                      display: true,
                      labelString: 'Date (MM/DD) ' + new Date().toISOString().slice(0,4),
                      fontSize: 20,
                    }
                  }
                ],
                yAxes: [
                  {
                    gridLines: {
                        display: true
                      },
                    scaleLabel: {
                      display: true,
                      labelString: 'Stock Price in Dollars($)',
                      fontSize: 20,
                    
                    }
                  }
                ]
              },
            title: {
                display: true,
                text: "Company comparision"
            }
        }
    }).setWidth(1200)
    .setHeight(600)

    const chartMessage = new Discord.MessageEmbed()
        .setColor('#0099FF')
        .setTitle("Comparison between "+ firstCompanySym + " and " + secondCompanySym)
        .setImage(myChart.getUrl())
        .setTimestamp()
    message.reply(chartMessage);
    console.log(myChart.getUrl());
}


async function companyMonthlyChart(message, companySymbol){

    var dict = await getMonthlyData(companySymbol);
    console.log(dict);
    var color;
    if(dict["dataset"][0] < dict["dataset"][dict["dataset"].length-1])
        color = '#43FF33'
    else
        color = '#c45850'
    const myChart = new QuickChart();
    myChart
    .setConfig({
        type: 'line',
        data: { 
            labels: dict["labels"], 
            datasets: [
                { 
                    data: dict["dataset"],
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
        .setColor('#0099ff')
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
            
            var dailyData = res['data']['Time Series (15min)']
            var date = res['data']['Meta Data']['3. Last Refreshed'].split(' ')[0]
            dataDict["metadata"].push(date)
           
            let i = 0;
            for (let key of Object.keys(dailyData)) {
                var time = key.split(' ')[1].split(':')[0] + ":" + key.split(' ')[1].split(':')[1];
                
                if(i%2 == 0)
                    dataDict["labels"].push(time)
                i++;
            }
            
            i = 0;
            for (let value of Object.values(dailyData)) {
                
                if(i%2 == 0)
                    dataDict["dataset"].push(parseFloat(value['4. close']))
                i++;
               
            }
    });
    dataDict["labels"].reverse();
    dataDict["dataset"].reverse();
    return dataDict;
}

async function companyIntradayChart(message, companySymbol){
    var dict = await getIntradayData(companySymbol);
    console.log(dict);
    var color;
    if(dict["dataset"][0] < dict["dataset"][dict["dataset"].length-1])
        color = '#43FF33'
    else
        color = '#c45850'
    const myChart = new QuickChart();
    myChart
    .setConfig({
        type: 'line',
        data: { 
            labels: dict["labels"], 
            datasets: [
                { 
                    data: dict["dataset"],
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
        .setColor('#0099ff')
        .setTitle(companySymbol + " (Stock Price - " + dict["metadata"][0] + ")")
        .setImage(myChart.getUrl())
        .setTimestamp()
    message.reply(chartMessage);
    console.log(myChart.getUrl());
}

module.exports = StockCharts