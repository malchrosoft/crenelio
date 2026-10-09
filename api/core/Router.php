<?php
/**
 * Lightweight HTTP router with regex-based route matching.
 * Supports GET, POST, PUT, DELETE methods and URL parameters.
 */

class Router
{
    private array $routes = [];

    /** Register a route. */
    public function add(string $method, string $pattern, callable $handler): void
    {
        $this->routes[] = [
            'method'  => strtoupper($method),
            'pattern' => $this->compilePattern($pattern),
            'handler' => $handler,
        ];
    }

    /** Convenience method for GET routes. */
    public function get(string $pattern, callable $handler): void
    {
        $this->add('GET', $pattern, $handler);
    }

    /** Convenience method for POST routes. */
    public function post(string $pattern, callable $handler): void
    {
        $this->add('POST', $pattern, $handler);
    }

    /** Convenience method for PUT routes. */
    public function put(string $pattern, callable $handler): void
    {
        $this->add('PUT', $pattern, $handler);
    }

    /** Convenience method for DELETE routes. */
    public function delete(string $pattern, callable $handler): void
    {
        $this->add('DELETE', $pattern, $handler);
    }

    /** Dispatch the current request. */
    public function dispatch(string $method, string $uri): void
    {
        $method = strtoupper($method);

        // Remove query string from URI
        $path = parse_url($uri, PHP_URL_PATH);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;

            if (preg_match($route['pattern'], $path, $matches)) {
                // Remove the full match (index 0), keep named groups
                $params = array_filter(
                    $matches,
                    fn($key) => !is_int($key),
                    ARRAY_FILTER_USE_KEY
                );

                // Call the handler with extracted parameters
                $route['handler']($params);
                return;
            }
        }

        // No route matched
        Response::json(['error' => 'Route not found'], 404);
    }

    /** Convert a URL pattern like /users/:id into a regex. */
    private function compilePattern(string $pattern): string
    {
        // Escape slashes for regex
        $regex = preg_quote($pattern, '/');

        // Replace :param with named capture groups
        $regex = preg_replace('/\\\\:([a-zA-Z_]+)/', '(?P<$1>[^/]+)', $regex);

        return '#^' . $regex . '$#';
    }
}
