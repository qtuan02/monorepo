Template

#Build docker

```
docker build -f apps/_template/Dockerfile -t _template:local --build-arg PROJECT=@monorepo/_template --build-arg APP_DIRNAME=_template --build-arg NODE_ENV=dockerfile .
```

#Docker run local

```
docker run --rm -p 3000:3000 _template:local
```
