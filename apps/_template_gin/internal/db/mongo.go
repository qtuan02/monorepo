package db

import (
	"context"
	"time"

	"golang-gin/internal/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"go.uber.org/zap"
)

type Mongo struct {
	Client *mongo.Client
	DB     *mongo.Database
}

func (m *Mongo) Disconnect(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	return m.Client.Disconnect(ctx)
}

func InitMongo(cfg *config.Config, log *zap.Logger) *Mongo {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().
		ApplyURI(cfg.MONGO_URI).
		SetRetryWrites(true).
		SetServerSelectionTimeout(5 * time.Second).
		SetMaxPoolSize(50).
		SetMinPoolSize(5)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("mongo connect failed", zap.Error(err))
	}

	if err = client.Ping(ctx, readpref.Primary()); err != nil {
		log.Fatal("mongo ping failed", zap.Error(err))
	}

	db := client.Database(cfg.MONGO_DB)
	log.Info("mongo connected")

	return &Mongo{Client: client, DB: db}
}

func (m *Mongo) Collection(name string) *mongo.Collection {
	return m.DB.Collection(name)
}
