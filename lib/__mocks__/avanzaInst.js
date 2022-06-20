const Avanza = require('avanza')
const AvanzaInst = jest.genMockFromModule('../avanzaInst')

//const AvanzaInst = require('../avanzaInst')

//console.log(Avanza)
AvanzaInst.getAccountOverview = jest.fn().mockImplementation((arg)=>{
	return new Promise((res, rej)=>{
		if (arg === undefined){
			rej()
		}else {
			res({buyingPower: 1})
		}
	})
})
AvanzaInst.getDealsAndOrders = jest.fn().mockImplementation(()=>{
	return Promise.resolve(
		{orders: [
			{account: {id: 1}, orderbook: {id: '2'}, orderId: 123, type: 'BUY'},
			{account: {id: 1}, orderbook: {id: '2'}, orderId: 456, type: 'SELL'}
		],
		deals: [
			{account: {id: 1}, orderbook: {id: '2'}, orderId: 123, type: 'BUY', volume: 10},
			{account: {id: 1}, orderbook: {id: '2'}, orderId: 456, type: 'SELL', volume: 10}
		]}
	)
})
AvanzaInst.getOrderbook = jest.fn().mockImplementation((instType, instId)=>{
	return new Promise((res, rej)=>{
		if (instType === undefined|| instId === undefined){
			rej()
		}
		res({orderDepthLevels: [
			{buy: {price: 60, volume: 80}, sell: {price: 101, volume: 25000}},
			{buy: {price: 100, volume: 25000}, sell: null}
		]})
	})
})

AvanzaInst.getPositions = jest.fn().mockImplementation(arg=>{
	return new Promise((res, rej)=>{
		if (arg !== undefined) rej()
		res({instrumentPositions: [
			{positions:[
				{accountId: 1, orderbookId: '2', volume: 100},
				{accountId: 1, orderbookId: '222', volume: 200},
				{accountId: 1, orderbookId: '3', volume: 101},
				{accountId: 3, orderbookId: '2', volume: 102},
				{accountId: 4, orderbookId: '5', volume: 103}
			]}
		]})
	})
})

AvanzaInst.placeOrder = jest.fn().mockResolvedValue({
	status: 'SUCCESS',
	orderId: '1234'
})

AvanzaInst.placeWebOrder = jest.fn().mockResolvedValue({
	status: 'SUCCESS',
	orderId: '1234'
})

AvanzaInst.editOrder = jest.fn().mockResolvedValue({
	status: 'SUCCESS',
	orderId: '1234'
})

AvanzaInst.deleteOrder = jest.fn().mockResolvedValue()

AvanzaInst.subscribe = jest.fn().mockImplementation((path, id, cb)=>{
	var data
	if (path === Avanza.ORDERDEPTHS){
		data = {
			'orderbookId': '1234',
			'receivedTime': '2017-10-27T10:18:24.103+0200',
			'totalLevel': {
				'buySide': {'price': 1760399, 'volume': 103270, 'volumePercent': 61},
				'sellSide': {'price': 1111905, 'volume': 64989, 'volumePercent': 38}
			},
			'levels':[
				{
					'buySide':{'price':17.07,'volume':1937,'volumePercent':3},
					'sellSide':{'price':17.09,'volume':5034,'volumePercent':7}
				},{
					'buySide':{'price':17.06,'volume':7351,'volumePercent':11},
					'sellSide':{'price':17.1,'volume':18418,'volumePercent':28}
				}
			],
			'marketMakerLevelAsk':0,
			'marketMakerLevelBid':0
		}
	} else if(path === Avanza.TRADES) {
		data = {
			'orderbookId': '19002',
			'buyer': null,
			'buyerName': null,
			'seller': null,
			'sellerName': null,
			'dealTime': 1509092287408,
			'price': 1660.18,
			'volume': 0,
			'matchedOnMarket': true,
			'cancelled':false
		}
	} else if(path === Avanza.QUOTES) {
		data = {
			'orderbookId':'1234',
			'buyPrice':17.07,
			'sellPrice':17.09,
			'spread':0.06,
			'closingPrice':173.45,
			'highestPrice':175.9,
			'lowestPrice':173.45,
			'lastPrice':175.9,
			'change':2.45,
			'changePercent':1.41,
			'updated':1547025218000,
			'volumeWeightedAveragePrice':174.79,
			'totalVolumeTraded':197391,
			'totalValueTraded':34501306.55,
			'updatedDisplay':'10:13',
			'changePercentNumber':1.41,
			'lastUpdated':1547025218000
		}
	} else if (path === Avanza.DEALS){
		data = {'deals':[
			{
				'id':'90255574',
				'accountId':'123123',
				'orderbook':{
					'id':'755398',
					'name':'TURBO S OMX AVA 249',
					'tickerSymbol':'TURBO S OMX AVA 249',
					'marketPlaceName':'First North Stockholm',
					'countryCode':'SE',
					'instrumentType':'Warrant',
					'tradable':true,
					'volumeFactor':1,
					'currencyCode':'SEK',
					'flagCode':'SE',
					'urlName':'turbo-s-omx-ava-249'
				},
				'orderType':'Köp',
				'price':77.2,
				'volume':15,
				'dealTime':1538985304931,
				'action':'NEW',
				'sum':1158
			}
		]}
	} else if (path === Avanza.ORDERS){
		data = {
			'orders':[
				{
					'id':'88556931',
					'accountId':'1234',
					'orderbook':{
						'id':'118370',
						'name':'Metallvärden i Sverige',
						'instrumentType':'Aktie',
					},
					'currentVolume':5,
					'openVolume':null,
					'price':0.09,
					'validDate':'2018-10-24',
					'type':'Köp',
					'state':{
						'value':'Väntande'
					},
					'action':'NEW',
					'modifiable':true,
					'deletable':true,
					'sum':0.45,
					'visibleDate':null,
					'orderDateTime':1540392212242
				}
			]
		}
	}
	if (path === Avanza.ORDERDEPTHS && id === 'MM no ask'){
		data['marketMakerLevelAsk'] = null
	} else if (path === Avanza.ORDERDEPTHS && id === 'MM no bid'){
		data['marketMakerLevelBid'] = null
	} else if (path === Avanza.ORDERDEPTHS && id === 'no MM'){
		data['marketMakerLevelAsk'] = null
		data['marketMakerLevelBid'] = null
	} else if (path === Avanza.ORDERDEPTHS && id === 'MM deep'){
		data['marketMakerLevelAsk'] = 1
		data['marketMakerLevelBid'] = 1
	} else if (path === Avanza.QUOTES && id === 'Stock no bid'){
		data['buyPrice'] = null
	} else if (path === Avanza.QUOTES && id === 'Stock no ask'){
		data['sellPrice'] = null
	}

	setTimeout(()=>{
		for (var i = 0; i < 10; i++){
			cb(data)
		}
	}, 0)
})
AvanzaInst.authenticate = jest.fn().mockResolvedValue()
AvanzaInst.disconnect = jest.fn()
module.exports = AvanzaInst
