import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";

export const Users = () => {
    const { data: users, error, isLoading: loading } = useFetch("https://jsonplaceholder.typicode.com/users")
    // const [users, setUsers] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState("")

    const navigate = useNavigate();

    // useEffect(() => {
    //     fetch("https://jsonplaceholder.typicode.com/users",{body:{}, method:"GET"})
    //         .then((res) => res.json())
    //         .then((data) => {
    //             setError("")
    //             setUsers(data);
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //             setError(err.message)
    //         })
    //         .finally(() => {
    //             setLoading(false);
    //         })

    //     return () => {
    //         console.log("Users screen unmount");
    //     }
    // }, []);



    if (loading) {
        return <h2>Loading users...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div className="users-container">
            {users.map((user) => (
                <div className="user-card" key={user.id}>
                    <h2>{user.name}</h2>
                    <p>
                        <strong>Username:</strong> {user.username}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>

                    <button
                        // onClick={() => navigate(`/users/${user?.id}`, { replace: true })}
                        onClick={() => navigate(`/users/${user?.id}`, { replace: false, state: user })}
                        className="profile-btn"
                    >
                        View Profile
                    </button>
                </div>
            ))}
        </div>
    );
};