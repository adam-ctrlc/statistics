"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Turnstile } from "next-turnstile";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import ceaLogo from "@/../public/cea_logo.png";
import { useAuth } from "@/app/services/auth/authService";
import { fetchApi } from "@/app/lib/api";

export default function Login() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isTurnstileEnabled = Boolean(turnstileSiteKey);
  const [showPassword, setShowPassword] = useState(false);
  const [isTurnstileLoaded, setIsTurnstileLoaded] = useState(false);
  const [turnstileError, setTurnstileError] = useState(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const { login, isLoggingIn, loginError, loginSuccess } = useAuth();
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTurnstileLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loginSuccess) {
      console.log("Login successful");
      router.push("/dashboard");
    }
  }, [loginSuccess, router]);

  useEffect(() => {
    let mounted = true;

    async function redirectIfAuthenticated() {
      try {
        await fetchApi("/auth/profile");
        if (mounted) {
          router.replace("/dashboard");
        }
      } catch {
        // stay on login page if not authenticated
      }
    }

    redirectIfAuthenticated();
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");
    const turnstileToken = window.turnstile
      ? window.turnstile.getResponse()
      : "";

    if (isTurnstileEnabled && !turnstileToken) {
      setTurnstileError(
        "Security verification failed. Please complete the security check."
      );
      // Reset the turnstile to allow retry
      setTurnstileKey((prev) => prev + 1);
      return;
    }

    setTurnstileError(null);
    login({ username, password, turnstileToken });
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <section
        id="loginSection"
        className="order-1 md:order-2 flex items-center justify-center bg-gray-50 p-4"
      >
        <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl border border-[#800000] flex flex-col gap-6">
          <div className="flex flex-col items-center">
            <Image
              src={ceaLogo}
              alt="CEA Logo"
              width={128}
              height={128}
              className="mb-4"
              priority
            />
            <p className="text-xs text-[#800000] uppercase tracking-widest mb-2">
              PHINMA - Cagayan de Oro City (CEA)
            </p>
            <h1 className="text-2xl md:text-3xl text-center font-bold text-[#800000]">
              Welcome Back, Educator!
            </h1>
            <p className="mt-2 text-sm text-[#800000]">
              Sign in to access your dashboard
            </p>
          </div>

          {loginError && (
            <div
              id="loginError"
              className="text-red-500 bg-red-50 p-3 rounded-md text-sm"
            >
              Invalid credentials. Please check your username and password.
            </div>
          )}

          {turnstileError && (
            <div
              id="turnstileError"
              className="text-red-500 bg-red-50 p-3 rounded-md text-sm"
            >
              {turnstileError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            id="loginForm"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[#800000]"
              >
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#800000] w-4 h-4" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 border border-[#800000] rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000] text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#800000]"
              >
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#800000] w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 border border-[#800000] rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000] text-sm"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  id="togglePassword"
                  className="absolute top-0 right-0 p-3 focus:outline-none cursor-pointer text-[#800000]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {isTurnstileEnabled && isTurnstileLoaded ? (
              <Turnstile
                key={turnstileKey}
                siteKey={turnstileSiteKey}
                options={{
                  theme: "light",
                }}
                onSuccess={(token) => {
                  console.log("Turnstile token received:", token);
                  setTurnstileError(null);
                }}
                onError={() => {
                  setTurnstileError(
                    "Security verification failed. Please try again."
                  );
                }}
              />
            ) : isTurnstileEnabled ? (
              <div className="w-full h-12 bg-gray-200 rounded animate-pulse"></div>
            ) : null}

            {!isTurnstileEnabled && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                Turnstile is disabled in this environment.
              </p>
            )}

            <input
              id="login-submit"
              name="login-submit"
              type="submit"
              disabled={isLoggingIn}
              value={isLoggingIn ? "Signing in..." : "Sign In"}
              className="w-full bg-[#800000] text-white py-3 px-4 rounded-md hover:bg-[#600000] transition duration-300 text-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </form>
          <div className="text-center">
            <p className="text-xs text-[#800000]">
              Don't have an account? Contact your administrator.
            </p>
          </div>
        </div>
      </section>
      <section
        id="missionSection"
        className="order-2 md:order-1 flex items-center justify-center bg-[#800000] p-4 md:p-6 lg:p-8"
      >
        <div className="max-w-lg text-white flex flex-col gap-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            College of Engineering &amp; Architecture
          </h1>
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
              Mission
            </h2>
            <div className="flex flex-col gap-2 mt-1 text-sm md:text-base">
              <p>
                To create opportunities for the youth of Northern Mindanao, from
                all walks of life, to obtain an education that leads to work and
                improves their families' standard of living.
              </p>
              <p>
                To equip/enable all of our students with the general and
                professional competencies and attitudes that will allow them to
                succeed in their professional choices.
              </p>
              <p>
                To be an active citizen serving the needs of Northern Mindanao
                by producing leaders equipped with the appropriate technical and
                managerial skills and right values, who fuel development and who
                are committed to serving society.
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold">Vision</h2>
            <p className="mt-1 text-sm md:text-base">
              To be the most accessible institute of learning in Northern
              Mindanao that provides an education that makes the lives of our
              students and their families better.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
