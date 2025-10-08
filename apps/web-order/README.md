Order

#Build docker

```
docker build -f apps/web-order/Dockerfile -t web-order:local --build-arg PROJECT=@web/web-order --build-arg APP_DIRNAME=web-order --build-arg NODE_ENV=dockerfile .
```

#Docker run local

```
docker run --rm -p 3000:3000 web-order:local
```
