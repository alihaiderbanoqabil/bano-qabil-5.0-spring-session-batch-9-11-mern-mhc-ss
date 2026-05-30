import React, { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// import { Layout } from './layouts/Layout';
// import { UserLayout } from './layouts/UserLayout';
// import { NotFound } from './screens/NotFound';
// import { Home } from './screens/Home';
// import { About } from './screens/About';
// import { Contact } from './screens/Contact';
// import { Users } from './screens/Users';
// import { User } from './screens/User';
// import { Posts } from './screens/Posts';
// import { Post } from './screens/Post';
// import { Todos } from './screens/Todos';
// import { Todo } from './screens/Todo';

// default lazy import 
// const Layout = lazy(() => import("./layouts/Layout"));
// const UserLayout = lazy(() => import("./layouts/UserLayout"));

// const Home = lazy(() => import("./screens/Home"));
// const About = lazy(() => import("./screens/About"));
// const Contact = lazy(() => import("./screens/Contact"));
// const NotFound = lazy(() => import("./screens/NotFound"));

// const Users = lazy(() => import("./screens/Users"));
// const User = lazy(() => import("./screens/User"));

// const Posts = lazy(() => import("./screens/Posts"));
// const Post = lazy(() => import("./screens/Post"));

// const Todos = lazy(() => import("./screens/Todos"));
// const Todo = lazy(() => import("./screens/Todo"));

// Named Lazy Imports

const Layout = lazy(() =>
  import("./layouts/Layout").then((m) => ({
    default: m.Layout,
  }))
);

const UserLayout = lazy(() =>
  import("./layouts/UserLayout").then((m) => ({
    default: m.UserLayout,
  }))
);

const Home = lazy(() =>
  import("./screens/Home").then((m) => ({
    default: m.Home,
  }))
);

const About = lazy(() =>
  import("./screens/About").then((m) => ({
    default: m.About,
  }))
);

const Contact = lazy(() =>
  import("./screens/Contact").then((m) => ({
    default: m.Contact,
  }))
);

const NotFound = lazy(() =>
  import("./screens/NotFound").then((m) => ({
    default: m.NotFound,
  }))
);

const Users = lazy(() =>
  import("./screens/Users").then((m) => ({
    default: m.Users,
  }))
);

const User = lazy(() =>
  import("./screens/User").then((m) => ({
    default: m.User,
  }))
);

const Posts = lazy(() =>
  import("./screens/Posts").then((m) => ({
    default: m.Posts,
  }))
);

const Post = lazy(() =>
  import("./screens/Post").then((m) => ({
    default: m.Post,
  }))
);

const Todos = lazy(() =>
  import("./screens/Todos").then((m) => ({
    default: m.Todos,
  }))
);

const Todo = lazy(() =>
  import("./screens/Todo").then((m) => ({
    default: m.Todo,
  }))
);
// Reusable Suspense Wrapper
const Loadable = (Component) => {
  return (
    <Suspense fallback={<h1 className='text-mint-500
     border-2
      border-mint-500
      '>Loading...</h1>}>

           
      {Component}
    </Suspense>
  )
};

const router = createBrowserRouter([
  {
    path: "/",
    element: Loadable(<Layout />),
    errorElement: Loadable(<NotFound />),

    children: [
      // Home
      {
        index: true,
        element: Loadable(<Home />),
      },

      // About
      {
        path: "about",
        element: Loadable(<About />),
      },

      // Contact
      {
        path: "contact",
        element: Loadable(<Contact />),
      },

      // Users Module
      {
        path: "users",
        element: Loadable(<UserLayout />),

        children: [
          {
            index: true,
            element: Loadable(<Users />),
          },

          {
            path: ":userId",
            element: Loadable(<User />),
          },

          {
            path: ":userId/posts",
            element: Loadable(<Posts />),
          },

          {
            path: ":userId/posts/:postId",
            element: Loadable(<Post />),
          },

          {
            path: ":userId/todos",
            element: Loadable(<Todos />),
          },

          {
            path: ":userId/todos/:postId",
            element: Loadable(<Todo />),
          },
        ],
      },
    ],
  },
]);

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element:
//       // <Suspense fallback={<h1>Loading...</h1>}>
//       <Suspense fallback={<Loading />}>
//         <Layout />
//       </Suspense>,
//     errorElement: Loadable(<NotFound />),

//     children: [
//       // Home
//       {
//         index: true,
//         element: Loadable(<Home />),
//       },

//       // About
//       {
//         path: "about",
//         element: Loadable(<About />),
//       },

//       // Contact
//       {
//         path: "contact",
//         element: Loadable(<Contact />),
//       },

//       // Users Module
//       {
//         path: "users",
//         element: Loadable(<UserLayout />),

//         children: [
//           {
//             index: true,
//             element: Loadable(<Users />),
//           },

//           {
//             path: ":userId",
//             element: Loadable(<User />),
//           },

//           {
//             path: ":userId/posts",
//             element: Loadable(<Posts />),
//           },

//           {
//             path: ":userId/posts/:postId",
//             element: Loadable(<Post />),
//           },

//           {
//             path: ":userId/todos",
//             element: Loadable(<Todos />),
//           },

//           {
//             path: ":userId/todos/:postId",
//             element: Loadable(<Todo />),
//           },
//         ],
//       },
//     ],
//   },
// ]);

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Layout />,
//     errorElement: <NotFound />,
//     children: [
//       // Static Routes
//       {
//         index: true,
//         element: <Home />,
//       },

//       {
//         path: "about",
//         element: <About />,
//       },
//       {
//         path: "/contact",
//         element: <Contact />,
//       },
//       // {
//       //   path: "users",
//       //   element: <Users />,
//       // },
//       // // Dynamic Route
//       // {
//       //   path: "users/:id",
//       //   element: <User />,
//       // },
//       {
//         path: "/users",
//         element: <UserLayout />,

//         children: [
//           {
//             index: true,
//             element: <Users />,
//           },

//           {
//             path: ":userId",
//             element: <User />,
//           },
//           {
//             path: ":userId/posts",
//             element: <Posts />,
//           },
//           {
//             path: ":userId/posts/:postId",
//             element: <Post />
//           },
//           {
//             path: ":userId/todos",
//             element: <Todos />,
//           },
//           {
//             path: ":userId/todos/:postId",
//             element: <Todo />
//           }
//         ],
//       },
//       // {
//       //   path: "users/:userId/comments/:commentId",
//       //   element: <User />,
//       // },
//     ],
//   }
// ]);
// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Layout />,
//     errorElement: <NotFound />,
//     children: [
//       // Static Routes
//       {
//         index: true,
//         element: <Home />,
//       },

//       {
//         path: "about",
//         element: <About />,
//       },
//       {
//         path: "/contact",
//         element: <Contact />,
//       },
//       // {
//       //   path: "users",
//       //   element: <Users />,
//       // },
//       // // Dynamic Route
//       // {
//       //   path: "users/:id",
//       //   element: <User />,
//       // },
//       {
//         path: "/users",
//         element: <UserLayout />,

//         children: [
//           {
//             index: true,
//             element: <Users />,
//           },

//           {
//             path: ":userId",
//             element: <User />,
//           },
//           {
//             path: ":userId/posts",
//             element: <Posts />,
//           },
//           {
//             path: ":userId/posts/:postId",
//             element: <Post />
//           },
//           {
//             path: ":userId/todos",
//             element: <Todos />,
//           },
//           {
//             path: ":userId/todos/:postId",
//             element: <Todo />
//           }
//         ],
//       },
//       // {
//       //   path: "users/:userId/comments/:commentId",
//       //   element: <User />,
//       // },
//     ],
//   }
// ]);


export function App() {
  return <RouterProvider router={router} />
}
