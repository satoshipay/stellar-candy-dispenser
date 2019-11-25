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

#### Auto-start application on boot
In order to make the application start automatically on every boot, we registered a new service called `stellar-candy-dispenser`.

1. Create a new file for the service in the `/etc/init.d/` directory and open it (`sudo nano /etc/init.d/stellar-candy-dispenser`).
2. Use [this](etc/init.d/stellar-candy-dispenser) and replace the `dir` and `PATH` to fit the needs of your local installation.
3. To register your new service call `sudo update-rc.d stellar-candy-dispenser defaults`.
4. Afterwards you can control the service with `sudo service stellar-candy-dispenser start/stop/restart/status`.

## License

MIT
