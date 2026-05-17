import React, { useState } from "react";

const Posts = () => {
    return <h2>Posts Component</h2>;
};

const Todos = () => {
    return <h2>Todos Component</h2>;
};

const Albums = () => {
    return <h2>Albums Component</h2>;
};

const Photos = () => {
    return <h2>Photos Component</h2>;
};

const Users = () => {
    return <h2>Users Component</h2>;
};

const Comments = () => {
    return <h2>Comments Component</h2>;
};

export const Tabs = () => {
    const [selectedTab, setSelectedTab] = useState("posts");

    const renderComponent = () => {
        switch (selectedTab) {
            case "posts":
                return <Posts />;

            case "todos":
                return <Todos />;

            case "albums":
                return <Albums />;

            case "photos":
                return <Photos />;

            case "users":
                return <Users />;

            case "comments":
                return <Comments />;

            default:
                return <h2>No Component Found</h2>;
        }
    };

    return (
        <div>
            <nav
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px",
                }}
            >
                <button onClick={() => setSelectedTab("posts")}>Posts</button>

                <button onClick={() => setSelectedTab("todos")}>Todos</button>

                <button onClick={() => setSelectedTab("albums")}>Albums</button>

                <button onClick={() => setSelectedTab("photos")}>Photos</button>

                <button onClick={() => setSelectedTab("users")}>Users</button>

                <button onClick={() => setSelectedTab("comments")}>Comments</button>
            </nav>

            {renderComponent()}
        </div>
    );
};
