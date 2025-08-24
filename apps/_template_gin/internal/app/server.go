package app

import (
	"context"
	"golang-gin/internal/config"
	"golang-gin/internal/db"
	"golang-gin/internal/middleware"
	"golang-gin/internal/pkg/logger"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/requestid"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func Run() {
	cfg := config.LoadConfig()
	log := logger.InitLogger(cfg)

	switch cfg.GO_ENVIRONMENT {
	case "production":
		gin.SetMode(gin.ReleaseMode)
	default:
		gin.SetMode(gin.DebugMode)
	}

	r := gin.New()
	r.RedirectTrailingSlash = true

	r.Use(requestid.New())
	r.Use(middleware.Recover(log, middleware.DefaultRecoverOptions(cfg)))
	r.Use(middleware.AccessLog(log, middleware.DefaultAccessLogOptions()))

	mongo := db.InitMongo(cfg, log)

	RegisterRoutes(r, cfg, mongo)

	_ = r.SetTrustedProxies(nil)
	log.Info("enviroment starting: " + cfg.GO_ENVIRONMENT)
	log.Info("server starting: http://localhost:" + cfg.APP_PORT)

	srv := &http.Server{
		Addr:    ":" + cfg.APP_PORT,
		Handler: r,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("server stopped unexpectedly", zap.Error(err))
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	log.Info("shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Error("http shutdown error", zap.Error(err))
	}

	if err := mongo.Disconnect(ctx); err != nil {
		log.Error("mongo disconnect error", zap.Error(err))
	}

	log.Info("server stopped gracefully")
}
