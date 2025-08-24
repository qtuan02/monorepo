package logger

import (
	"os"

	"golang-gin/internal/config"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

func InitLogger(config *config.Config) *zap.Logger {
	fileWriter := zapcore.AddSync(&lumberjack.Logger{
		Filename:   config.GO_LOGGER_FILENAME,
		MaxSize:    config.GO_LOGGER_MAXSIZEMB,
		MaxBackups: config.GO_LOGGER_MAXBACKUPS,
		MaxAge:     config.GO_LOGGER_MAXAGEDAYS,
		Compress:   true,
	})

	consoleWriter := zapcore.AddSync(os.Stdout)

	encoderCfg := zap.NewProductionEncoderConfig()
	encoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderCfg.EncodeLevel = zapcore.CapitalColorLevelEncoder

	fileCore := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderCfg),
		fileWriter,
		zap.InfoLevel,
	)

	consoleCore := zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoderCfg),
		consoleWriter,
		zap.DebugLevel,
	)

	core := zapcore.NewTee(fileCore, consoleCore)

	logger := zap.New(core, zap.AddCaller(), zap.AddCallerSkip(1))

	return logger
}
