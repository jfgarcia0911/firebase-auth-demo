"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Moon, Sun, Mail, Lock, User } from "lucide-react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, googleProvider, db } from "../../firebase/config";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const [signInWithEmailAndPassword , user, loading, error] = 
    useSignInWithEmailAndPassword(auth);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to get the ID token
  const getIdToken = async (user) => {
    try {
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.error("Error getting ID token:", error);
      throw error;
    }
  };

  // Function to save token to localStorage
  const saveToken = (token) => {
    localStorage.setItem('authToken', token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Sign in with email and password
        const res = await signInWithEmailAndPassword(
          formData.email,
          formData.password
        );

        if (res) {
          // Get the ID token
          const token = await getIdToken(res.user);
          
          // Save the token
          saveToken(token);
          
          console.log("User signed in:", res.user);
          console.log("Auth token:", token);
          
          // Redirect to dashboard or home page
          router.push('/');
        }
      } catch (error) {
        console.error("Sign in error:", error);
        alert(`Sign in failed: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get the ID token
      const token = await getIdToken(user);
      
      // Save the token
      saveToken(token);

      console.log("Google user:", user);
      console.log("Auth token:", token);

      // Check if user exists in Firestore, if not create a record
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          provider: "google",
          createdAt: new Date(),
        });
        console.log("New user created in Firestore");
      }

      // Redirect to dashboard or home page
      router.push('/');
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert(error.message);
    }
  };

  // Verify token on component mount (optional)
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        // You can verify the token with your backend here
        console.log("Found existing token:", token);
        // If token exists, redirect to dashboard
        router.push('/');
      }
    };
    
    verifyToken();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    if (user) {
      console.log("User signed in:", user);
      // router.push('/');
    }

    if (error) {
      console.log("Sign in error:", error);
      alert(`Sign in failed: ${error.message}`);
    }
  }, [user, error, router]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        darkMode
          ? "dark bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${
            darkMode
              ? "bg-gray-800 text-yellow-300 hover:bg-gray-700"
              : "bg-white text-gray-700 hover:bg-gray-100"
          } shadow-md transition-colors duration-300`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div
        className={`max-w-md w-full p-8 rounded-2xl shadow-xl transition-colors duration-300 ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        }`}
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Sign in to your account
          </h2>
          <p
            className={`mt-2 text-center text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Welcome back! Please sign in to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail 
                    size={18} 
                    className={darkMode ? "text-gray-400" : "text-gray-500"} 
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 block w-full px-4 py-3 rounded-lg border ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : darkMode
                      ? "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900"
                  } transition-colors duration-300`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock 
                    size={18} 
                    className={darkMode ? "text-gray-400" : "text-gray-500"} 
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 block w-full px-4 py-3 rounded-lg border ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : darkMode
                      ? "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900"
                  } transition-colors duration-300`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={20}
                      className={
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }
                    />
                  ) : (
                    <Eye
                      size={20}
                      className={
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }
                    />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-4 w-4 rounded ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"
                    : "border-gray-300 text-blue-500 focus:ring-blue-600"
                }`}
              />
              <label
                htmlFor="remember-me"
                className={`ml-2 block text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-blue-500 hover:text-blue-400 transition-colors duration-300"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                darkMode
                  ? "focus:ring-blue-500 focus:ring-offset-gray-800"
                  : "focus:ring-blue-500"
              } transition-colors duration-300 shadow-md`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? "border-gray-600" : "border-gray-300"}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
                style={{
                  backgroundColor: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : 'gray-700'
                }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="text-center">
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Dont have an account?{" "}
              <a
                href="/sign-up"
                className="font-medium text-blue-500 hover:text-blue-400 transition-colors duration-300"
              >
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;