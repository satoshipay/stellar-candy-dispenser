# The Stellar-Powered Candy Dispenser

## Set up

```
git clone git@github.com:satoshipay/stellar-candy-dispenser.git
npm install
```

Use with node 8, please. The `rpi-ws281x-v2` package that controls the LEDs doesn't build on latest node versions.

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

## Configuration

Create a `.env` file in the project directory.

```
ACCOUNT_PUBLIC_KEY_1=G…
ACCOUNT_PUBLIC_KEY_2=G…

TEST_ACCOUNT_PUBLIC_KEY_1=G…
TEST_ACCOUNT_PUBLIC_KEY_2=G…

# Motor config format: <speed>:<duration><alternations>

MOTOR_CONFIG_LEFT=30:2s:1       # This motor config is good for M&Ms
MOTOR_CONFIG_RIGHT=40:4.5s:3    # Pistacios

PRICE_LEFT=5
PRICE_RIGHT=5
```

## Auto-start application on boot

In order to make the application start automatically on every boot, we registered a new service called `stellar-candy-dispenser`.

1. Create a new file for the service in the `/etc/init.d/` directory and open it (`sudo nano /etc/init.d/stellar-candy-dispenser`).
2. Use [this](etc/init.d/stellar-candy-dispenser) and replace the `dir` and `PATH` to fit the needs of your local installation.
3. To register your new service call `sudo update-rc.d stellar-candy-dispenser defaults`.
4. Afterwards you can control the service with `sudo service stellar-candy-dispenser start/stop/restart/status`.

## Gotchas

#### Permission errors on `npm install`

Try `npm install --unsafe-perm`.

#### Runtime `pigpio` errors

If you run into errors like ` Can't lock /var/run/pigpio.pid` and `Error: pigpio error -1 in gpioInitialise;` while trying to start the application, make sure that the application is not currently running in background because of the service (as only one instance can run at a time because of the access to `pigpio`).

Stop the service with `sudo service stellar-candy-dispenser stop` and check in the service status (`sudo service stellar-candy-dispenser status`) that no other processes are listed in `CGroup`. If processes are still running after you stopped the service you can kill them manually with `kill 'pid'`.


## License

MIT
