import React from "react";
import { Outlet, Link, useParams } from "react-router-dom";

export const UsersLayout = () => {
    const { userId } = useParams()
    return (
        <div>
            <hr />
            <nav>
                <ul>

                    <li> <Link to={`/users/${userId}/posts`}>Posts</Link></li>
                    <li> <Link to={`/users/${userId}/todos`}>Todos</Link></li>

                </ul>
            </nav>

            <hr />

            {/* Nested Routes Render Here */}
            <Outlet />
        </div>
    );
};