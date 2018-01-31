const assert = require('assert')
const {sortById} = require('./Components/AllTransactions.js')

describe('AllTransactions', () => {
  describe('#sortById()', function () {
    it('should return a list of transactions from most recent (highest event Id) to oldest', function() {
      const transactions = [
        {lastEventId: 1},
        {lastEventId: 2},
        {lastEventId: 3}
      ]
      
      const expected_transactions = [
        {lastEventId: 3},
        {lastEventId: 2},
        {lastEventId: 1}
      ]
      assert.deepStrictEqual(sortById(transactions),expected_transactions)
    })
  })
})