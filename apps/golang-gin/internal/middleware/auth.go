package middleware

import (
	"golang-gin/internal/pkg/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token_access := c.GetHeader("Authorization")
		if token_access == "" {
			response.SendResponse(c, http.StatusUnauthorized, false, "Unauthorized", nil, nil)
			c.Abort()
			return
		}
		c.Next()
	}
}
