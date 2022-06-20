const AvanzaInst = require('../src/avanzaInst')
//jest.mock('../src/avanza')
const A = require('avanza')

test('instantiates avanza', () => {
	expect(AvanzaInst).toBeInstanceOf(A)
})
