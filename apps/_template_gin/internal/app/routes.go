package app

import (
	"golang-gin/internal/config"
	"golang-gin/internal/db"
	"golang-gin/internal/domain/user"
	"golang-gin/internal/middleware"
	"golang-gin/internal/pkg/response"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func HealthCheck(c *gin.Context, cfg *config.Config) {
	data := gin.H{
		"status":      "healthy",
		"timestamp":   time.Now().UTC().Format(time.RFC3339),
		"version":     uuid.New().String(),
		"environment": cfg.GO_ENVIRONMENT,
		"uptime":      time.Since(time.Now()).Seconds(),
		"message":     "API is running",
	}
	response.SendResponse(c, 200, true, "Health Check", data, nil)
}

func RegisterRoutes(r *gin.Engine, cfg *config.Config, mongo *db.Mongo) {
	api := r.Group("/api")

	public := api.Group("")
	public.GET("/health-check", func(c *gin.Context) {
		HealthCheck(c, cfg)
	})

	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())

	userGroup := protected.Group("/user")
	{
		userGroup.GET("", user.Factory(mongo).FindAll)
	}
}
