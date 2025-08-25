package user

import (
	"context"
)

type UserService interface {
	FindAll(ctx context.Context, p *Pagination) ([]*User, error)
}

type userService struct {
	repository UserRepository
}

func NewUserService(_repository UserRepository) UserService {
	return &userService{repository: _repository}
}

func (s *userService) FindAll(ctx context.Context, p *Pagination) ([]*User, error) {
	return s.repository.FindAll(ctx, p)
}
