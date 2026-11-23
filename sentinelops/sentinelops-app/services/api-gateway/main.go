package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"
)

const (
	rateLimit  = 100
	rateWindow = time.Minute
)

type visitor struct {
	count   int
	resetAt time.Time
}

var (
	visitors = map[string]*visitor{}
	mu       sync.Mutex
)

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// newProxy builds a reverse proxy that strips the service prefix from the path,
// so /catalog/products reaches catalog as /products.
func newProxy(target, prefix string) http.Handler {
	remote, err := url.Parse(target)
	if err != nil {
		log.Fatalf("invalid upstream %s: %v", target, err)
	}
	proxy := httputil.NewSingleHostReverseProxy(remote)
	originalDirector := proxy.Director
	proxy.Director = func(r *http.Request) {
		originalDirector(r)
		r.URL.Path = strings.TrimPrefix(r.URL.Path, prefix)
		r.Host = remote.Host
	}
	return proxy
}

func rateLimited(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := strings.Split(r.RemoteAddr, ":")[0]
		now := time.Now()

		mu.Lock()
		v, ok := visitors[ip]
		if !ok || now.After(v.resetAt) {
			visitors[ip] = &visitor{count: 1, resetAt: now.Add(rateWindow)}
		} else {
			v.count++
		}
		blocked := visitors[ip].count > rateLimit
		mu.Unlock()

		if blocked {
			http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	mux.HandleFunc("/readyz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	mux.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain; version=0.0.4")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("api_requests_total 1\n"))
	})

	upstreams := map[string]string{
		"/catalog/":  env("CATALOG_URL", "http://localhost:8000"),
		"/orders/":   env("ORDERS_URL", "http://localhost:8081"),
		"/payments/": env("PAYMENTS_URL", "http://localhost:8082"),
	}
	for prefix, target := range upstreams {
		mux.Handle(prefix, newProxy(target, strings.TrimSuffix(prefix, "/")))
	}

	srv := &http.Server{
		Addr:         ":8080",
		Handler:      rateLimited(mux),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	log.Println("api-gateway listening on :8080 (catalog, orders, payments)")
	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("api-gateway failed: %v", err)
	}
}
