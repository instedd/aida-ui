# AIDA UI

This repository contains the ui for the [AIDA engine](https://github.com/instedd/aida).

## Development environment

* Install Docker

* Setup guisso

Some features requires the app to be registered in https://login.instedd.org .
During development, you can register the app at either https://login.instedd.org or https://login-stg.instedd.org
and create a `config/settings.local.yml` as follows to setup the SSO account.

```
# config/settings.local.yml
guisso:
  enabled: true
  url: https://login.instedd.org   (or https://login-stg.instedd.org)
  client_id: ...your guisso client id...
  client_secret: ...your guisso client secret...
```

If you skip this step you will be able to use the app but access to the api via bearer tokens will not work.

* First time

```
$ docker-compose run --rm ui ./bin/setup
$ docker-compose run --rm ui ./bin/yarn
$ docker-compose run --rm backend mix ecto.setup
$ docker-compose up
```

Open [http://localhost:3000](http://localhost:3000).

* Upgrade

```
$ docker-compose pull
$ docker-compose restart
```

* Destroy

```
$ docker-compose run --rm ui ./bin/rails db:drop
$ docker-compose run --rm backend mix ecto.drop
```

Or

```
$ docker-compose down -v
```

### Tools for development

* Run specs

```
$ docker-compose run --rm ui rspec
```

* Run flow

```
$ docker-compose run --rm ui ./bin/yarn flow
```

* Expand type schema type

The file `./app/schemas/types.json` contains type schema declaration
that are translated and available at `./app/javascript/utils/types-generated-decl.jsx`
by the following command.

```
$ docker-compose run --rm ui ./bin/yarn expand-schema
```

* on script to run them all: pre_commit.sh

To run all that before making a commit, you can run

```
$ ./pre_commit.sh
```

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
$ docker build -t instedd/aida-ui:dev .
```
