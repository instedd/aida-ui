# Aida UI

## Development environment

* Install Docker

* First time / havoc environment

```
$ docker-compose run --rm app ./bin/rails db:drop # havoc environment
$ docker-compose run --rm app ./bin/setup
$ docker-compose run --rm app ./bin/yarn
$ docker-compose run --rm backend mix ecto.drop # drop backend database
$ docker-compose run --rm backend mix ecto.setup
```

* Start database & webserver:

```
$ docker-compose up
```

* Run flow

```
$ docker-compose run --rm app ./bin/yarn flow
```

* Expand type schema type

The file `./app/schemas/types.json` contains type schema declaration
that are translated and available at `./app/javascript/utils/types-generated-decl.jsx`
by the following command.

```
$ docker-compose run --rm app ./bin/yarn expand-schema
```

Open [http://localhost:3000](http://localhost:3000).
