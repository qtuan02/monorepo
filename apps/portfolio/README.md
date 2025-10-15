Portfolio

#Build docker

```
docker build -f apps/portfolio/Dockerfile -t portfolio:local --build-arg PROJECT=@monorepo/portfolio --build-arg APP_DIRNAME=portfolio --build-arg NODE_ENV=dockerfile .
```

#Docker run local

```
docker run --rm -p 3000:3000 portfolio:local
```
