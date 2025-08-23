package db

import (
	"context"
	"fmt"
	"golang-gin/internal/config"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

type Mongo struct {
	Client *mongo.Client
	DB     *mongo.Database
}

type MongoConfig struct {
	URI         string
	DBName      string
	ConnTimeout time.Duration
	MaxPoolSize uint64
	MinPoolSize uint64
}

func ConnectMongo(cfg MongoConfig) (*Mongo, error) {
	if cfg.ConnTimeout == 0 {
		cfg.ConnTimeout = 10 * time.Second
	}

	ctx, cancel := context.WithTimeout(context.Background(), cfg.ConnTimeout)
	defer cancel()

	clientOpts := options.Client().
		ApplyURI(cfg.URI).
		SetMaxPoolSize(cfg.MaxPoolSize).
		SetMinPoolSize(cfg.MinPoolSize)

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		return nil, fmt.Errorf("mongo connect: %w", err)
	}
	if err := client.Ping(ctx, nil); err != nil {
		return nil, fmt.Errorf("mongo ping: %w", err)
	}

	return &Mongo{
		Client: client,
		DB:     client.Database(cfg.DBName),
	}, nil
}

func RegisterMongo(r *gin.Engine, env *config.Config, log *zap.Logger) *Mongo {
	mgo, err := ConnectMongo(MongoConfig{
		URI:         env.MONGO_URI,
		DBName:      env.MONGO_DB,
		ConnTimeout: 10 * time.Second,
		MaxPoolSize: 20,
	})
	if err != nil {
		log.Fatal("connect mongo failed", zap.Error(err))
	}

	log.Info("connect mongo success")

	r.Use(func(c *gin.Context) {
		c.Set(env.MONGO_KEY, mgo.DB)
		c.Next()
	})

	return mgo
}

func (m *Mongo) Disconnect(ctx context.Context) error {
	if m == nil || m.Client == nil {
		return nil
	}
	return m.Client.Disconnect(ctx)
}
