package user

import (
	"context"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Pagination struct {
	Search   string
	Page     int64
	PageSize int64
}

type UserRepository interface {
	FindAll(ctx context.Context, p *Pagination) ([]*User, error)
	Create(ctx context.Context, u *User) error
	Update(ctx context.Context, u *User) error
	Delete(ctx context.Context, id string) error
	FindByID(ctx context.Context, id string) (*User, error)
}

type MongoRepository struct {
	collection *mongo.Collection
}

func NewMongoRepository(col *mongo.Collection) *MongoRepository {
	return &MongoRepository{collection: col}
}

func parseOID(id string) (primitive.ObjectID, error) {
	return primitive.ObjectIDFromHex(id)
}

func NewUserRepository(col *mongo.Collection) UserRepository {
	return &MongoRepository{collection: col}
}

func (r *MongoRepository) FindAll(ctx context.Context, p *Pagination) ([]*User, error) {
	filter := bson.M{}
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetProjection(bson.M{"password": 0})

	if p != nil {
		if s := strings.TrimSpace(p.Search); s != "" {
			filter["email"] = bson.M{"$regex": s, "$options": "i"}
		}
		if p.Page > 0 {
			pageSize := int64(10)
			if p.PageSize > 0 {
				pageSize = p.PageSize
			}
			opts.SetSkip((p.Page - 1) * pageSize)
			opts.SetLimit(pageSize)
		}
	}

	cur, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return []*User{}, err
	}
	defer cur.Close(ctx)

	users := make([]*User, 0)
	if err := cur.All(ctx, &users); err != nil {
		return []*User{}, err
	}
	return users, nil
}

func (r *MongoRepository) Create(ctx context.Context, u *User) error {
	_, err := r.collection.InsertOne(ctx, u)
	return err
}

func (r *MongoRepository) Update(ctx context.Context, u *User) error {
	oid, err := parseOID(u.ID)
	if err != nil {
		return err
	}
	_, err = r.collection.UpdateByID(ctx, oid, u)
	return err
}

func (r *MongoRepository) Delete(ctx context.Context, id string) error {
	oid, err := parseOID(id)
	if err != nil {
		return err
	}
	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": oid})
	return err
}

func (r *MongoRepository) FindByID(ctx context.Context, id string) (*User, error) {
	oid, err := parseOID(id)
	if err != nil {
		return nil, err
	}
	var u User
	if err := r.collection.FindOne(ctx, bson.M{"_id": oid}).Decode(&u); err != nil {
		return nil, err
	}
	return &u, nil
}
