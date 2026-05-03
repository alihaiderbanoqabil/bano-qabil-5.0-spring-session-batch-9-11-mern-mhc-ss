import React, { useState } from 'react'
import { useEffect } from 'react';

export const List = () => {
    const [search, setSearch] = useState("");
    const [count, setCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [users, setUsers] = useState([])

    useEffect(() => {
        const getUsers = async () => {
            try {
                setIsLoading(true);
                setError("")
                const response = await fetch(`https://jsonplaceholder.typicode.com/users${search ? `?name=${search}` : ''}`)
                console.log(response, "response");
                const data = await response.json();
                console.log(data, "data");
                setUsers(data)
                setIsLoading(false);

            } catch (error) {
                console.log(error, "error");
                setError(error?.message)
                setIsLoading(false);
            }
        }
        getUsers()
    }, [search])

    console.log({ isLoading, error, users, search });

    return (
        <div>
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users"
            />
            <button onClick={() => setCount(count + 1)}>+</button>
            <span>{count}</span>
            <button onClick={() => setCount(count - 1)}>-</button>
            <div>
                {/* {isLoading === true && (
                    <h1>Loading...</h1>
                )}
                {error !== "" && (
                    // <h1 style="color: red; background-color: pink">{error}</h1>
                    <h1 style={{ color: "red", backgroundColor: "pink" }}>{error}</h1>
                )} */}
                {/* {isLoading && (<h1>Loading...</h1>)}
                {error && <h1 style={{ color: "red", backgroundColor: "pink" }}>{error}</h1>} */}

                {isLoading ? <h1>Loading...</h1> :
                    <>
                        {users.length > 0 ? (
                            <ol>
                                {
                                    users.map((user) => {
                                        // console.log(user, "user");

                                        return <li key={user.id}>{user.name} - {user.email}</li>
                                    })
                                }
                            </ol>
                        ) : (
                            <h1>Users not found.</h1>
                        )}
                    </>}
                {error && <h1 style={{ color: "red", backgroundColor: "pink" }}>{error}</h1>}
            </div>
        </div>
    )
}
