package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestNewProxyStripsServicePrefix(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/products" {
			t.Errorf("upstream path = %q, want /products", r.URL.Path)
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()

	proxy := newProxy(upstream.URL, "/catalog")
	recorder := httptest.NewRecorder()
	proxy.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/catalog/products", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusOK)
	}
}

func TestRateLimiterRejectsExcessRequests(t *testing.T) {
	visitors = map[string]*visitor{}
	handler := rateLimited(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	request := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	request.RemoteAddr = "10.0.0.1:1234"

	for i := 0; i < rateLimit; i++ {
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, request)
		if recorder.Code != http.StatusOK {
			t.Fatalf("request %d was blocked early with %d", i, recorder.Code)
		}
	}

	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusTooManyRequests {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusTooManyRequests)
	}
}
