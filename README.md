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


## Production environment

The `docker-compose.production.yml` file describes a stack to use the published
docker images in a production environment.

The `ui` and `backend` containers needs to share the public domain.
All `<domain>/callback` routes are redirected to `backend` and all the others to `ui`.
Adapt the `proxy` container depending on your hosting while leaving the above described behaviour.

* First time

```
$ docker-compose -f docker-compose.production.yml up -d db
$ docker-compose -f docker-compose.production.yml run --rm ui rails db:create db:schema:load
$ docker-compose -f docker-compose.production.yml run --rm backend mix ecto.create
$ docker-compose -f docker-compose.production.yml up
```

Open [http://localhost:3000](http://localhost:3000).

* Upgrade

```
$ docker-compose -f docker-compose.production.yml pull
$ docker-compose -f docker-compose.production.yml run --rm ui rails db:migrate
$ docker-compose -f docker-compose.production.yml restart
```

* Destroy

```
$ docker-compose -f docker-compose.production.yml down -v
```

* Local build

```
$ docker build -t aida-ui:dev .
```
