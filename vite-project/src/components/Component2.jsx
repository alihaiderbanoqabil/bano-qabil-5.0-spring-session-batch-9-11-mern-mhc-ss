import { useContext } from "react";
import { Component3 } from "./Component3";
import { UserContext } from "../context";

export function Component2() {
    const state = useContext(UserContext)
    console.log(state, "state");

    return (
        <>
            <h1>Component 2</h1>
            <h2>{`Hello ${state.user} again!`}</h2>

            <Component3 />
        </>
    );
}

// export function Component2() {
//     const user = useContext(UserContext)

//     return (
//         <>
//             <h1>Component 2</h1>
//             <h2>{`Hello ${user} again!`}</h2>

//             <Component3 />
//         </>
//     );
// }

// export function Component2({ user }) {
//     return (
//         <>
//             <h1>Component 2</h1>
//             <Component3 user={user} />
//         </>
//     );
// }
