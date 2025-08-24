package response

import "github.com/gin-gonic/gin"

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

func SendResponse(c *gin.Context, status int, success bool, message string, data interface{}, err interface{}) {
	c.JSON(status, Response{
		Success: success,
		Message: message,
		Data:    data,
		Error:   err,
	})
}
