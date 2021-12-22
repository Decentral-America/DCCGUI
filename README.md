# Decentral.Exchange 

[**Website**](https://decentralchain.io/) | [**Support**](https://decentralchain.io/soporte/) | [**Documentation**](https://docs.decentralchain.cio)

[![Waves App Promo](https://blockchaincostarica.org/wp-content/uploads/2021/10/WhatsApp-Image-2021-08-31-at-12.03.41-PM.jpeg)](https://decentral.exchange)

Decentral.Exchange is the official wallet software designed with mass adoption in mind. It allows to access your DCC account, handle financial operations, issue tokens, and trade on DEX.

## Installation and usage

The web version is available at [https://decentral.exchange](https://decentral.exchange) and needs no installation.


## For developers

You will need Node.js 10.7.0 (or higher) and npm v5 (or higher).

```
npm i
npm run server
```

The server will be launched at [https://localhost:8080](https://localhost:8080).

## Blockchain for the people

Keep up with the latest news and articles, and find out all about events happening on [DecentralChain](https://decentralchain.io/).


* [DecentralChain Docs](https://docs.decentralchain.io/)
* [DecentralChain Blog](https://decentralchain.io/blog/)
* [Support](https://decentralchain.io/soporte/)

##




## build container

docker build --build-arg web_environment=mainnet -t blockchaincostarica/wallet:0.0.13 . && docker push blockchaincostarica/wallet:0.0.13


docker run -p 80:80 -it blockchaincostarica/wallet:0.0.5

