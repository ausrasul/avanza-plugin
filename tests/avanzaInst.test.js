const AvanzaInst = require('../lib/avanzaInst')
const A = require('avanza')

test('instantiates avanza', () => {
	expect(AvanzaInst).toBeInstanceOf(A)
})
