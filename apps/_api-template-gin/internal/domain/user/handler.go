package user

import (
	"net/http"
	"strconv"

	"golang-gin/internal/db"
	"golang-gin/internal/pkg/response"

	"github.com/gin-gonic/gin"
)

type UserHandler interface {
	FindAll(c *gin.Context)
}

type userHandler struct {
	service UserService
}

func NewUserHandler(_service UserService) UserHandler {
	return &userHandler{service: _service}
}

func Factory(mongo *db.Mongo) UserHandler {
	repository := NewUserRepository(mongo.DB.Collection("user"))
	service := NewUserService(repository)
	return NewUserHandler(service)
}

func (h *userHandler) FindAll(c *gin.Context) {
	page, _ := strconv.ParseInt(c.DefaultQuery("page", "1"), 10, 64)
	size, _ := strconv.ParseInt(c.DefaultQuery("pageSize", "10"), 10, 64)
	search := c.Query("search")

	users, err := h.service.FindAll(c, &Pagination{
		Page:     page,
		PageSize: size,
		Search:   search,
	})
	if err != nil {
		response.SendResponse(c, http.StatusInternalServerError, false, "Failed to fetch users", []*User{}, err)
		return
	}

	response.SendResponse(c, http.StatusOK, true, "Success", users, nil)
}

func (h *userHandler) Create(c *gin.Context) {
	
}