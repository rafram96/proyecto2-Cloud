import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type LoginResult = {
  success: boolean;
  error?: string;
  data?: any;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "", tenant_id: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password || !credentials.tenant_id) {
      setError("Rellenar todos los campos.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(credentials) as LoginResult;
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Error en login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-[90px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-black dark:text-white theme-transition">
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className="flex w-full justify-center">
        <div className="w-[650px] flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl dark:shadow-black/50 theme-transition border border-gray-200 dark:border-gray-700 glow-border">
              <h1 className="font-koulen font-bold text-center text-[96px] bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 dark:from-yellow-300 dark:via-yellow-400 dark:to-yellow-500 bg-clip-text text-transparent glow-text">
                Welcome!
              </h1>

              <div className="mt-6">
                <div className="mb-4">
                  <label className="ml-2 font-judson block text-[24px] font-semibold mb-2 text-gray-800 dark:text-gray-100">
                    Email
                  </label>
                  <div className="flex items-center justify-center">
                    <input
                      value={credentials.email}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          email: e.target.value,
                        })
                      }
                      className="w-[472px] p-4 pl-6 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-jaldi placeholder-gray-400 dark:placeholder-gray-400 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent theme-transition shadow-inner"
                      placeholder="Enter your email"
                      type="email"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="ml-2 font-judson block text-[24px] font-semibold mb-2 text-gray-800 dark:text-gray-100">
                    Password
                  </label>
                  <div className="flex items-center justify-center">
                    <input
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        })
                      }
                     className="w-[472px] p-4 pl-6 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-jaldi placeholder-gray-400 dark:placeholder-gray-400 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent theme-transition shadow-inner"
                     placeholder="Enter your password"
                     type="password"
                     required
                   />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="ml-2 font-judson block text-[24px] font-semibold mb-2 text-gray-800 dark:text-gray-100">
                    Tenant ID
                  </label>
                  <div className="flex items-center justify-center">
                    <input
                      value={credentials.tenant_id}
                      onChange={(e) => setCredentials({ ...credentials, tenant_id: e.target.value })}
                      className="w-[472px] p-4 pl-6 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-jaldi placeholder-gray-400 dark:placeholder-gray-400 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent theme-transition shadow-inner"
                      placeholder="Enter your tenant ID"
                      type="text"
                       required
                     />
                   </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <p className="text-red-600 dark:text-red-400 font-medium text-center">{error}</p>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 mt-4 font-koulen text-[28px] bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500 text-black dark:text-gray-900 rounded-xl hover:from-yellow-400 hover:to-yellow-500 dark:hover:from-yellow-300 dark:hover:to-yellow-400 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl font-bold tracking-wide"
                  >
                    {loading ? "LOGGING IN..." : "LOGIN"}
                  </button>
                </div>
              </div>
            </form>
          </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
