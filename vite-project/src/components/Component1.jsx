import { useContext, useState } from "react";
import { Component2 } from "./Component2";
import { UserContext } from "../context";

export function Component1() {
    const state = useContext(UserContext)
    return (
        <>
            <h1>{`Hello ${state.user}!`}</h1>
            <Component2 />
        </>

    );
}

// export function Component1() {
//     const [user, setUser] = useState("Ali");

//     return (
//         // <UserContext.Provider value={{
//         //     user: user, setUser: setUser
//         // }}>
//         <UserContext.Provider value={{
//             user, setUser,
//         }}>
//             <h1>{`Hello ${user}!`}</h1>
//             <Component2 />
//         </UserContext.Provider>
//     );
// }

// export function Component1() {
//     const [user, setUser] = useState("Ali");

//     return (
//         <UserContext.Provider value={user}>
//             <h1>{`Hello ${user}!`}</h1>
//             <Component2 />
//         </UserContext.Provider>
//     );
// }

// export function Component1() {
//     const [user, setUser] = useState("Linus");

//     return (
//         <>
//             <h1>{`Hello ${user}!`}</h1>
//             <Component2 user={user} />
//         </>
//     );
// }