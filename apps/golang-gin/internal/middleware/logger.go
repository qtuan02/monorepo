package middleware

import (
	"time"

	"github.com/gin-contrib/requestid"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func AccessLog(lg *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		rawQuery := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()
		reqID := requestid.Get(c)

		fields := []zap.Field{
			zap.String("request_id", reqID),
			zap.String("client_ip", c.ClientIP()),
			zap.String("method", c.Request.Method),
			zap.String("path", path),
			zap.String("query", rawQuery),
			zap.Int("status", status),
			zap.Duration("latency", latency),
			zap.Int("bytes_in", int(c.Request.ContentLength)),
			zap.Int("bytes_out", c.Writer.Size()),
			zap.String("user_agent", c.Request.UserAgent()),
		}

		if len(c.Errors) > 0 {
			lg.Error("http_access", append(fields, zap.String("errors", c.Errors.String()))...)
			return
		}

		switch {
		case status >= 500:
			lg.Error("http_access", fields...)
		case status >= 400:
			lg.Warn("http_access", fields...)
		default:
			lg.Info("http_access", fields...)
		}
	}
}
