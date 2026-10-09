<?php
/**
 * UserController — handles HTTP requests for the /users resource.
 * Each method receives route parameters and uses the User model.
 */

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../core/Response.php';

class UserController
{
    /** GET /users — list all users. */
    public function index(array $params): void
    {
        $users = User::all();
        Response::json($users);
    }

    /** GET /users/:id — get a single user. */
    public function show(array $params): void
    {
        $user = User::find((int) $params['id']);
        if (!$user) {
            Response::json(['error' => 'User not found'], 404);
        }
        Response::json($user);
    }

    /** POST /users — create a new user. */
    public function store(array $params): void
    {
        $body = Response::body();

        if (empty($body['name']) || empty($body['email'])) {
            Response::json(['error' => 'Name and email are required'], 422);
        }

        $id = User::create($body);
        $user = User::find($id);
        Response::json($user, 201);
    }

    /** PUT /users/:id — update an existing user. */
    public function update(array $params): void
    {
        $id = (int) $params['id'];
        $body = Response::body();

        if (empty($body['name']) || empty($body['email'])) {
            Response::json(['error' => 'Name and email are required'], 422);
        }

        $affected = User::update($id, $body);
        if ($affected === 0) {
            Response::json(['error' => 'User not found or no changes'], 404);
        }

        $user = User::find($id);
        Response::json($user);
    }

    /** DELETE /users/:id — delete a user. */
    public function destroy(array $params): void
    {
        $id = (int) $params['id'];
        $affected = User::delete($id);
        if ($affected === 0) {
            Response::json(['error' => 'User not found'], 404);
        }
        Response::json(['message' => 'User deleted', 'id' => $id]);
    }
}
