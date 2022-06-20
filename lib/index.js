// Wrapper for avanza API
// The purpose of a wrapper is to standardize specific broker APIs
// to facilitate swapping brokers.

process.env.TZ = 'Europe/Stockholm'

const utils = require('js_trader_utils')
const AvanzaInst = require('./avanzaInst')
const Avanza = require('avanza') // import paths.
class Wrapper{
	constructor(){
		this.avanza = AvanzaInst
		this.active = false // false if this object to be destroied
	}
	authenticate(credentials){
		return new Promise((resolve, reject)=>{
			if (this.active) {
				reject('already logged in')
			} else {
				this.avanza.authenticate(credentials).then(() => {
					this.active = true
					resolve()
				}).catch((msg) => {
					reject(msg)
				})
			}
		})
	}
	disconnect(){
		this.avanza.disconnect()
		this.active = false
	}
	getBalance(p){
		return new Promise((resolve, reject) => {
			if (!this.active || p.accountId === undefined){
				reject('Disconnected or wrong params.')
			} else {
				this.avanza.getAccountOverview(p.accountId).then((data) => {
					if (!this.active){
						reject('got data while disconnected')
					} else {
						resolve({balance: data.buyingPower})
					}
				}).catch((msg) => {
					reject(msg)
				})
			}
		})
	}
	getOrders(p){
		return new Promise((resolve, reject) => {
			if (!this.active || p.accountId === undefined || p.instruments[0].instrumentId === undefined) {
				reject('Disconnected or wrong params.')
			} else{
				this.avanza.getDealsAndOrders().then((data) => {
					if (!this.active) {
						reject('got data while disconnected')
					} else {
						var d = data.orders
						var orders = []
						d.forEach(function(ord){
							if (ord.account.id === p.accountId && utils.instrumentsHasId(p.instruments,ord.orderbook.id)){
								orders.push({instrumentId: ord.orderbook.id, orderId: ord.orderId, type: ord.type})
							}
						})
						resolve({orders: orders})
					}
				}).catch((msg) => {reject(msg)})
			}
		})
	}
	getSellOrders(p){
		return new Promise((resolve, reject) => {
			if (!this.active || p.accountId === undefined || p.instruments[0].instrumentId === undefined) {
				reject('Disconnected or wrong params.')
			} else{
				this.avanza.getDealsAndOrders().then((data) => {
					if (!this.active) {
						reject('got data while disconnected')
					} else {
						var d = data.orders
						var orders = []
						d.forEach(function(ord){
							if (ord.account.id === p.accountId &&
								utils.instrumentsHasId(p.instruments, ord.orderbook.id) &&
								ord.type === 'SELL'){
								orders.push({instrumentId: ord.orderbook.id, orderId: ord.orderId, type: ord.type})
							}
						})
						resolve({orders: orders})
					}
				}).catch((msg) => {reject(msg)})
			}
		})
	}
	getBuyOrders(p){
		return new Promise((resolve, reject) => {
			if (!this.active || p.accountId === undefined || p.instruments[0].instrumentId === undefined) {
				reject('Disconnected or wrong params.')
			} else {
				this.avanza.getDealsAndOrders().then((data) => {
					if (!this.active) {
						reject('got data while disconnected')
					} else {
						var d = data.orders
						var orders = []
						d.forEach(function(ord){
							if (ord.account.id === p.accountId &&
								utils.instrumentsHasId(p.instruments, ord.orderbook.id) &&
								ord.type === 'BUY'){
								orders.push({instrumentId: ord.orderbook.id, orderId: ord.orderId, type: ord.type})
							}
						})
						resolve({orders: orders})
					}
				}).catch((msg) => {reject(msg)})
			}
		})
	}
	getDeals(p){
		return new Promise((resolve, reject) => {
			if (!this.active || p.accountId === undefined || p.instruments[0].instrumentId === undefined) {
				reject('Disconnected or wrong params.')
			} else{
				this.avanza.getDealsAndOrders().then((data) => {
					if (!this.active) {
						reject('got data while disconnected')
					} else {
						var d = data.deals
						var deals = []
						d.forEach(function(dl){
							if (dl.account.id === p.accountId && utils.instrumentsHasId(p.instruments,dl.orderbook.id)){
								deals.push({instrumentId: dl.orderbook.id, orderId: dl.orderId, type: dl.type, volume: dl.volume})
							}
						})
						resolve({deals: deals})
					}
				}).catch((msg) => {reject(msg)})
			}
		})
	}
	getSellDeals(p){
		return new Promise((resolve, reject) => {
			if (!this.active || p.accountId === undefined || p.instruments[0].instrumentId === undefined) {
				reject('Disconnected or wrong params.')
			} else{
				this.avanza.getDealsAndOrders().then((data) => {
					if (!this.active) {
						reject('got data while disconnected')
					} else {
						var d = data.deals
						var deals = []
						d.forEach(function(dl){
							if (dl.account.id === p.accountId &&
								utils.instrumentsHasId(p.instruments, dl.orderbook.id) &&
								dl.type === 'SELL'){
								deals.push({instrumentId: dl.orderbook.id, orderId: dl.orderId, type: dl.type})
							}
						})
						resolve({deals})
					}
				}).catch((msg) => {reject(msg)})
			}
		})
	}
	getBuyDeals(p){
		return new Promise((resolve, reject) => {
			if (!this.active || p.accountId === undefined || p.instruments[0].instrumentId === undefined) {
				reject('Disconnected or wrong params.')
			} else {
				this.avanza.getDealsAndOrders().then((data) => {
					if (!this.active) {
						reject('got data while disconnected')
					} else {
						var d = data.deals
						var deals = []
						d.forEach(function(dl){
							if (dl.account.id === p.accountId &&
								utils.instrumentsHasId(p.instruments, dl.orderbook.id) &&
								dl.type === 'BUY'){
								deals.push({instrumentId: dl.orderbook.id, orderId: dl.orderId, type: dl.type})
							}
						})
						resolve({deals})
					}
				}).catch((msg) => {reject(msg)})
			}
		})
	}
	getBidAsk(p){
		return new Promise((resolve, reject) => {
			if (!this.active || p.instrumentId === undefined || p.instrumentType === undefined){
				reject('Disconnected or wrong params')
			} else {
				this.avanza.getOrderbook(p.instrumentType, p.instrumentId).then((data) => {
					if (!this.active) {
						reject('got data while disconnected')
					} else {
						if (data.orderDepthLevels.length === 0){
							reject('market closed')
						} else {
							resolve({bidAsk: data.orderDepthLevels})
							//resolve({bid_ask: {buy:data.orderDepthLevels[0].buy, sell:data.orderDepthLevels[0].sell}})
						}
					}
				}).catch((msg) => {
					reject(msg)
				})
			}
		})
	}
	getAccPositions(p){
		return new Promise((resolve, reject) => {
			if (!this.active || p.accountId === undefined || p.instruments[0].instrumentId === undefined){
				reject('Disconnected or wrong params')
			} else {
				this.avanza.getPositions().then((data) => {
					if (!this.active) {
						reject('got data while disconnected')
					} else {
						var accPos = []
						data.instrumentPositions.forEach(posType => {
							posType.positions.forEach(pos => {
								if (pos.accountId == p.accountId && utils.instrumentsHasId(p.instruments, pos.orderbookId)){
									accPos.push({instrumentId: pos.orderbookId, volume: pos.volume})
								}
							})
						})
						resolve({accPositions: accPos})
					}
				}).catch((msg) => {
					reject(msg)
				})

			}
		})
	}
	placeOrder(p){
		return new Promise((resolve, reject) => {
			if (!this.active ||
				p.price === undefined ||
				p.validUntil === undefined ||
				p.volume === undefined ||
				p.orderbookId === undefined ||
				p.orderType === undefined ||
				p.accountId === undefined){
				reject('Disconnected or wrong params')
			} else {
				this.avanza.placeOrder({
					'price': p.price,
					'validUntil': p.validUntil,
					'volume': p.volume,
					'orderbookId': p.orderbookId,	 // This is the instrument id, visible in URL.
					'orderType': p.orderType,			 // can be sell also.
					'accountId': p.accountId		 // The avanza account Id, visible in GUI.
				}).then((msg) => {
					if (!this.active) {
						reject('got data while disconnected')
					} else {
						resolve(msg)
					}
				}).catch((msg) => {
					reject(msg)
				})
			}
		})
	}
	placeWebOrder(p){
		return new Promise((resolve, reject) => {
			if (!this.active ||
				p.accountId === undefined ||
				p.advancedOrder === undefined ||
				p.oneClickOrder === undefined ||
				p.orderCondition === undefined ||
				p.orderMarketReference === undefined ||
				p.orderType === undefined ||
				p.orderWindow === undefined ||
				p.orderbookId === undefined ||
				p.parentContext === undefined ||
				p.price === undefined ||
				p.validUntil === undefined ||
				p.volume === undefined ||
				p.volumeFactor === undefined
			){
				reject('Disconnected or wrong params')
			} else {
				this.avanza.placeWebOrder({
					accountId: p.accountId,
					advancedOrder: p.advancedOrder,
					oneClickOrder: p.oneClickOrder,
					orderCondition: p.orderCondition,
					orderMarketReference: p.orderMarketReference,
					orderType: p.orderType,
					orderWindow: p.orderWindow,
					orderbookId: p.orderbookId,
					parentContext: p.parentContext,
					price: p.price,
					validUntil: p.validUntil,
					volume: p.volume,
					volumeFactor: p.volumeFactor
				}).then((msg) => {
					if (!this.active) {
						reject('got data while disconnected')
					} else {
						resolve(msg)
					}
				}).catch((msg) => {
					reject(msg)
				})
			}
		})
	}
	editOrder(instType, orderId, p){
		return new Promise((resolve, reject) => {
			if (!this.active ||
				p.price === undefined ||
				p.validUntil === undefined ||
				p.volume === undefined ||
				p.orderbookId === undefined ||
				p.orderType === undefined ||
				p.accountId === undefined||
				instType !== 'WARRANT' ||
				orderId === undefined){
				reject('Disconnected or wrong params')
			} else {
				this.avanza.editOrder(instType, orderId, {
					'price': p.price,
					'validUntil': p.validUntil,
					'volume': p.volume,
					'orderbookId': p.orderbookId,	 // This is the instrument id, visible in URL.
					'orderType': p.orderType,			 // can be sell also.
					'accountId': p.accountId		 // The avanza account Id, visible in GUI.
				}).then((msg) => {
					if (!this.active) {
						reject('got data while disconnected')
					} else {
						resolve(msg)
					}
				}).catch((msg) => {
					reject(msg)
				})
			}
		})
	}

	deleteOrder(p){
		return new Promise((resolve, reject) => {
			if (!this.active || p.accountId === undefined || p.orderId === undefined){
				reject('Disconnected or wrong params')
			} else {
				this.avanza.deleteOrder(p.accountId, p.orderId).then((msg) => {
					if (!this.active) {
						reject('got data while disconnected')
					} else {
						resolve({status: msg})
					}
				}).catch((msg) => {
					reject(msg)
				})
			}
		})
	}
	getPriceFeed(p, callback){
		return new Promise((resolve, reject) => {
			if (!this.active || p.instrumentType === undefined || p.instrumentId === undefined){
				reject('Disconnected or invalid params'+ JSON.stringify(p) + this.active)
			} else {
				if (p.instrumentType === 'WARRANT') {
					// This is the price data structure:
					// {'orderbookId':'5468','receivedTime':'2017-10-27T10:18:24.103+0200',
					//	'totalLevel':{
					//	  'buySide':{
					//		'price':1760399,'volume':103270,'volumePercent':61},
					//	  'sellSide':{'price':1111905,'volume':64989,'volumePercent':38}},
					//	'levels':[
					//	  {'buySide':{'price':17.07,'volume':1937,'volumePercent':3},
					//	   'sellSide':{'price':17.09,'volume':5034,'volumePercent':7}},
					//	  {'buySide':{'price':17.06,'volume':7351,'volumePercent':11},
					//	   'sellSide':{'price':17.1,'volume':18418,'volumePercent':28}},
					//	  ...],
					//	'marketMakerLevelAsk':null,
					//	'marketMakerLevelBid':null}
					this.avanza.subscribe(Avanza.ORDERDEPTHS, p.instrumentId, (data) => {
						if (this.active) {
							if (data.levels.length > 0 && data.marketMakerLevelAsk !== null && data.marketMakerLevelBid !== null){
								var sellLevel = data.marketMakerLevelAsk
								var buyLevel = data.marketMakerLevelBid
								callback({
									orderbookId: data.orderbookId,
									buy: {
										price: data.levels[buyLevel].buySide.price,
										volume: data.levels[buyLevel].buySide.volume },
									sell: {
										price: data.levels[sellLevel].sellSide.price,
										volume: data.levels[sellLevel].sellSide.volume }
								})
							}
						}
					})
					resolve('connected')
				} else if(p.instrumentType === 'INDEX') {
					// the index price struct
					// {'orderbookId':'19002','buyer':null,'buyerName':null,'seller':null,'sellerName':null,'dealTime':1509092287408,'price':1660.18,'volume':0,'matchedOnMarket':true,'cancelled':false}
					this.avanza.subscribe(Avanza.TRADES, p.instrumentId, (data) => {
						if (this.active) {
							callback(data)
						}
					})
					resolve('connected')
				} else if (p.instrumentType === 'STOCK'){
					this.avanza.subscribe(Avanza.QUOTES, p.instrumentId, (data) => {
						if (this.active) {
							if (data.sellPrice && data.buyPrice){
								callback({
									orderbookId: data.orderbookId,
									buy: {
										price: data.buyPrice,
										volume: 20000 },
									sell: {
										price: data.sellPrice,
										volume: 20000 }
								})
							}
						}
					})
					resolve('connected')
				}else {
					reject('Invalid instrument type')
				}
			}
		})
	}
	getQuotesFeed(p, callback){
		return new Promise((resolve, reject) => {
			if (!this.active || p.instrumentType === undefined || p.instrumentId === undefined){
				reject('Disconnected or invalid params'+ JSON.stringify(p) + this.active)
			} else {
				if (p.instrumentType === 'STOCK') {
					// This is the price data structure:
					//{
					//	"orderbookId":"5447",
					//	"buyPrice":175.85,
					//	"sellPrice":175.95,
					//	"spread":0.06,
					//	"closingPrice":173.45,
					//	"highestPrice":175.9,
					//	"lowestPrice":173.45,
					//	"lastPrice":175.9,
					//	"change":2.45,
					//	"changePercent":1.41,
					//	"updated":1547025218000,
					//	"volumeWeightedAveragePrice":174.79,
					//	"totalVolumeTraded":197391,
					//	"totalValueTraded":34501306.55,
					//	"updatedDisplay":"10:13",
					//	"changePercentNumber":1.41,
					//	"lastUpdated":1547025218000
					//}
					this.avanza.subscribe(Avanza.QUOTES, p.instrumentId, (data) => {
						if (this.active) {
							if (data.sellPrice && data.buyPrice){
								callback({
									orderbookId: data.orderbookId,
									buy: {
										price: data.buyPrice,
										volume: 20000 },
									sell: {
										price: data.sellPrice,
										volume: 20000 }
								})
							}
						}
					})
				} else {
					reject('unsupported instrument.', p)
				}
				resolve('connected')
			}
		})
	}
	getDealsFeed(p, callback){
		return new Promise((resolve, reject) => {
			if (!this.active || typeof(p) !== 'string'){
				reject('Disconnected or invalid params'+ JSON.stringify(p) + this.active)
			} else {
				//expected data format
				/*{"deals":[
					{
						"id":"90255574",
						"accountId":"123123",
						"orderbook":{
							"id":"755398",
							"name":"TURBO S OMX AVA 249",
							"tickerSymbol":"TURBO S OMX AVA 249",
							"marketPlaceName":"First North Stockholm",
							"countryCode":"SE",
							"instrumentType":"Warrant",
							"tradable":true,
							"volumeFactor":1,
							"currencyCode":"SEK",
							"flagCode":"SE",
							"urlName":"turbo-s-omx-ava-249"
						},
						"orderType":"Köp",
						"price":77.2,
						"volume":15,
						"dealTime":1538985304931,
						"action":"NEW",
						"sum":1158
					}
				]}*/
				this.avanza.subscribe(Avanza.DEALS, p, (data) => {
					if (this.active) {
						callback(data)
					}
				})
				resolve('connected')
			}
		})
	}
	getOrdersFeed(p, callback){
		return new Promise((resolve, reject) => {
			if (!this.active || typeof(p) !== 'string'){
				reject('Disconnected or invalid params'+ JSON.stringify(p) + this.active)
			} else {
				//expected data format
				/*{
					"orders":[
						{
							"id":"88556931",
							"accountId":"1234",
							"orderbook":{
								"id":"118370",
								"name":"Metallvärden i Sverige",
								"instrumentType":"Aktie",
							},
							"currentVolume":5,
							"openVolume":null,
							"price":0.09,
							"validDate":"2018-10-24",
							"type":"Köp",
							"state":{
								"value":"Väntande"
							},
							"action":"NEW",
							"modifiable":true,
							"deletable":true,
							"sum":0.45,
							"visibleDate":null,
							"orderDateTime":1540392212242
						}
					]
				}*/
				this.avanza.subscribe(Avanza.ORDERS, p, (data) => {
					if (this.active) {
						callback(data)
					}
				})
				resolve('connected')
			}
		})
	}

}


module.exports = new Wrapper()
