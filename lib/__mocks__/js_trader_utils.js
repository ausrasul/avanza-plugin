const utils = jest.genMockFromModule('js_trader_utils')
const utilsR = jest.requireActual('js_trader_utils')
utils.getCredentials = jest.fn().mockReturnValue({username: 'user', password: 'pass', totpSecret: 'totpSecret'})
utils.readConf = jest.fn().mockReturnValue({
	accountId: '123456',
	indexId: '19002',
	minInstPrice: 80,
	betsize: 'auto',
	loginTime: 855,
	logoutTime: 1740,
	tcpPort: 9838,
	tcpIp: '127.0.0.1',
	marketDaysFile: './src/marketDays.json',
	instrumentsFile: './src/instruments.json',
	halfDayEnd: 1255,
	fullDayEnd: 1723,
	dayStart : 900,
	logoutGraceTime: 5,
	mmMinVolume: 1000,
	accountsString: '_123,234,345,456',
	clearing: '9552'
})
utils.readInstruments = jest.fn().mockReturnValue(
	{
		'short': [
			{'id': '861484', 'type': 'WARRANT', 'finance_level': 1606.473},
			{'id': '854287', 'type': 'WARRANT', 'finance_level': 1629.119},
			{'id': '853354', 'type': 'WARRANT', 'finance_level': 1653.524},
			{'id': '680968', 'type': 'WARRANT', 'finance_level': 1670.348},
			{'id': '741893', 'type': 'WARRANT', 'finance_level': 1687.55},
			{'id': '567512', 'type': 'WARRANT', 'finance_level': 1694.24},
			{'id': '680969', 'type': 'WARRANT', 'finance_level': 1694.454},
			{'id': '782941', 'type': 'WARRANT', 'finance_level': 1706.892},
			{'id': '687568', 'type': 'WARRANT', 'finance_level': 1723.071},
			{'id': '564096', 'type': 'WARRANT', 'finance_level': 1736.25}
		],
		'long': [
			{'id': '860133', 'type': 'WARRANT', 'finance_level': 1520.621},
			{'id': '861804', 'type': 'WARRANT', 'finance_level': 1519.737},
			{'id': '844488', 'type': 'WARRANT', 'finance_level': 1492.337},
			{'id': '843921', 'type': 'WARRANT', 'finance_level': 1467.947},
			{'id': '850050', 'type': 'WARRANT', 'finance_level': 1449.955},
			{'id': '710682', 'type': 'WARRANT', 'finance_level': 1435.628},
			{'id': '707041', 'type': 'WARRANT', 'finance_level': 1412.43},
			{'id': '819692', 'type': 'WARRANT', 'finance_level': 1400.242},
			{'id': '703738', 'type': 'WARRANT', 'finance_level': 1387.559}
		]
	}
)
var i = 0
utils.getSerial = jest.fn().mockReturnValue(++i)
utils.getTime = utilsR.getTime
utils.getMarketDay = jest.fn().mockImplementation(() => {return 'N'})
utils.shiftTimeBack = jest.fn()
utils.logger = jest.fn().mockReturnValue({log: jest.fn()})
utils.todayDate = utilsR.todayDate
utils.instrumentsHasId = utilsR.instrumentsHasId
utils.getInstrumentByExpectedPrice = utilsR.getInstrumentByExpectedPrice
utils.makeOhlc = utilsR.makeOhlc
utils.setState = utilsR.setState
utils.DynamicExtremes = utilsR.DynamicExtremes
utils.EMA = utilsR.EMA
utils.SMA = utilsR.SMA
utils.MarketWindow = utilsR.MarketWindow
utils.MovingOHLC = utilsR.MovingOHLC
utils.Avg = utilsR.Avg
utils.OHLC = utilsR.OHLC
module.exports = utils
