package user

import "time"

type User struct {
	ID          string    `json:"id" bson:"_id"`
	FirstName   string    `json:"first_name" bson:"first_name"`
	LastName    string    `json:"last_name" bson:"last_name"`
	DateOfBirth time.Time `json:"date_of_birth" bson:"date_of_birth"`
	Email       string    `json:"email" bson:"email"`
	Password    string    `json:"password" bson:"password"`
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" bson:"updated_at"`
}
