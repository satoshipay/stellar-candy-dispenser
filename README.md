# The Stellar-Powered Candy Dispenser

## Set up

```
git clone git@github.com:satoshipay/stellar-candy-dispenser.git
npm install
```

## Deploy

In our case we just launched an SSH server on the Raspberry and added our `~/.ssh/id_rsa.pub` to the Raspberry user's `~/.ssh/authorized_keys`.

Deployment is then just a simple `scp` command to copy the files. Not super elegant, but straight forward.

```
scp -r *.js package* src/ pi@10.1.21.126:/path/to/deployment/
```

## Run

Run the program in watch mode and on testnet:

```
sudo npm run dev
```

Run the program in production and on mainnet:

```
sudo npm start
```

## Gotchas

#### Permission errors on `npm install`

Try `npm install --unsafe-perm`.

## License

MIT
