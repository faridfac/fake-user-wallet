const fetch = require("node-fetch");
const cheerio = require("cheerio");
const crypto = require("crypto");
const uuid = require("uuid");
const { ethers } = require("ethers");
const { Keypair } = require("@solana/web3.js");
const { AptosAccount } = require("aptos");
const { Ed25519Keypair } = require("@mysten/sui.js");
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { stringToPath } = require("@cosmjs/crypto");
const { wordlist } = require("@scure/bip39/wordlists/english");
const bip39 = require("@scure/bip39");
const bs58 = require("bs58");

function createWallet() {
  const wallet = ethers.Wallet.createRandom();

  return {
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase,
    address: wallet.address,
  };
}

function createWalletSol() {
  const walletKeypair = Keypair.generate();
  const secretKey = walletKeypair.secretKey;
  const publicKey = walletKeypair.publicKey;

  return {
    privateKey: bs58.encode(secretKey),
    address: publicKey.toBase58(),
  };
}

function createWalletAptos() {
  const mnemonic = bip39.generateMnemonic(wordlist);
  const derivationPath = `m/44'/637'/0'/0'/0'`;
  const data = AptosAccount.fromDerivePath(derivationPath, mnemonic);

  return {
    mnemonic: mnemonic,
    address: data.accountAddress.hexString,
  };
}

function createWalletSui() {
  const keypair = new Ed25519Keypair();

  return {
    privateKey: Array.from(keypair.keypair.secretKey, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join(""),
    address: keypair.getPublicKey().toSuiAddress().toString(),
  };
}

async function createWalletSei() {
  const mnemonic = await DirectSecp256k1HdWallet.generate(12, {
    prefix: "sei",
    hdPaths: [getHdPath(0)],
  });
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    mnemonic.secret.data,
    {
      prefix: "sei",
      hdPaths: [getHdPath(0)],
    }
  );
  const accounts = await wallet.getAccounts();

  return {
    mnemonic: mnemonic.secret.data,
    address: accounts[0].address,
  };
}

const getHdPath = (accountIndex = 0) =>
  stringToPath(`m/44'/118'/0'/0/${accountIndex}`);

function getPhone() {
  const prefixes = [
    "0811",
    "0812",
    "0813",
    "0821",
    "0822",
    "0823",
    "0851",
    "0852",
    "0853",
    "0815",
    "0816",
    "0855",
    "0856",
    "0857",
    "0858",
    "0817",
    "0818",
    "0819",
    "0859",
    "0877",
    "0878",
    "0831",
    "0832",
    "0833",
    "0838",
  ];

  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNumber = Math.floor(100000000 + Math.random() * 900000000);

  return randomPrefix + randomNumber;
}

async function getUsersData() {
  try {
    const response = await fetch(
      "https://www.fakexy.com/fake-address-generator-id"
    );
    const text = await response.text();

    if (!text.includes("Indonesia address")) {
      throw new Error("Error fetching data");
    }

    const $ = cheerio.load(text);

    const getUserData = (label) => {
      const el = $(`td:contains('${label}')`);
      return el.next().text().trim();
    };

    const name = getUserData("Full Name");
    const split = name.split(" ");
    const firstname = split[0];
    const lastname = split[1];
    const randomNum = Math.floor(Math.random() * (999 - 10 + 1)) + 10;
    const username = `${firstname.toLowerCase()}${randomNum}`;
    const email = `${firstname.toLowerCase()}${lastname.toLowerCase()}${randomNum}@gmail.com`;
    const sha1 = crypto.createHash("sha1").update(username).digest("hex");
    const phone = getPhone();
    const walletETH = createWallet();
    const walletSOL = createWalletSol();
    const walletAPTOS = createWalletAptos();
    const walletSUI = createWalletSui();
    const walletSEI = await createWalletSei();

    const obj = {
      gender: getUserData("Gender"),
      name: {
        first: firstname,
        last: lastname,
      },
      location: {
        street: getUserData("Street"),
        city: getUserData("City"),
        state: getUserData("State"),
        postcode: getUserData("Zip/Postal Code"),
        country: getUserData("Country"),
        latitude: getUserData("Latitude"),
        longitude: getUserData("Longitude"),
      },
      email: email,
      phone: phone,
      dob: getUserData("Birthday"),
      login: {
        uuid: uuid.v4(),
        username: username,
        sha1: sha1,
      },
      wallet: {
        eth: {
          address: walletETH.address,
          privatekey: walletETH.privateKey,
          mnemonic: walletETH.mnemonic,
        },
        sol: {
          address: walletSOL.address,
          privatekey: walletSOL.privateKey,
        },
        aptos: {
          address: walletAPTOS.address,
          mnemonic: walletAPTOS.mnemonic,
        },
        sui: {
          address: walletSUI.address,
          privatekey: walletSUI.privateKey,
        },
        sei: {
          address: walletSEI.address,
          mnemonic: walletSEI.mnemonic,
        },
      },
    };

    return obj;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getUsersData,
};
