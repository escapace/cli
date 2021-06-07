/* eslint-disable @typescript-eslint/no-floating-promises */
import { assert } from 'chai'
import { compose } from './compose/compose'
import { testFixture, TypeFixture } from './test-fixture'

describe('..,', () => {
  it('omakase', async () => {
    const { kitchen, spy } = testFixture()

    await compose(kitchen)({
      argv: ['omakase', 'an argument', 'second argument']
    })

    assert.equal(spy.callCount, 0)
  })

  it('takoeut', async () => {
    const { kitchen, spy } = testFixture()

    await compose(kitchen)({
      argv: [
        'takeout',
        '-s',
        'seafood',
        'brunch',
        '--grilled-vegetables',
        'elote'
      ]
    })

    assert.equal(spy.callCount, 3)

    assert.equal(spy.firstCall.args.length, 2)

    assert.equal(
      spy.firstCall.args[1].model.state.reference,
      TypeFixture.BRUNCH
    )

    assert.deepEqual(spy.firstCall.args[0], {
      [TypeFixture.SALAD]: 'seafood',
      [TypeFixture.GRILLED_VEGETABLES]: 'elote'
    })

    assert.equal(spy.secondCall.args.length, 2)

    assert.equal(
      spy.secondCall.args[1].model.state.reference,
      TypeFixture.TAKEOUT
    )

    assert.deepEqual(spy.secondCall.args[0], {
      reference: TypeFixture.BRUNCH,
      value: {
        [TypeFixture.SALAD]: 'seafood',
        [TypeFixture.GRILLED_VEGETABLES]: 'elote'
      }
    })

    assert.equal(spy.thirdCall.args.length, 2)

    assert.equal(
      spy.thirdCall.args[1].model.state.reference,
      TypeFixture.KITCHEN
    )

    assert.deepEqual(spy.thirdCall.args[0], {
      reference: TypeFixture.TAKEOUT,
      value: {
        reference: TypeFixture.BRUNCH,
        value: {
          [TypeFixture.SALAD]: 'seafood',
          [TypeFixture.GRILLED_VEGETABLES]: 'elote'
        }
      }
    })
  })
})
