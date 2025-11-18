package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

// Variável global para a conexão com o banco
var db *sql.DB

// Função para conectar no banco
func connectDB() {
	connStr := "user=postgres password=Bioquimica@1 dbname=postgres host=db port=5432 sslmode=disable"
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Erro ao conectar no banco:", err)
	}
	
	// Testa a conexão
	err = db.Ping()
	if err != nil {
		log.Fatal("Erro ao pingar banco:", err)
	}
	
	fmt.Println("✅ Conectado ao PostgreSQL!")
}

func main() {
	// Conecta no banco
	connectDB()
	
	router := gin.Default()
	
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "OK", 
			"message": "API Go + PostgreSQL rodando!",
		})
	})
	
	// Contagem de funcionários
	router.GET("/employees/count", func(c *gin.Context) {
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM bronze.pesquisa_satisfacao").Scan(&count)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Erro ao contar funcionários",
			})
			return
		}
		
		c.JSON(http.StatusOK, gin.H{
			"total_employees": count,
			"source": "Go API",
		})
	})
	
	// Lista áreas únicas
	router.GET("/areas", func(c *gin.Context) {
		rows, err := db.Query("SELECT DISTINCT area FROM bronze.pesquisa_satisfacao ORDER BY area")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Erro ao buscar áreas",
			})
			return
		}
		defer rows.Close()
		
		var areas []string
		for rows.Next() {
			var area string
			err := rows.Scan(&area)
			if err != nil {
				continue
			}
			areas = append(areas, area)
		}
		
		c.JSON(http.StatusOK, gin.H{
			"areas": areas,
			"count": len(areas),
			"source": "Go API",
		})
	})
	
	router.Run(":3002")
}
