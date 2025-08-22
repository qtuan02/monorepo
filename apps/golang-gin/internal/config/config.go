package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	APP_PORT             string
	GO_ENVIRONMENT       string
	GO_LOGGER_FILENAME   string
	GO_LOGGER_MAXSIZEMB  int
	GO_LOGGER_MAXBACKUPS int
	GO_LOGGER_MAXAGEDAYS int
}

func LoadConfig() *Config {
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	return &Config{
		APP_PORT:             getEnv("APP_PORT", "5000"),
		GO_ENVIRONMENT:       getEnv("GO_ENVIRONMENT", "development"),
		GO_LOGGER_FILENAME:   getEnv("GO_LOGGER_FILENAME", "logs/app.log"),
		GO_LOGGER_MAXSIZEMB:  getEnvInt("GO_LOGGER_MAXSIZEMB", 50),
		GO_LOGGER_MAXBACKUPS: getEnvInt("GO_LOGGER_MAXBACKUPS", 7),
		GO_LOGGER_MAXAGEDAYS: getEnvInt("GO_LOGGER_MAXAGEDAYS", 14),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return fallback
}
