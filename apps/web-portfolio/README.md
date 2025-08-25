Portfolio

#Build docker

```
docker build -f apps/web-portfolio/Dockerfile -t web-portfolio:local --build-arg PROJECT=@web/web-portfolio --build-arg APP_DIRNAME=web-portfolio --build-arg NODE_ENV=dockerfile .
```

#Docker run local

```
docker run --rm -p 3000:3000 web-portfolio:local
```
