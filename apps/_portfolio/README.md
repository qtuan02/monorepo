\_Portfolio

#Build docker

```
docker build -f apps/_portfolio/Dockerfile -t _portfolio:local --build-arg PROJECT=@monorepo/_portfolio --build-arg APP_DIRNAME=_portfolio --build-arg NODE_ENV=dockerfile .
```

#Docker run local

```
docker run --rm -p 3000:3000 _portfolio:local
```
