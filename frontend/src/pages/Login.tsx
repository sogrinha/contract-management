import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuthErrorMessage } from '../utils/FirebaseAuthErrors';
import logo from '../assets/imags/sogrinha_logo.png';
import { useNavigate, Navigate } from 'react-router-dom';
import RoutesName from '../routes/Routes';
import { useAuth } from '../context/AuthContext';

import '../styles/inputStyles.css';

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Se já estiver autenticado, redireciona para a página inicial
  if (user) {
    return <Navigate to={RoutesName.HOME} replace />;
  }

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Email inválido').required('Email é obrigatório'),
    password: Yup.string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres')
      .required('Senha é obrigatória'),
  });

  const handleLogin = async (
    values: any,
    { setSubmitting, resetForm }: any
  ) => {
    try {
      const { email, password } = values;
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login realizado com sucesso!');
      navigate(RoutesName.HOME);
      resetForm();
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="w-48 h-48 object-contain" />
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-left">Login</h2>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none pink-focus-input"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="password"
                >
                  Senha
                </label>
                <Field
                  type="password"
                  name="password"
                  className="w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none pink-focus-input"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-myPrimary text-white py-2 rounded hover:bg-pink-600 focus:outline-none focus:ring focus:border-pink-300"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </Form>
          )}
        </Formik>
        <ToastContainer position="top-right" autoClose={1500} />
      </div>
    </div>
  );
};

export default Login;
