import { useRoutes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import routes from "./routes";

// App ka kaam sirf itna: routes/index.jsx wali list ko render karna
export default function App() {
  const element = useRoutes(routes);

  return (
    <>
      {element}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </>
  );
}
