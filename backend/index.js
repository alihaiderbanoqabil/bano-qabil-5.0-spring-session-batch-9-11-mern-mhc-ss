// Import the HTTP module
const http = require('http');

const PORT = 8000;

const users = [
    {
        id: 1,
        name: "Ali",
        email: "ali@example.com",
    },
    {
        id: 2,
        name: "Ahmed",
        email: "ahmed@example.com",
    },
];

// Create a server object
const server = http.createServer((req, res) => {
    // console.log(req, "req");
    // console.log(res, "res");

    
    // Response Headers
    res.setHeader("Content-Type", "application/json");

    // GET /
    if (req.method === "GET" && req.url === "/") {
        return res.end(
            JSON.stringify({
                message: "Welcome to Node.js Server",
            })
        );
    }

    // GET /api/users
    if (req.method === "GET" && req.url === "/api/users") {
        return res.end(JSON.stringify(users));
    }

    // GET /api/users/1
    if (req.method === "GET" && req.url.startsWith("/api/users/")) {
        const id = Number(req.url.split("/")[3]);

        const user = users.find((u) => u.id === id);

        if (!user) {
            res.statusCode = 404;

            return res.end(
                JSON.stringify({
                    message: "User not found",
                })
            );
        }

        return res.end(JSON.stringify(user));
    }

    // POST /api/users
    if (req.method === "POST" && req.url === "/api/users") {
        let body = "";

        req.on("data", (chunk) => {
            // console.log(chunk, "chunk");
            
            body = body+ chunk;
        });

        req.on("end", () => {
            console.log(body, "body");
            
            const data = JSON.parse(body);

            const newUser = {
                id: users.length + 1,
                name: data.name,
                email: data.email,
            };

            users.push(newUser);

            res.statusCode = 201;

            res.end(
                JSON.stringify({
                    message: "User created successfully",
                    user: newUser,
                })
            );
        });

        return;
    }

    // DELETE /api/users/1
    if (req.method === "DELETE" && req.url.startsWith("/api/users/")) {
        const id = Number(req.url.split("/")[3]);

        const index = users.findIndex((u) => u.id === id);

        if (index === -1) {
            res.statusCode = 404;

            return res.end(
                JSON.stringify({
                    message: "User not found",
                })
            );
        }

        const deletedUser = users.splice(index, 1);

        return res.end(
            JSON.stringify({
                message: "User deleted successfully",
                user: deletedUser[0],
            })
        );
    }

    // Route Not Found
    res.statusCode = 404;

    res.end(
        JSON.stringify({
            message: "Route not found",
        })
    );
});

// Define the port to listen on const PORT = 3000;

// Start the server and listen on the specified port
server.listen(PORT, 'localhost', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});