import { useContext } from "react";
import { UserContext } from "../context";

export function Component3() {
    const state = useContext(UserContext)

    return (
        <>
            <h1>Component 3</h1>
            <input type="text" value={state.user} onChange={(e) => state.setUser(e.target.value)} />
            <h2>{`Hello ${state.user} again!`}</h2>
        </>
    );
}

// export function Component3() {
//     const user = useContext(UserContext)

//     return (
//         <>
//             <h1>Component 3</h1>
//             <h2>{`Hello ${user} again!`}</h2>
//         </>
//     );
// }
// export function Component3({ user }) {
//     return (
//         <>
//             <h1>Component 3</h1>
//             <h2>{`Hello ${user} again!`}</h2>
//         </>
//     );
// }
