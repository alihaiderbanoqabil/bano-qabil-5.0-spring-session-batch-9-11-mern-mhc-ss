import { Link, NavLink, Outlet } from "react-router-dom";

export function Layout() {
    return (
        <div className="ali">

            <nav>
                <li>
                    <NavLink
                        style={({ isActive }) => ({
                            color: isActive ? "red" : "black",
                            fontWeight: isActive ? "bolder" : 400
                        })}
                        to="/">Home</NavLink>
                </li>

                <li>
                    <NavLink style={({ isActive }) => ({
                        color: isActive ? "red" : "black",
                        fontWeight: isActive ? "bolder" : 400

                    })} to="/about">About</NavLink>

                </li>
                <li>
                    <NavLink style={({ isActive }) => ({
                        color: isActive ? "red" : "black",
                        fontWeight: isActive ? "bolder" : 400

                    })} to="/contact">Contact</NavLink>

                </li>
                <li>
                    <NavLink style={({ isActive }) => ({
                        color: isActive ? "red" : "black",
                        fontWeight: isActive ? "bolder" : 400

                    })} to="/users">Users</NavLink>

                </li>
            </nav>
            {/* Child routes render here */}
            <Outlet />

            <footer>This is footer</footer>
        </div>
    );
}

// export function Layout() {
//     return (
//         <div className="ali">

//             <nav>
//                 <li>
//                     <NavLink
//                         className={({ isActive }) => isActive ? "active" : ""}
//                         to="/">Home</NavLink>
//                 </li>

//                 <li>
//                     <NavLink className={({ isActive }) => isActive ? "active" : ""} to="/about">About</NavLink>

//                 </li>
//                 <li>
//                     <NavLink className={({ isActive }) => isActive ? "active" : ""} to="/contact">Contact</NavLink>

//                 </li>
//                 <li>
//                     <NavLink className={({ isActive }) => isActive ? "active" : ""} to="/users">Users</NavLink>

//                 </li>
//             </nav>
//             {/* Child routes render here */}
//             <Outlet />

//             <footer>This is footer</footer>
//         </div>
//     );
// }

// export function Layout() {
//     return (
//         <div>

//             <nav>
//                 <li>
//                     <Link to="/">Home</Link>
//                 </li>

//                 <li>
//                     <Link to="/about">About</Link>

//                 </li>
//                 <li>
//                     <Link to="/contact">Contact</Link>

//                 </li>
//                 <li>
//                     <Link to="/users">Users</Link>

//                 </li>
//             </nav>
//             {/* Child routes render here */}
//             <Outlet />

//             <footer>This is footer</footer>
//         </div>
//     );
// }
