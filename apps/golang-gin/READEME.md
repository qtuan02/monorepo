# Libs used

```
go get github.com/gin-gonic/gin
go get github.com/joho/godotenv
go get github.com/google/uuid
go get go.uber.org/zap
go get github.com/gin-contrib/zap
go get gopkg.in/natefinch/lumberjack.v2
go get go.mongodb.org/mongo-driver/mongo
```

# Structure

```
golang-gin/
├─ cmd/
│  └─ api/
│     └─ main.go            # entrypoint, khởi động app + DI (config, db, repo, service, handler)
├─ internal/
│  ├─ app/                  # gom handler, map route
│  │  ├─ server.go          # khởi tạo & chạy Gin server
│  │  └─ router.go          # định nghĩa route, nhóm API theo module
│  ├─ config/
│  │  └─ config.go          # load config từ .env (viper) → struct Config
│  ├─ db/
│  │  ├─ pg.go              # kết nối PostgreSQL (pgxpool)
│  │  └─ migrate/           # file SQL tạo bảng (users, wallets, transactions...)
│  ├─ middleware/           # middleware cho Gin
│  │  ├─ auth.go            # xác thực JWT
│  │  ├─ logger.go          # log request
│  │  └─ request_id.go      # gắn X-Request-ID
│  ├─ domain/               # mỗi nghiệp vụ: model, repo, service, handler (DDD style)
│  │  └─ user/
│  │     ├─ model.go        # entity
│  │     ├─ repo.go         # repository
│  │     ├─ service.go      # business logic
│  │     └─ handler.go      # http request handler
│  ├─ pkg/                  # tiện ích dùng chung
│  │  ├─ response/          # chuẩn hóa response JSON
│  │  ├─ password/          # hash/check password
│  │  ├─ jwt/               # sign/verify JWT
│  │  └─ logger/            # zap logger
│  └─ shared/               # struct + error chung
│     ├─ dto/               # request/response struct
│     └─ errors/            # error chuẩn (ErrNotFound, ErrInvalidInput)
├─ .air.toml                # config air (hot reload)
├─ go.mod                   # dependency
├─ docker-compose.yml       # Postgres, Redis... phục vụ dev
├─ Makefile                 # shortcut lệnh: run, migrate, tidy
└─ README.md
```
