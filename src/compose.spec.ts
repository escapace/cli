/* eslint-disable @typescript-eslint/no-floating-promises */
import { assert } from 'chai'
import { compose } from './compose'
import { testFixture, TypeFixture } from './test-fixture'

describe('..,', () => {
  it('omakase', async () => {
    const { kitchen, spy } = testFixture()

    await compose(kitchen)({
      argv: ['omakase', 'an argument', 'second argument']
    })

    assert.equal(spy.callCount, 2)

    assert.equal(spy.firstCall.args.length, 2)
    // assert.equal(spy.firstCall.args[1].model.state.reference, TypeFixture.)

    assert.deepEqual(spy.firstCall.args[0], {
      _: ['an argument', 'second argument']
    })

    assert.deepEqual(spy.secondCall.args[0], {
      reference: TypeFixture.OMAKASE,
      value: {
        _: ['an argument', 'second argument']
      }
    })
  })

  // it('takeout with no options', async () => {
  //   const { kitchen, spy } = setup()
  //
  //   await compose(kitchen)({
  //     argv: []
  //   })
  //
  //   assert.equal(spy.callCount, 0)
  // })

  it('takoeut', async () => {
    const { kitchen, spy } = testFixture()

    await compose(kitchen)({
      argv: [
        'takeout',
        '-s',
        'seafood',
        'brunch',
        '--grilled-vegetables',
        'elote',
        'an argument',
        'second argument'
      ]
    })

    assert.equal(spy.callCount, 3)

    assert.equal(spy.firstCall.args.length, 2)
    assert.equal(
      spy.firstCall.args[1].model.state.reference,
      TypeFixture.BRUNCH
    )

    assert.deepEqual(spy.firstCall.args[0], {
      _: ['an argument', 'second argument'],
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
        _: ['an argument', 'second argument'],
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
          _: ['an argument', 'second argument'],
          [TypeFixture.SALAD]: 'seafood',
          [TypeFixture.GRILLED_VEGETABLES]: 'elote'
        }
      }
    })
  })
})
