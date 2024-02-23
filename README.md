## Description

This npm package to generate fake user data along with wallet creation for various blockchain networks.

## Installation

You can install this package via npm:

```
npm install fake-user-wallet
```

## Usage

```
const { getUsersData } = require('fake-user-wallet');

(async () => {
  try {
    const userData = await getUsersData();
    console.log(userData);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```
