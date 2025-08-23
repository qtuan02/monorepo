package logger

import (
	"golang-gin/internal/config"
	"golang-gin/internal/middleware"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-contrib/requestid"
	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var (
	log *zap.Logger
)

type Config struct {
	Env        string
	Filename   string
	MaxSizeMB  int
	MaxBackups int
	MaxAgeDays int
	Compress   bool
}

func Init(cfg Config) (*zap.Logger, error) {
	if cfg.Filename == "" {
		cfg.Filename = "./logs/app.log"
	}
	_ = os.MkdirAll(filepath.Dir(cfg.Filename), 0o755)

	encCfg := zapcore.EncoderConfig{
		TimeKey: "ts", LevelKey: "level", NameKey: "logger",
		CallerKey: "caller", MessageKey: "msg", StacktraceKey: "stack",
		LineEnding:   zapcore.DefaultLineEnding,
		EncodeLevel:  zapcore.LowercaseLevelEncoder,
		EncodeTime:   zapcore.TimeEncoderOfLayout(time.RFC3339Nano),
		EncodeCaller: zapcore.ShortCallerEncoder,
	}

	jsonEnc := zapcore.NewJSONEncoder(encCfg)
	consoleEnc := zapcore.NewConsoleEncoder(encCfg)

	fileWriter := zapcore.AddSync(&lumberjack.Logger{
		Filename: cfg.Filename, MaxSize: cfg.MaxSizeMB,
		MaxBackups: cfg.MaxBackups, MaxAge: cfg.MaxAgeDays, Compress: cfg.Compress,
	})
	consoleWriter := zapcore.AddSync(os.Stdout)

	lvl := zap.NewAtomicLevel()
	if cfg.Env == "development" {
		lvl.SetLevel(zap.DebugLevel)
	} else {
		lvl.SetLevel(zap.InfoLevel)
	}

	core := zapcore.NewTee(
		zapcore.NewCore(consoleEnc, consoleWriter, lvl),
		zapcore.NewCore(jsonEnc, fileWriter, lvl),
	)

	opts := []zap.Option{
		zap.AddCaller(),
		zap.AddStacktrace(zapcore.ErrorLevel),
		zap.WrapCore(func(c zapcore.Core) zapcore.Core {
			return zapcore.NewSampler(c, time.Second, 100, 100)
		}),
	}
	if cfg.Env == "development" {
		opts = append(opts, zap.Development())
	}

	logger := zap.New(core, opts...)
	log = logger
	return logger, nil
}

func RegisterLogger(r *gin.Engine, env *config.Config) {
	log, _ := Init(Config{
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

	log.Info("logger initialized")
}

func L() *zap.Logger {
	if log == nil {
		l, _ := zap.NewDevelopment()
		return l
	}
	return log
}

func (c Config) UsernameSafeFilename() string {
	if c.Filename == "" {
		return "./logs/app.log"
	}
	return c.Filename
}
