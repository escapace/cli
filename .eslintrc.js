module.exports = {
  plugins: ['@typescript-eslint', 'no-null'],
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
    project: './tsconfig.json'
  },
  extends: [
    'escapace'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-unused-vars': 0
  }
}
