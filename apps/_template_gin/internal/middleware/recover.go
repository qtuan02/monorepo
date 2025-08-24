package middleware

import (
	"golang-gin/internal/config"
	"net/http"
	"runtime/debug"
	"strings"
	"time"

	"github.com/gin-contrib/requestid"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type RecoverOptions struct {
	Env              string
	IncludeStackProd bool
}

func Recover(log *zap.Logger, opts RecoverOptions) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				reqID := requestid.Get(c)
				fields := []zap.Field{
					zap.Any("panic", r),
					zap.String("request_id", reqID),
					zap.String("method", c.Request.Method),
					zap.String("path", c.FullPath()),
					zap.String("url", c.Request.URL.String()),
					zap.String("client_ip", c.ClientIP()),
					zap.String("user_agent", c.Request.UserAgent()),
					zap.Time("time", time.Now()),
				}

				if opts.Env != "production" || opts.IncludeStackProd {
					stack := strings.TrimSpace(string(debug.Stack()))
					fields = append(fields, zap.String("stack", stack))
				}

				log.Error("panic recovered", fields...)

				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "internal server error",
					"error":   nil,
				})
			}
		}()
		c.Next()
	}
}

func DefaultRecoverOptions(cfg *config.Config) RecoverOptions {
	return RecoverOptions{
		Env:              cfg.GO_ENVIRONMENT,
		IncludeStackProd: true,
	}
}
