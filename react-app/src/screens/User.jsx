import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function User() {
    // const params = useParams();
    // console.log(params, "Params");
    const { id } = useParams();
    const navigate = useNavigate()
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")

    useEffect(() => {
        fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setError("")
                setUser(data);
            })
            .catch((err) => {
                console.log(err);
                setError(err.message)
            })
            .finally(() => {
                setLoading(false);
            })
    }, [id]);

    if (loading) {
        return <h2>Loading user...</h2>;
    }
    if (error) {
        return <h2>{error}</h2>;
    }
    return (
        <>
            {/* <button className="profile-btn" onClick={() => navigate("/users")}>Back</button> */}
            <button className="profile-btn" onClick={() => navigate(-1)}>Back</button>
            <div className="profile-container">
                <h1>{user.name}</h1>

                <p>
                    <strong>Username:</strong> {user.username}
                </p>

                <p>
                    <strong>Email:</strong> {user.email}
                </p>

                <p>
                    <strong>Phone:</strong> {user.phone}
                </p>

                <p>
                    <strong>Website:</strong> {user.website}
                </p>

                <p>
                    <strong>Company:</strong> {user.company?.name}
                </p>

                <p>
                    <strong>City:</strong> {user.address?.city}
                </p>
            </div>
        </>

    );
}

// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

// export function UserProfile() {
//   useSearchParams
//   const { state, search, hash } = useLocation();
//   const navigate = useNavigate();
//   return (
//     <>
//       {/* <button className="profile-btn" onClick={() => navigate("/users")}>Back</button> */}
//       <button className="profile-btn" onClick={() => navigate(-1)}>Back</button>
//       <div className="profile-container">
//         <h1>{state.name}</h1>

//         <p>
//           <strong>Username:</strong> {state.username}
//         </p>

//         <p>
//           <strong>Email:</strong> {state.email}
//         </p>

//         <p>
//           <strong>Phone:</strong> {state.phone}
//         </p>

//         <p>
//           <strong>Website:</strong> {state.website}
//         </p>

//         <p>
//           <strong>Company:</strong> {state.company?.name}
//         </p>

//         <p>
//           <strong>City:</strong> {state.address?.city}
//         </p>
//       </div>
//     </>

//   );
// }
