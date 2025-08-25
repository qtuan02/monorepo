Template

#Build docker

```
docker build -f apps/_web-template/Dockerfile -t _template:local --build-arg PROJECT=@web/_web-template --build-arg APP_DIRNAME=_web-template --build-arg NODE_ENV=dockerfile .
```

#Docker run local

```
docker run --rm -p 3000:3000 _web-template:local
```
