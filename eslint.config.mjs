// @ts-check

import { escapace, compose } from 'eslint-config-escapace'

export default compose(escapace(), {
  rules: {
    'typescript/no-empty-object-type': 'off',
    'typescript/no-explicit-any': 'off',
  },
})
