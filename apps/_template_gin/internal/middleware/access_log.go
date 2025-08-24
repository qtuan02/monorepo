package middleware

import (
	"time"

	"github.com/gin-contrib/requestid"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type AccessLogOptions struct {
	SkipPaths []string
}

func AccessLog(logger *zap.Logger, options AccessLogOptions) gin.HandlerFunc {
	skip := make(map[string]struct{}, len(options.SkipPaths))
	for _, p := range options.SkipPaths {
		skip[p] = struct{}{}
	}

	return func(c *gin.Context) {
		if _, ok := skip[c.FullPath()]; ok {
			c.Next()
			return
		}

		start := time.Now()
		reqID := requestid.Get(c)

		method := c.Request.Method
		path := c.FullPath()
		rawURL := c.Request.URL.String()

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()
		size := c.Writer.Size()

		logger.Info("HTTP request",
			zap.Int("status", status),
			zap.String("method", method),
			zap.String("path", path),
			zap.String("url", rawURL),
			zap.String("query", c.Request.URL.RawQuery),
			zap.String("client_ip", c.ClientIP()),
			zap.Int("size", size),
			zap.Duration("latency", latency),
			zap.String("referer", c.Request.Referer()),
			zap.String("user_agent", c.Request.UserAgent()),
			zap.String("request_id", reqID),
		)
	}
}

func DefaultAccessLogOptions() AccessLogOptions {
	return AccessLogOptions{
		SkipPaths: []string{"/api/health-check"},
	}
}
