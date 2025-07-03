import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="flex w-full justify-center">
        <div className="w-[650px] flex items-center justify-center">
            <form onSubmit={handleSubmit}>
              <h1 className="font-koulen font-bold text-center text-[96px] text-[#FCF7D5]">
                Welcome!
              </h1>

              <div className="mt-4">
                <div className="mb-3">
                  <label className="ml-5 font-judson block text-[26px] font-medium text-white mb-1">
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
                      className="w-[472px] p-3 pl-5 bg-[#D9D9D9] text-primary font-jaldi italic placeholder-[#6D6D6D] "
                      placeholder="Enter your email"
                      type="email"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="ml-5 font-judson block text-[26px] font-medium text-white mb-1">
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
                      className="w-[472px] p-3 pl-5 bg-[#D9D9D9] text-primary font-jaldi italic placeholder-[#6D6D6D]"
                      placeholder="Enter your password"
                      type="password"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="ml-5 font-judson block text-[26px] font-medium text-white mb-1">
                    Tenant ID
                  </label>
                  <div className="flex items-center justify-center">
                    <input
                      className="w-[472px] p-3 pl-5 bg-[#D9D9D9] text-primary font-jaldi italic placeholder-[#6D6D6D] "
                      placeholder="Enter your tenant ID"
                      type="tenant_id"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 font-Judson text-center mb-4">{error}</p>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="pb-8 font-koulen text-[30px] bg-transparent border-none outline-none text-amarillo3 hover:underline transition duration-200"
                  >
                    LOGIN
                  </button>
                </div>
              </div>
            </form>
          </div>
      </div>
    </div>
  );
};

export default Login;
