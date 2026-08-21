import { useRoutes } from "react-router-dom";
import routes from "./routes";

// App ka kaam sirf itna: routes/index.jsx wali list ko render karna
export default function App() {
  return useRoutes(routes);
}
