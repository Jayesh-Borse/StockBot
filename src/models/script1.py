from bs4 import BeautifulSoup
import urllib.request,urllib.parse,urllib.error
import json


url = 'https://www.moneycontrol.com/mc/widget/marketaction/getTopGainerLoserData?show=dashboard&classic=true'

marketDict = {
            "Nifty" : {
                "Gainers" : [],
                "Losers" : []
            },
            "Sensex" : {
                "Gainers" : [],
                "Losers" : []
            }
        }

data = urllib.request.urlopen(url)
soup = BeautifulSoup(data, 'html.parser')
marketData = soup.findAll('div',{'class':'boxes-div'})
niftyData = marketData[0]
niftyGainers = niftyData.find('div',{'class':'top-boxes'}).findAll('div')
for gainer in niftyGainers:
    company = gainer.find('a').contents[0]
    price = gainer.findAll('span')[0].contents[0]
    percentUp = gainer.findAll('span')[1].contents[0]
    dict = {"companyName" : company, "closingPrice" : price, "percentUp" : percentUp}
    marketDict['Nifty']['Gainers'].append(dict)

niftyLosers = niftyData.find('div',{'class':'bottom-boxes'}).findAll('div')
for loser in niftyLosers:
    company = loser.find('a').contents[0]
    price = loser.findAll('span')[0].contents[0]
    percentDown = loser.findAll('span')[1].contents[0]
    dict = {"companyName" : company, "closingPrice" : price, "percentDown" : percentDown}
    marketDict['Nifty']['Losers'].append(dict)

sensexData = marketData[1]
sensexGainers = sensexData.find('div',{'class':'top-boxes'}).findAll('div')
for gainer in sensexGainers:
    company = gainer.find('a').find('span').contents[0]
    price = gainer.findAll('span')[1].contents[0]
    percentUp = gainer.findAll('span')[2].contents[0]
    dict = {"companyName" : company, "closingPrice" : price, "percentUp" : percentUp}
    marketDict['Sensex']['Gainers'].append(dict)

sensexLosers = sensexData.find('div',{'class':'bottom-boxes'}).findAll('div')
for loser in sensexLosers:
    company = loser.find('a').find('span').contents[0]
    price = loser.findAll('span')[1].contents[0]
    percentDown = loser.findAll('span')[2].contents[0]
    dict = {"companyName" : company, "closingPrice" : price, "percentDown" : percentDown}
    marketDict['Sensex']['Losers'].append(dict)

print(json.dumps(marketDict))
# print(marketData)