import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AVAILABLE_TENANTS } from "../constants/tenants";

type RegisterResult = {
  success: boolean;
  error?: string;
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [userData, setUserData] = useState({
    nombre: "",
    email: "",
    password: "",
    tenant_id: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result: RegisterResult = await register(userData);
    if (result.success) {
      navigate("/login");
    } else {
      setError(result.error || "Error en registro");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-[90px] bg-white dark:bg-gray-900 text-black dark:text-white theme-transition">
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className="flex justify-center items-center w-full">
          <div className="w-[1100px] flex items-center justify-center">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-2xl theme-transition">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col lg:flex-row items-start gap-20 justify-center"
              >
            <h1 className="font-koulen font-bold text-left text-[57px] text-yellow-500 dark:text-yellow-400 mt-[15%] m-0 p-0">
              Your Smart <br /> Tech <br />
              Journey <br /> Starts Here.
            </h1>
            <div className="mt-[15%] w-px h-80 mx-4 bg-gray-400 dark:bg-gray-600"></div>
            <section className="text-left">
              <h1 className="font-koulen font-bold text-center text-[48px] text-gray-800 dark:text-white">
                Create An Account
              </h1>

              <div className="mt-3">
                <div className="mb-3">
                  <label className="ml-5 font-judson block text-[26px] font-medium text-gray-800 dark:text-gray-200 mb-1">
                    Name
                  </label>
                  <div className="flex items-center justify-center">
                    <input
                      value={userData.nombre}
                      onChange={(e) =>
                        setUserData({ ...userData, nombre: e.target.value })
                      }
                      className="w-[472px] p-3 pl-5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-jaldi italic placeholder-gray-500 dark:placeholder-gray-400 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 theme-transition"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="ml-5 font-judson block text-[26px] font-medium text-gray-800 dark:text-gray-200 mb-1">
                    Email
                  </label>
                  <div className="flex items-center justify-center">
                    <input
                      value={userData.email}
                      onChange={(e) =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                      className="w-[472px] p-3 pl-5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-jaldi italic placeholder-gray-500 dark:placeholder-gray-400 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 theme-transition"
                      placeholder="Enter your email"
                      type="email"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="ml-5 font-judson block text-[26px] font-medium text-gray-800 dark:text-gray-200 mb-1">
                    Password
                  </label>
                  <div className="flex items-center justify-center">
                    <input
                      value={userData.password}
                      onChange={(e) =>
                        setUserData({ ...userData, password: e.target.value })
                      }
                      className="w-[472px] p-3 pl-5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-jaldi italic placeholder-gray-500 dark:placeholder-gray-400 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 theme-transition"
                      placeholder="Enter your password"
                      type="password"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="ml-5 font-judson block text-[26px] font-medium text-gray-800 dark:text-gray-200 mb-1">
                    Tenant
                  </label>
                  <div className="flex items-center justify-center">
                    <select
                      value={userData.tenant_id}
                      onChange={(e) =>
                        setUserData({ ...userData, tenant_id: e.target.value })
                      }
                      className="w-[472px] p-3 pl-5 bg-blue-50 dark:bg-gray-700 text-gray-800 dark:text-white font-jaldi rounded-lg border-2 border-blue-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-transparent theme-transition shadow-sm hover:shadow-md"
                      required
                    >
                      <option value="" className="text-gray-500">Selecciona un tenant</option>
                      {AVAILABLE_TENANTS.map((tenant) => (
                        <option key={tenant.value} value={tenant.value} className="text-gray-800 dark:text-gray-100">
                          {tenant.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-center font-Judson mb-4">
                    {error}
                  </p>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="pb-8 font-koulen text-[30px] bg-transparent border-none outline-none text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 hover:underline transition duration-200 disabled:opacity-50"
                  >
                    {loading ? "REGISTERING..." : "Register"}
                  </button>
                </div>
              </div>
              </section>
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
