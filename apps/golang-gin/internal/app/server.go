package app

import (
	"golang-gin/internal/config"
	"golang-gin/internal/pkg/logger"
	"os"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var (
	env = config.LoadConfig()
	log = logger.L()
)

func Run() {
	r := gin.New()

	r.RedirectTrailingSlash = true

	RegisterLogger(r)
	RegisterRoutes(r)

	if err := r.SetTrustedProxies(nil); err != nil {
		log.Error("set trusted proxies failed", zap.Error(err))
		os.Exit(1)
	}

	addr := ":" + env.APP_PORT
	log.Info("starting http server", zap.String("addr", addr))
	log.Info("starting environment", zap.String("env", env.GO_ENVIRONMENT))

	if err := r.Run(addr); err != nil {
		log.Error("http server stopped", zap.Error(err))
		os.Exit(1)
	}
}
