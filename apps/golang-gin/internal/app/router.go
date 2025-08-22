package app

import (
	"golang-gin/internal/middleware"
	"golang-gin/internal/pkg/response"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func HealthCheck(c *gin.Context) {
	data := gin.H{
		"status":      "healthy",
		"timestamp":   time.Now().UTC().Format(time.RFC3339),
		"version":     uuid.New().String(),
		"environment": env.GO_ENVIRONMENT,
		"uptime":      time.Since(time.Now()).Seconds(),
		"message":     "API is running",
	}
	response.SendResponse(c, 200, true, "Health Check", data, nil)
}

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	public := api.Group("")
	public.GET("/health-check", HealthCheck)

	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	protected.GET("/hello-world", func(c *gin.Context) {
		response.SendResponse(c, 200, true, "Hello, World!", nil, nil)
	})
}
