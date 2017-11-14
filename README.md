# Aida UI

## Development environment

* Install Docker

* First time / havoc environment

```
$ docker-compose run --rm app ./bin/rails db:drop # havoc environment
$ docker-compose run --rm app ./bin/setup
$ docker-compose run --rm app ./bin/yarn
```

* Start database & webserver:

```
$ docker-compose up
```

Open [http://localhost:3000](http://localhost:3000).
