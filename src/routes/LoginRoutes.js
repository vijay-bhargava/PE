
import ChatbotFullScreen from '../components/chatbotfullscreen';
import MinimalLayout from '../layout/MinimalLayout';
import Login from "../pages/Login/Login";
import PageNotFound from '../pages/PageNotFound';
// const AuthLogin = Loadable(lazy(() => import('pages/authentication/Login')));
// const AuthRegister = Loadable(lazy(() => import('pages/authentication/Register')));

const LoginRoutes = {
  path: '/',
  element: <MinimalLayout />,

  children: [
   
    {
      path: '/',
      element:  <Login />
    },
    {
      path: '/:pageSuffix',
      element: <Login />
    },
    
    {
      path: '/404',
      element: <PageNotFound />
    },
    {
      path: 'register',
      element: <>register</>
    },
    {
			path: "procurengine/chatbot",
			element: <ChatbotFullScreen key={"chatbotfullscreen"}/>

    },
    {
			path: "procurengine/chatbotwebsite",
			element: <ChatbotFullScreen key={"chatbothome"}/>
		}
  ]
};

export default LoginRoutes;