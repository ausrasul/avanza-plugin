var broker = require('../src/avanzaWrapper')
const AvanzaInst = require('../src/avanzaInst')
jest.mock('js_trader_utils')
jest.mock('../src/avanzaInst')

describe('Avanza wrapper instantiation', () => {
	test('instantiates wrapper', () => {
		expect.assertions(2)
		expect(broker.avanza).toBe(AvanzaInst)
		expect(broker.active).toBe(false)
	})

	test('authenticate', async () => {
		expect.assertions(3)
		var param = {username: 'testuser', password: 'zxcv', totpSecret: 'asdfasdf'}
		await expect(broker.authenticate(param)).resolves.toBeUndefined()
		expect(AvanzaInst.authenticate).toBeCalledWith(param)
		expect(broker.active).toBe(true)
	})

	test('authenticate twice', async () => {
		expect.assertions(2)
		var param = {username: 'testasdf', password: 'zxcv', totpSecret: 'asdfasdf'}
		await broker.disconnect()
		await broker.authenticate(param)
		expect(AvanzaInst.authenticate).toBeCalledWith(param)
		await expect(broker.authenticate(param)).rejects.toEqual('already logged in')
	})

	test('disconnect', () => {
		expect.assertions(2)
		broker.disconnect()
		expect(AvanzaInst.disconnect).toHaveBeenCalled()
		expect(broker.active).toBe(false)
	})

	it('handle authenticate rejection', async () => {
		expect.assertions(3)
		broker.disconnect()
		const param = {username: 'testuser', password: 'zxcv', totpSecret: 'asdfasdf'}
		const original = AvanzaInst.authenticate
		AvanzaInst.authenticate = jest.fn(()=>{
			return Promise.reject({})
		})
		await expect(broker.authenticate(param)).rejects.toBeDefined()
		expect(AvanzaInst.authenticate).toBeCalledWith(param)
		expect(broker.active).toBe(false)
		AvanzaInst.authenticate = original
	})
})

describe('Avanza wrapper standard methods', () =>{
	beforeEach(async ()=>{
		jest.clearAllMocks()
		jest.useFakeTimers()
		var param = {username: 'asdf', password: 'zxcv', totpSecret: 'asdfasdf'}
		await broker.authenticate(param)
	})
	afterEach(async () => {
		await broker.disconnect()
	})

	test('get balance', async () => {
		expect.assertions(2)
		var param = {accountId : 1}
		await expect(broker.getBalance(param)).resolves.toEqual({balance: 1})
		expect(AvanzaInst.getAccountOverview).toBeCalledWith(1)
	})

	test('get balance rejects wrong parameters', async () => {
		expect.assertions(2)
		await expect(broker.getBalance(param)).rejects.toBeDefined()
		var param = {wrongparam : 1}
		expect(AvanzaInst.getAccountOverview).not.toHaveBeenCalled()
	})

	test('get balance while logged out', async() =>{
		expect.assertions(2)
		await broker.disconnect()
		var param = {accountId : 11}
		await expect(broker.getBalance(param)).rejects.toBeDefined()
		expect(AvanzaInst.getAccountOverview).not.toHaveBeenCalled()
	})

	it ('reject get balance if receive result after logout', async() => {
		expect.assertions(2)
		const param = {accountId: 11}
		jest.spyOn(AvanzaInst,'getAccountOverview').mockImplementation(()=>{
			broker.active = false
			return Promise.resolve({})
		})
		await expect(broker.getBalance(param)).rejects.toBeDefined()
		expect(AvanzaInst.getAccountOverview).toHaveBeenCalled()
	})

	it ('handles getbalance rejection', async() => {
		expect.assertions(2)
		const param = {accountId: 11}
		jest.spyOn(AvanzaInst,'getAccountOverview').mockRejectedValue({})
		await expect(broker.getBalance(param)).rejects.toBeDefined()
		expect(AvanzaInst.getAccountOverview).toHaveBeenCalled()
	})

	it('Gets all orders of multiple instruments', async()=>{
		expect.assertions(2)
		var param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getOrders(param)).resolves.toEqual({orders: [
			{instrumentId: '2', orderId: 123, type: 'BUY'},
			{instrumentId: '2', orderId: 456, type: 'SELL'}
		]})
		expect(AvanzaInst.getDealsAndOrders).toBeCalled()
	})

	it('Gets all deals of multiple instruments', async()=>{
		expect.assertions(2)
		var param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getDeals(param)).resolves.toEqual({
			deals: [
				{instrumentId: '2', orderId: 123, type: 'BUY', volume: 10},
				{instrumentId: '2', orderId: 456, type: 'SELL', volume: 10}
			]
		})
		expect(AvanzaInst.getDealsAndOrders).toBeCalled()
	})

	it('Gets all orders of multiple instruments but ignore the others', async()=>{
		expect.assertions(2)
		var param = {accountId: 1, instruments: [
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getOrders(param)).resolves.toEqual({orders: []})
		expect(AvanzaInst.getDealsAndOrders).toBeCalled()
	})

	it('Gets all deals of multiple instruments but ignore the others', async()=>{
		expect.assertions(2)
		var param = {accountId: 1, instruments: [
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getDeals(param)).resolves.toEqual({deals: []})
		expect(AvanzaInst.getDealsAndOrders).toBeCalled()
	})

	test('get all orders rejects wrong params', async()=>{
		expect.assertions(2)
		var param = {wrongaccount: 1, wrongkey: 2}
		await expect(broker.getOrders(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	test('get all deals rejects wrong params', async()=>{
		expect.assertions(2)
		var param = {wrongaccount: 1, wrongkey: 2}
		await expect(broker.getDeals(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	test('get all orders while logged out', async()=>{
		expect.assertions(2)
		await broker.disconnect()
		var param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getOrders(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	test('get all deals while logged out', async()=>{
		expect.assertions(2)
		await broker.disconnect()
		var param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getDeals(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	it('Get buy orders of multiple instruments', async()=>{
		expect.assertions(2)
		var param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getBuyOrders(param)).resolves.toEqual(
			{orders: [{instrumentId:'2', orderId: 123, type: 'BUY'}]}
		)
		expect(AvanzaInst.getDealsAndOrders).toHaveBeenCalled()
	})

	it('Get buy deals of multiple instruments', async()=>{
		expect.assertions(2)
		var param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getBuyDeals(param)).resolves.toEqual(
			{deals: [{instrumentId:'2', orderId: 123, type: 'BUY'}]}
		)
		expect(AvanzaInst.getDealsAndOrders).toHaveBeenCalled()
	})

	test('get buy orders rejects wrong params', async()=>{
		expect.assertions(2)
		var param = {wrongaccount: 1, instrumentId: 2}
		await expect(broker.getBuyOrders(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	test('get buy deals rejects wrong params', async()=>{
		expect.assertions(2)
		var param = {wrongaccount: 1, instrumentId: 2}
		await expect(broker.getBuyDeals(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	test('get buy orders while logged out', async()=>{
		expect.assertions(2)
		await broker.disconnect()
		var param = {accountId: 1, instruments: [{instrumentId: '2', instrumentType:'WARRANT'}]}
		await expect(broker.getBuyOrders(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	test('get buy deals while logged out', async()=>{
		expect.assertions(2)
		await broker.disconnect()
		var param = {accountId: 1, instruments: [{instrumentId: '2', instrumentType:'WARRANT'}]}
		await expect(broker.getBuyDeals(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	it('Gets sell orders of multiple instruments', async()=>{
		expect.assertions(2)
		var param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getSellOrders(param)).resolves.toEqual(
			{orders: [{instrumentId: '2', orderId: 456, type: 'SELL'}]}
		)
		expect(AvanzaInst.getDealsAndOrders).toHaveBeenCalled()
	})

	it('Gets sell deals of multiple instruments', async()=>{
		expect.assertions(2)
		var param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getSellDeals(param)).resolves.toEqual(
			{deals: [{instrumentId: '2', orderId: 456, type: 'SELL'}]}
		)
		expect(AvanzaInst.getDealsAndOrders).toHaveBeenCalled()
	})

	test('get sell orders rejects wrong params', async()=>{
		expect.assertions(2)
		var param = {wrongaccount: 1, instrumentId: 2}
		await expect(broker.getSellOrders(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	test('get sell deals rejects wrong params', async()=>{
		expect.assertions(2)
		var param = {wrongaccount: 1, instrumentId: 2}
		await expect(broker.getSellDeals(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	test('get sell orders while logged out', async()=>{
		expect.assertions(2)
		await broker.disconnect()
		var param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getSellOrders(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	test('get sell deals while logged out', async()=>{
		expect.assertions(2)
		await broker.disconnect()
		var param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getSellDeals(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	test('get sell orders while logged out', async()=>{
		expect.assertions(2)
		await broker.disconnect()
		var param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getSellOrders(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	test('get sell deals while logged out', async()=>{
		expect.assertions(2)
		await broker.disconnect()
		var param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getSellDeals(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).not.toHaveBeenCalled()
	})

	it('rejects get sell/buy orders if results comes after logged out', async()=>{
		expect.assertions(4)
		const param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		jest.spyOn(AvanzaInst, 'getDealsAndOrders').mockImplementation(()=>{
			broker.active = false
			return Promise.resolve({})
		})
		broker.active = true
		await expect(broker.getSellOrders(param)).rejects.toBeDefined()
		broker.active = true
		await expect(broker.getBuyOrders(param)).rejects.toBeDefined()
		broker.active = true
		await expect(broker.getOrders(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).toHaveBeenCalledTimes(3)
	})


	it('rejects get sell/buy deals if results comes after logged out', async()=>{
		expect.assertions(4)
		const param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		jest.spyOn(AvanzaInst, 'getDealsAndOrders').mockImplementation(()=>{
			broker.active = false
			return Promise.resolve({})
		})
		broker.active = true
		await expect(broker.getSellDeals(param)).rejects.toBeDefined()
		broker.active = true
		await expect(broker.getBuyDeals(param)).rejects.toBeDefined()
		broker.active = true
		await expect(broker.getDeals(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).toHaveBeenCalledTimes(3)
	})

	it('rejects get sell/buy orders is handled', async()=>{
		expect.assertions(4)
		const param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		jest.spyOn(AvanzaInst, 'getDealsAndOrders').mockRejectedValue({})
		await expect(broker.getSellOrders(param)).rejects.toBeDefined()
		await expect(broker.getBuyOrders(param)).rejects.toBeDefined()
		await expect(broker.getOrders(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).toHaveBeenCalledTimes(3)
	})

	it('rejects get sell/buy deals is handled', async()=>{
		expect.assertions(4)
		const param = {accountId: 1, instruments: [
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		jest.spyOn(AvanzaInst, 'getDealsAndOrders').mockRejectedValue({})
		await expect(broker.getSellDeals(param)).rejects.toBeDefined()
		await expect(broker.getBuyDeals(param)).rejects.toBeDefined()
		await expect(broker.getDeals(param)).rejects.toBeDefined()
		expect(AvanzaInst.getDealsAndOrders).toHaveBeenCalledTimes(3)
	})

	test('get bid/ask', async()=>{
		expect.assertions(2)
		var param = {instrumentId: 2, instrumentType: 'WARRANT'}
		await expect(broker.getBidAsk(param)).resolves.toEqual({bidAsk: [
			{buy: {price: 60, volume: 80}, sell: {price: 101, volume: 25000}},
			{buy: {price: 100, volume: 25000}, sell: null}
		]})
		expect(AvanzaInst.getOrderbook).toBeCalledWith('WARRANT', 2)
	})

	test('get bid/ask while logged out', async()=>{
		expect.assertions(2)
		await broker.disconnect()
		const param = {instrumentId: 2, instrumentType: 'WARRANT'}
		await expect(broker.getBidAsk(param)).rejects.toBeDefined()
		expect(AvanzaInst.getOrderbook).not.toHaveBeenCalled()
	})

	test('get bid/ask rejects wrong params', async()=>{
		expect.assertions(2)
		const param = {wronginstrument: 2, instrumentType: 'WARRANT'}
		await expect(broker.getBidAsk(param)).rejects.toBeDefined()
		expect(AvanzaInst.getOrderbook).not.toHaveBeenCalled()
	})

	test('get bid/ask rejects if no order depth, ie. after market close', async()=>{
		expect.assertions(2)
		const param = {instrumentId: 2, instrumentType: 'WARRANT'}
		jest.spyOn(AvanzaInst, 'getOrderbook').mockImplementation(function(){
			return Promise.resolve({orderDepthLevels: []})
		})
		await expect(broker.getBidAsk(param)).rejects.toBeDefined()
		expect(AvanzaInst.getOrderbook).toHaveBeenCalled()
	})

	test('get bid/ask rejects if received result after logout', async()=>{
		expect.assertions(2)
		const param = {instrumentId: 2, instrumentType: 'WARRANT'}
		jest.spyOn(AvanzaInst, 'getOrderbook').mockImplementation(function(){
			broker.active = false
			return Promise.resolve({})
		})
		await expect(broker.getBidAsk(param)).rejects.toBeDefined()
		expect(AvanzaInst.getOrderbook).toHaveBeenCalled()
		AvanzaInst.getOrderbook.mockRestore()
	})

	test('get bid/ask reject is handled', async() =>{
		expect.assertions(2)
		const param = {instrumentId: 2, instrumentType: 'WARRANT'}
		jest.spyOn(AvanzaInst, 'getOrderbook').mockRejectedValue({})
		await expect(broker.getBidAsk(param)).rejects.toBeDefined()
		expect(AvanzaInst.getOrderbook).toHaveBeenCalled()
		AvanzaInst.getOrderbook.mockRestore()
	})

	it('Gets positions of multiple instruments', async()=>{
		expect.assertions(2)
		var param = {accountId: 1, instruments:[
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getAccPositions(param)).resolves.toEqual(
			{accPositions: [{instrumentId: '2', volume: 100},{instrumentId: '222', volume: 200}]}
		)
		expect(AvanzaInst.getPositions).toHaveBeenCalled()
	})
	test('get positions rejects wrong params', async()=>{
		expect.assertions(2)
		var param = {wrongaccount: 1, instrumentId: 2}
		await expect(broker.getAccPositions(param)).rejects.toBeDefined()
		expect(AvanzaInst.getPositions).not.toHaveBeenCalled()
	})

	test('get positions while logged out', async()=>{
		expect.assertions(2)
		await broker.disconnect()
		const param = {accountId: 1, instruments:[
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getAccPositions(param)).rejects.toBeDefined()
		expect(AvanzaInst.getPositions).not.toHaveBeenCalled()
	})

	test('get positions rejects if received result after logout', async()=>{
		expect.assertions(2)
		const param = {accountId: 1, instruments:[
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		jest.spyOn(AvanzaInst, 'getPositions').mockImplementation(function(){
			broker.active = false
			return Promise.resolve({})
		})
		await expect(broker.getAccPositions(param)).rejects.toBeDefined()
		expect(AvanzaInst.getPositions).toHaveBeenCalled()
		AvanzaInst.getPositions.mockRestore()
	})

	test('get positions reject is handled', async() =>{
		expect.assertions(2)
		jest.spyOn(AvanzaInst, 'getPositions').mockRejectedValue({})
		const param = {accountId: 1, instruments:[
			{instrumentId: '2', instrumentType: 'WARRANT'},
			{instrumentId: '222', instrumentType: 'WARRANT'}
		]}
		await expect(broker.getAccPositions(param)).rejects.toBeDefined()
		expect(AvanzaInst.getPositions).toHaveBeenCalled()
		AvanzaInst.getPositions.mockRestore()
	})

	test('place order', async() =>{
		expect.assertions(2)
		var param = {
			price: 1,
			validUntil: '2018-10-10',
			volume: 1,
			orderbookId: 10,
			orderType: 'SELL',
			accountId: 1
		}
		await expect(broker.placeOrder(param)).resolves.toEqual({
			orderId: '1234',
			status: 'SUCCESS'
		})
		expect(AvanzaInst.placeOrder).toHaveBeenCalledWith(param)
	})
	test('place order rejects wrong params', async() =>{
		expect.assertions(2)
		var param = {
			priceeeee: 1,
			validUntil: '2018-10-10',
			volume: 1,
			orderbookId: 10,
			orderType: 'SELL',
			accountId: 1
		}
		await expect(broker.placeOrder(param)).rejects.toBeDefined()
		expect(AvanzaInst.placeOrder).not.toHaveBeenCalled()
	})

	test('place order rejects when called after loggedout', async() =>{
		expect.assertions(2)
		await broker.disconnect()
		const param = {
			price: 1,
			validUntil: '2018-10-10',
			volume: 1,
			orderbookId: 10,
			orderType: 'SELL',
			accountId: 1
		}
		await expect(broker.placeOrder(param)).rejects.toBeDefined()
		expect(AvanzaInst.placeOrder).not.toHaveBeenCalled()
	})

	test('place order rejects if received result after logout', async()=>{
		expect.assertions(2)
		const param = {
			price: 1,
			validUntil: '2018-10-10',
			volume: 1,
			orderbookId: 10,
			orderType: 'SELL',
			accountId: 1
		}
		jest.spyOn(AvanzaInst, 'placeOrder').mockImplementation(function(){
			broker.active = false
			return Promise.resolve({})
		})
		await expect(broker.placeOrder(param)).rejects.toBeDefined()
		expect(AvanzaInst.placeOrder).toHaveBeenCalled()
		AvanzaInst.placeOrder.mockRestore()
	})

	test('place order reject is handled', async() =>{
		expect.assertions(2)
		jest.spyOn(AvanzaInst, 'placeOrder').mockRejectedValue({})
		const param = {
			price: 1,
			validUntil: '2018-10-10',
			volume: 1,
			orderbookId: 10,
			orderType: 'SELL',
			accountId: 1
		}
		await expect(broker.placeOrder(param)).rejects.toBeDefined()
		expect(AvanzaInst.placeOrder).toHaveBeenCalled()
	})

	test('edit order', async() =>{
		expect.assertions(2)
		const instType = 'WARRANT'
		const orderId = 1234
		const param = {
			price: 1,
			validUntil: '2018-10-10',
			volume: 1,
			orderbookId: 10,
			orderType: 'SELL',
			accountId: 1
		}
		await expect(broker.editOrder(instType, orderId, param)).resolves.toEqual({
			orderId: '1234',
			status: 'SUCCESS'
		})
		expect(AvanzaInst.editOrder).toHaveBeenCalledWith(instType, orderId, param)
	})
	test('edit order rejects wrong params', async() =>{
		expect.assertions(2)
		const instType = 'WARRANT'
		const orderId = 1234
		const param = {
			priceeeee: 1,
			validUntil: '2018-10-10',
			volume: 1,
			orderbookId: 10,
			orderType: 'SELL',
			accountId: 1
		}
		await expect(broker.editOrder(instType, orderId, param)).rejects.toBeDefined()
		expect(AvanzaInst.editOrder).not.toHaveBeenCalled()
	})

	test('edit order rejects if called after loggedout', async() =>{
		expect.assertions(2)
		await broker.disconnect()
		const instType = 'WARRANT'
		const orderId = 1234
		const param = {
			price: 1,
			validUntil: '2018-10-10',
			volume: 1,
			orderbookId: 10,
			orderType: 'SELL',
			accountId: 1
		}
		await expect(broker.editOrder(instType, orderId, param)).rejects.toBeDefined()
		expect(AvanzaInst.editOrder).not.toHaveBeenCalled()
	})

	test('edit order rejects if received result after logout', async()=>{
		expect.assertions(2)
		const instType = 'WARRANT'
		const orderId = 1234
		const param = {
			price: 1,
			validUntil: '2018-10-10',
			volume: 1,
			orderbookId: 10,
			orderType: 'SELL',
			accountId: 1
		}
		jest.spyOn(AvanzaInst, 'editOrder').mockImplementation(function(){
			broker.active = false
			return Promise.resolve({})
		})
		await expect(broker.editOrder(instType, orderId, param)).rejects.toBeDefined()
		expect(AvanzaInst.editOrder).toHaveBeenCalled()
		AvanzaInst.editOrder.mockRestore()
	})

	test('edit order reject is handled', async() =>{
		expect.assertions(2)
		jest.spyOn(AvanzaInst, 'editOrder').mockRejectedValue({})
		const instType = 'WARRANT'
		const orderId = 1234
		const param = {
			price: 1,
			validUntil: '2018-10-10',
			volume: 1,
			orderbookId: 10,
			orderType: 'SELL',
			accountId: 1
		}
		await expect(broker.editOrder(instType, orderId, param)).rejects.toBeDefined()
		expect(AvanzaInst.editOrder).toHaveBeenCalled()
	})

	test('delete order', async()=>{
		expect.assertions(2)
		var param = {accountId: 1, orderId: 2}
		await expect(broker.deleteOrder(param)).resolves.toBeDefined()
		expect(AvanzaInst.deleteOrder).toHaveBeenCalledWith(1, 2)
	})

	test('delete order rejects wrong params', async()=>{
		expect.assertions(2)
		var param = {wrongAccount: 1, orderId: 2}
		await expect(broker.deleteOrder(param)).rejects.toBeDefined()
		expect(AvanzaInst.deleteOrder).not.toHaveBeenCalled()
	})

	test('delete order rejects if called after logout', async()=>{
		expect.assertions(2)
		await broker.disconnect()
		const param = {accountId: 1, orderId: 2}
		await expect(broker.deleteOrder(param)).rejects.toBeDefined()
		expect(AvanzaInst.deleteOrder).not.toHaveBeenCalled()
	})

	test('delete order rejects if received result after logout', async()=>{
		expect.assertions(2)
		const param = {accountId: 1, orderId: 2}
		jest.spyOn(AvanzaInst, 'deleteOrder').mockImplementation(function(){
			broker.active = false
			return Promise.resolve({})
		})
		await expect(broker.deleteOrder(param)).rejects.toBeDefined()
		expect(AvanzaInst.deleteOrder).toHaveBeenCalled()
		AvanzaInst.deleteOrder.mockRestore()
	})

	test('delete order reject is handled', async() =>{
		expect.assertions(2)
		jest.spyOn(AvanzaInst, 'deleteOrder').mockRejectedValue({})
		const param = {accountId: 1, orderId: 2}
		await expect(broker.deleteOrder(param)).rejects.toBeDefined()
		expect(AvanzaInst.deleteOrder).toHaveBeenCalled()
		AvanzaInst.deleteOrder.mockRestore()
	})

	it('Subscribes to deals', async () => {
		expect.assertions(3)
		const param = '_1111,2222,3333,4444,5555'
		const cb = jest.fn()
		const expectedData = {
			'deals':[
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
			]
		}
		await expect(broker.getDealsFeed(param, cb)).resolves.toBeDefined()
		jest.runAllTimers()
		expect(cb).toHaveBeenCalledTimes(10)
		expect(cb).toHaveBeenCalledWith(expectedData)
	})
	it('Mutes deals subscription if got results after loggedout', async () => {
		expect.assertions(2)
		const param = '_1111,2222,3333,4444,5555'
		const cb = jest.fn()
		const original = AvanzaInst.subscribe
		AvanzaInst.subscribe = jest.fn((...params)=>{
			broker.active = false
			original(...params)
		})
		await expect(broker.getDealsFeed(param, cb)).resolves.toBeDefined()
		jest.runAllTimers()
		expect(cb).not.toHaveBeenCalled()
		AvanzaInst.subscribe = original
	})
	it('Rejects deals subscription if wrong params', async () => {
		expect.assertions(2)
		const param = {}
		const cb = jest.fn()
		await expect(broker.getDealsFeed(param, cb)).rejects.toBeDefined()
		expect(cb).not.toHaveBeenCalled()
	})
	it('rejects deals subsc when logged out', async () => {
		expect.assertions(2)
		await broker.disconnect()
		const param = '_1111,2222,3333,4444,5555'
		const cb = jest.fn()
		await expect(broker.getDealsFeed(param, cb)).rejects.toBeDefined()
		jest.runAllTimers()
		expect(cb).not.toHaveBeenCalled()
	})


	it('Subscribes to orders', async () => {
		expect.assertions(3)
		const param = '_1111,2222,3333,4444,5555'
		const cb = jest.fn()
		const expectedData = {
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

		await expect(broker.getOrdersFeed(param, cb)).resolves.toBeDefined()
		jest.runAllTimers()
		expect(cb).toHaveBeenCalledTimes(10)
		expect(cb).toHaveBeenCalledWith(expectedData)
	})
	it('Mutes orders subscription if got results after loggedout', async () => {
		expect.assertions(2)
		const param = '_1111,2222,3333,4444,5555'
		const cb = jest.fn()
		const original = AvanzaInst.subscribe
		AvanzaInst.subscribe = jest.fn((...params)=>{
			broker.active = false
			original(...params)
		})
		await expect(broker.getOrdersFeed(param, cb)).resolves.toBeDefined()
		jest.runAllTimers()
		expect(cb).not.toHaveBeenCalled()
		AvanzaInst.subscribe = original
	})
	it('Rejects orders subscription if wrong params', async () => {
		expect.assertions(2)
		const param = {}
		const cb = jest.fn()
		await expect(broker.getOrdersFeed(param, cb)).rejects.toBeDefined()
		expect(cb).not.toHaveBeenCalled()
	})
	it('rejects orders subsc when logged out', async () => {
		expect.assertions(2)
		await broker.disconnect()
		const param = '_1111,2222,3333,4444,5555'
		const cb = jest.fn()
		await expect(broker.getOrdersFeed(param, cb)).rejects.toBeDefined()
		jest.runAllTimers()
		expect(cb).not.toHaveBeenCalled()
	})

	test('index price feed', async () => {
		expect.assertions(3)
		var param = {instrumentType: 'INDEX', instrumentId: 1234}
		var expectedData = {
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
		var cb = jest.fn()
		await expect(broker.getPriceFeed(param, cb)).resolves.toBeDefined()
		jest.runAllTimers()
		expect(cb).toHaveBeenCalledTimes(10)
		expect(cb).toHaveBeenCalledWith(expectedData)
	})

	test('index price feed is muted if got results after loggedout', async () => {
		expect.assertions(2)
		const param = {instrumentType: 'INDEX', instrumentId: 1234}
		const cb = jest.fn()
		const original = AvanzaInst.subscribe
		AvanzaInst.subscribe = jest.fn((...params)=>{
			broker.active = false
			original(...params)
		})
		await expect(broker.getPriceFeed(param, cb)).resolves.toBeDefined()
		jest.runAllTimers()
		expect(cb).not.toHaveBeenCalled()
		AvanzaInst.subscribe = original
	})

	test('warrant price feed', async () => {
		expect.assertions(3)
		var param = {instrumentType: 'WARRANT', instrumentId: 1234}
		var expectedData = {
			orderbookId: '1234',
			buy: {price: 17.07, volume: 1937},
			sell: {price: 17.09, volume: 5034}
		}
		var cb = jest.fn()
		await expect(broker.getPriceFeed(param, cb)).resolves.toBeDefined()
		jest.runAllTimers()
		expect(cb).toHaveBeenCalledTimes(10)
		expect(cb).toHaveBeenCalledWith(expectedData)
	})

	it('mutes warrant price feed if data comes after logout', async () => {
		expect.assertions(2)
		const param = {instrumentType: 'WARRANT', instrumentId: 1234}
		const cb = jest.fn()
		const original = AvanzaInst.subscribe
		AvanzaInst.subscribe = jest.fn((...params)=>{
			broker.active = false
			original(...params)
		})
		await expect(broker.getPriceFeed(param, cb)).resolves.toBeDefined()
		jest.runAllTimers()
		expect(cb).not.toHaveBeenCalled()
		AvanzaInst.subscribe = original
	})

	test('warrant price feed no bid', async () => {
		expect.assertions(2)
		var param = {instrumentType: 'WARRANT', instrumentId: 'MM no bid'}
		var cb = jest.fn()
		await expect(broker.getPriceFeed(param, cb)).resolves.toBeDefined()
		jest.runAllTimers()
		expect(cb).not.toHaveBeenCalled()
	})

	test('warrant price feed no ask', async () => {
		expect.assertions(2)
		var param = {instrumentType: 'WARRANT', instrumentId: 'MM no ask'}
		var cb = jest.fn()
		await expect(broker.getPriceFeed(param, cb)).resolves.toBeDefined()
		jest.runAllTimers()
		expect(cb).not.toHaveBeenCalled()
	})

	test('warrant price feed no MM', async () => {
		expect.assertions(2)
		var param = {instrumentType: 'WARRANT', instrumentId: 'no MM'}
		var cb = jest.fn()
		await expect(broker.getPriceFeed(param, cb)).resolves.toBeDefined()
		jest.runAllTimers()
		expect(cb).not.toHaveBeenCalled()
	})

	test('warrant price feed MM is second in order depth', async () => {
		expect.assertions(3)
		var param = {instrumentType: 'WARRANT', instrumentId: 'MM deep'}
		var expectedData = {
			orderbookId: '1234',
			buy: {price: 17.06, volume: 7351},
			sell: {price: 17.1, volume: 18418}
		}
		var cb = jest.fn()
		await expect(broker.getPriceFeed(param, cb)).resolves.toBeDefined()
		jest.runAllTimers()
		expect(cb).toHaveBeenCalledTimes(10)
		expect(cb).toHaveBeenCalledWith(expectedData)
	})

	test('price feed rejects when logged out', async () => {
		expect.assertions(2)
		await broker.disconnect()
		var param = {instrumentType: 'Any', instrumentId: '1234'}
		var cb = jest.fn()
		await expect(broker.getPriceFeed(param, cb)).rejects.toBeDefined()
		jest.runAllTimers()
		expect(cb).not.toHaveBeenCalled()
	})
	test('place Web order', async() =>{
		expect.assertions(2)
		const param = {
			accountId: '1234',
			advancedOrder: 'true',
			oneClickOrder: 'false',
			orderCondition: 'FILL_OR_KILL',
			orderMarketReference: '',
			orderType: 'BUY',
			orderWindow: '',
			orderbookId: 5386,
			parentContext: 'order',
			price: 71,
			validUntil: '2018-11-12',
			volume: 1,
			volumeFactor: '1.00'
		}
		await expect(broker.placeWebOrder(param)).resolves.toEqual({
			orderId: '1234',
			status: 'SUCCESS'
		})
		expect(AvanzaInst.placeWebOrder).toHaveBeenCalledWith(param)
	})
	test('place web order rejects wrong params', async() =>{
		expect.assertions(14)
		const param = {
			accountId: '1234',
			advancedOrder: 'true',
			oneClickOrder: 'false',
			orderCondition: 'FILL_OR_KILL',
			orderMarketReference: '',
			orderType: 'BUY',
			orderWindow: '',
			orderbookId: 5386,
			parentContext: 'order',
			price: 71,
			validUntil: '2018-11-12',
			volume: 1,
			volumeFactor: '1.00'
		}
		const keys = Object.keys(param)
		const l = keys.length
		for (let i = 0; i < l; i++){
			const incompleteObj = {}
			keys.forEach((k,j)=>{if (j !== i) incompleteObj[k] = param[k]})
			await expect(broker.placeWebOrder(incompleteObj)).rejects.toBeDefined()
		}
		expect(AvanzaInst.placeWebOrder).not.toHaveBeenCalled()
	})

	test('place web order rejects when called after loggedout', async() =>{
		expect.assertions(2)
		await broker.disconnect()
		const param = {
			accountId: '1234',
			advancedOrder: 'true',
			oneClickOrder: 'false',
			orderCondition: 'FILL_OR_KILL',
			orderMarketReference: '',
			orderType: 'BUY',
			orderWindow: '',
			orderbookId: 5386,
			parentContext: 'order',
			price: 71,
			validUntil: '2018-11-12',
			volume: 1,
			volumeFactor: '1.00'
		}
		await expect(broker.placeWebOrder(param)).rejects.toBeDefined()
		expect(AvanzaInst.placeWebOrder).not.toHaveBeenCalled()
	})

	test('place web order rejects if received result after logout', async()=>{
		expect.assertions(2)
		const param = {
			accountId: '1234',
			advancedOrder: 'true',
			oneClickOrder: 'false',
			orderCondition: 'FILL_OR_KILL',
			orderMarketReference: '',
			orderType: 'BUY',
			orderWindow: '',
			orderbookId: 5386,
			parentContext: 'order',
			price: 71,
			validUntil: '2018-11-12',
			volume: 1,
			volumeFactor: '1.00'
		}
		jest.spyOn(AvanzaInst, 'placeWebOrder').mockImplementation(function(){
			broker.active = false
			return Promise.resolve({})
		})
		await expect(broker.placeWebOrder(param)).rejects.toBeDefined()
		expect(AvanzaInst.placeWebOrder).toHaveBeenCalled()
		AvanzaInst.placeWebOrder.mockRestore()
	})

	test('place Web order reject is handled', async() =>{
		expect.assertions(2)
		jest.spyOn(AvanzaInst, 'placeWebOrder').mockRejectedValue({})
		const param = {
			accountId: '1234',
			advancedOrder: 'true',
			oneClickOrder: 'false',
			orderCondition: 'FILL_OR_KILL',
			orderMarketReference: '',
			orderType: 'BUY',
			orderWindow: '',
			orderbookId: 5386,
			parentContext: 'order',
			price: 71,
			validUntil: '2018-11-12',
			volume: 1,
			volumeFactor: '1.00'
		}
		await expect(broker.placeWebOrder(param)).rejects.toBeDefined()
		expect(AvanzaInst.placeWebOrder).toHaveBeenCalled()
	})
	describe('stocks quotes feed', ()=>{
		it('gets stocks quotes feed', async () => {
			expect.assertions(3)
			var param = {instrumentType: 'STOCK', instrumentId: 1234}
			var expectedData = {
				orderbookId: '1234',
				buy: {price: 17.07, volume: 20000},
				sell: {price: 17.09, volume: 20000}
			}
			var cb = jest.fn()
			await expect(broker.getQuotesFeed(param, cb)).resolves.toBeDefined()
			jest.runAllTimers()
			expect(cb).toHaveBeenCalledTimes(10)
			expect(cb).toHaveBeenCalledWith(expectedData)
		})
		it('mutes stock quotes if data comes after logout', async () => {
			expect.assertions(2)
			const param = {instrumentType: 'STOCK', instrumentId: 1234}
			const cb = jest.fn()
			const original = AvanzaInst.subscribe
			AvanzaInst.subscribe = jest.fn((...params)=>{
				broker.active = false
				original(...params)
			})
			await expect(broker.getQuotesFeed(param, cb)).resolves.toBeDefined()
			jest.runAllTimers()
			expect(cb).not.toHaveBeenCalled()
			AvanzaInst.subscribe = original
		})

		test('stock quotes feed no bid', async () => {
			expect.assertions(2)
			var param = {instrumentType: 'STOCK', instrumentId: 'Stock no bid'}
			var cb = jest.fn()
			await expect(broker.getQuotesFeed(param, cb)).resolves.toBeDefined()
			jest.runAllTimers()
			expect(cb).not.toHaveBeenCalled()
		})

		test('stocks quotes feed no ask', async () => {
			expect.assertions(2)
			var param = {instrumentType: 'STOCK', instrumentId: 'Stock no ask'}
			var cb = jest.fn()
			await expect(broker.getQuotesFeed(param, cb)).resolves.toBeDefined()
			jest.runAllTimers()
			expect(cb).not.toHaveBeenCalled()
		})
		test('stock quotes feed rejects when logged out', async () => {
			expect.assertions(2)
			await broker.disconnect()
			var param = {instrumentType: 'STOCK', instrumentId: '1234'}
			var cb = jest.fn()
			await expect(broker.getQuotesFeed(param, cb)).rejects.toBeDefined()
			jest.runAllTimers()
			expect(cb).not.toHaveBeenCalled()
		})
		test('stock quotes feed rejects if not type STOCK', async () => {
			expect.assertions(2)
			var param = {instrumentType: 'WARRANT', instrumentId: '1234'}
			var cb = jest.fn()
			await expect(broker.getQuotesFeed(param, cb)).rejects.toBeDefined()
			jest.runAllTimers()
			expect(cb).not.toHaveBeenCalled()
		})
	})
	describe('stocks price feed (in the generic price feed function)', ()=>{
		it('gets stocks quotes feed', async () => {
			expect.assertions(3)
			var param = {instrumentType: 'STOCK', instrumentId: 1234}
			var expectedData = {
				orderbookId: '1234',
				buy: {price: 17.07, volume: 20000},
				sell: {price: 17.09, volume: 20000}
			}
			var cb = jest.fn()
			await expect(broker.getPriceFeed(param, cb)).resolves.toBeDefined()
			jest.runAllTimers()
			expect(cb).toHaveBeenCalledTimes(10)
			expect(cb).toHaveBeenCalledWith(expectedData)
		})
		it('mutes stock quotes if data comes after logout', async () => {
			expect.assertions(2)
			const param = {instrumentType: 'STOCK', instrumentId: 1234}
			const cb = jest.fn()
			const original = AvanzaInst.subscribe
			AvanzaInst.subscribe = jest.fn((...params)=>{
				broker.active = false
				original(...params)
			})
			await expect(broker.getPriceFeed(param, cb)).resolves.toBeDefined()
			jest.runAllTimers()
			expect(cb).not.toHaveBeenCalled()
			AvanzaInst.subscribe = original
		})

		test('stock quotes feed no bid', async () => {
			expect.assertions(2)
			var param = {instrumentType: 'STOCK', instrumentId: 'Stock no bid'}
			var cb = jest.fn()
			await expect(broker.getPriceFeed(param, cb)).resolves.toBeDefined()
			jest.runAllTimers()
			expect(cb).not.toHaveBeenCalled()
		})

		test('stocks quotes feed no ask', async () => {
			expect.assertions(2)
			var param = {instrumentType: 'STOCK', instrumentId: 'Stock no ask'}
			var cb = jest.fn()
			await expect(broker.getPriceFeed(param, cb)).resolves.toBeDefined()
			jest.runAllTimers()
			expect(cb).not.toHaveBeenCalled()
		})
		test('stock quotes feed rejects when logged out', async () => {
			expect.assertions(2)
			await broker.disconnect()
			var param = {instrumentType: 'STOCK', instrumentId: '1234'}
			var cb = jest.fn()
			await expect(broker.getPriceFeed(param, cb)).rejects.toBeDefined()
			jest.runAllTimers()
			expect(cb).not.toHaveBeenCalled()
		})
		test('stock quotes feed rejects if invalid instrument type', async () => {
			expect.assertions(2)
			var param = {instrumentType: 'Invalid', instrumentId: '1234'}
			var cb = jest.fn()
			await expect(broker.getPriceFeed(param, cb)).rejects.toBeDefined()
			jest.runAllTimers()
			expect(cb).not.toHaveBeenCalled()
		})
	})
})
