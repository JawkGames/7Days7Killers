import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    files:['src/**/*.js','testler/**/*.js'],
    languageOptions:{ecmaVersion:2023,sourceType:'module',globals:{...globals.browser}},
    rules:{...js.configs.recommended.rules,'no-unused-vars':['error',{args:'none'}]}
  }
];
