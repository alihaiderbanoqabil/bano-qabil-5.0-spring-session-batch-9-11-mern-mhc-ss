import React from 'react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Layout } from './layouts/Layout';
import { NotFound } from './screens/NotFound';
import { Home } from './screens/Home';
import { About } from './screens/About';
import { Contact } from './screens/Contact';
import { Users } from './screens/Users';
import { User } from './screens/User';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      // Static Routes
      {
        index: true,
        element: <Home />,
      },

      {
        path: "about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "users",
        element: <Users />,
      },
      // Dynamic Route
      {
        path: "users/:id",
        element: <User />,
      },
      // {
      //   path: "users/:userId/comments/:commentId",
      //   element: <User />,
      // },
    ],
  }
]);


export function App() {
  return <RouterProvider router={router} />
}
