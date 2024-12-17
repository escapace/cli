/* eslint-disable typescript/no-unsafe-member-access */
import { assert, describe, it } from 'vitest'
import { createCompose } from './exports/node-test'
import { testFixture, TypeFixture } from './test-fixture'

describe('compose', () => {
  it('omakase', async () => {
    const { kitchen, spy } = testFixture()

    const { compose } = createCompose()

    await compose(kitchen)({
      argv: ['omakase', 'an argument', 'second argument'],
    })

    assert.equal(spy.mock.calls.length, 0)
  })

  it('takoeut', async () => {
    const { kitchen, spy } = testFixture()

    const { compose } = createCompose()

    await compose(kitchen)({
      argv: ['takeout', '-s', 'seafood', 'brunch', '--grilled-vegetables', 'elote'],
    })

    assert.equal(spy.mock.calls.length, 3)

    assert.equal(spy.mock.calls[0].length, 2)
    assert.equal(spy.mock.calls[0][1].model.state.reference, TypeFixture.BRUNCH)

    assert.deepEqual(spy.mock.calls[0][0], {
      [TypeFixture.GRILLED_VEGETABLES]: 'elote',
      [TypeFixture.SALAD]: 'seafood',
    })

    assert.equal(spy.mock.calls[1].length, 2)

    assert.equal(spy.mock.calls[1][1].model.state.reference, TypeFixture.TAKEOUT)

    assert.deepEqual(spy.mock.calls[1][0], {
      reference: TypeFixture.BRUNCH,
      value: {
        [TypeFixture.GRILLED_VEGETABLES]: 'elote',
        [TypeFixture.SALAD]: 'seafood',
      },
    })

    assert.equal(spy.mock.calls[2].length, 2)

    assert.equal(spy.mock.calls[2][1].model.state.reference, TypeFixture.KITCHEN)

    assert.deepEqual(spy.mock.calls[2][0], {
      reference: TypeFixture.TAKEOUT,
      value: {
        reference: TypeFixture.BRUNCH,
        value: {
          [TypeFixture.GRILLED_VEGETABLES]: 'elote',
          [TypeFixture.SALAD]: 'seafood',
        },
      },
    })
  })
})
