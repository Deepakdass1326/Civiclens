import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./store/store";
import AppRouter from "./router/AppRouter";

export default function App() {
  return (
    <Provider store={store}>
      <Toaster position="top-center" />
      <AppRouter />
    </Provider>
  );
}
