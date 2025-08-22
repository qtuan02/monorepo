package app

import (
	"golang-gin/internal/middleware"
	"golang-gin/internal/pkg/logger"

	"github.com/gin-contrib/requestid"
	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
)

func RegisterLogger(r *gin.Engine) {
	log, _ := logger.Init(logger.Config{
		Env:        env.GO_ENVIRONMENT,
		Filename:   env.GO_LOGGER_FILENAME,
		MaxSizeMB:  env.GO_LOGGER_MAXSIZEMB,
		MaxBackups: env.GO_LOGGER_MAXBACKUPS,
		MaxAgeDays: env.GO_LOGGER_MAXAGEDAYS,
		Compress:   true,
	})

	defer log.Sync()

	r.Use(requestid.New())
	r.Use(ginzap.RecoveryWithZap(log, true))
	r.Use(middleware.AccessLog(log))
}
