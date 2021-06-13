# eslint-plugin-cake

misc rules for eslint

## Why?

Originally to have a forked version of
[`eslint-plugin-react`](https://github.com/yannickcr/eslint-plugin-react)'s
`jsx-no-useless-fragment` that is
[safe](https://github.com/yannickcr/eslint-plugin-react/pull/2967). Now this
repo is a collection of miscellaneous lints I couldn't find elsewhere.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```shell
yarn add --dev eslint
# or
npm install eslint --save-dev
```

Next, install `eslint-plugin-cake`:

```shell
yarn add --dev eslint-plugin-cake
# or
npm install eslint-plugin-cake --save-dev
```

## Usage

Add `cake` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["cake"]
}
```

## Supported Rules

[see docs](./docs/rules)

## Dev

```shell
yarn install

s/lint
s/test

# release new version
s/build

# optional, if you want to test locally:
yarn pack

yarn publish
```
