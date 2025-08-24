"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Moon, Sun, ArrowBigDownDash } from "lucide-react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, googleProvider, db } from "../../firebase/config";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const SignupPage = () => {
	const [createUserWithEmailAndPassword, user, error] = useCreateUserWithEmailAndPassword(auth);
	const [darkMode, setDarkMode] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const router = useRouter()
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const toggleDarkMode = () => {
		setDarkMode(!darkMode);
		// document.documentElement.classList.toggle('dark');
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

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Email is invalid";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

    //Used for email and password sign in
	const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Create user with email and password
        const res = await createUserWithEmailAndPassword(
          formData.email,
          formData.password
        );
        console.log({res})
        if (res) {
          // Save user to Firestore
          await setDoc(doc(db, "users", res.user.uid), {
            uid: res.user.uid,
            name: formData.name,
            email: formData.email,
            photoURL: '',
            provider: "email",
            createdAt: new Date(),
          });

          console.log("User created and saved to Firestore:", res.user);
          alert("Account created successfully! Your data has been saved.");
        }
      } catch (error) {
        console.error("Signup error:", error);
        alert(`Signup failed: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

    //Used for Google sign in
	const handleGoogleSignIn = async () => {
		router.push('/sign-in')
    // try {
    //   // Sign in with Google
    //   const result = await signInWithPopup(auth, googleProvider);
    //   const user = result.user;

    //   console.log("Google user:", user);

    //   // Save user to Firestore
    //   await setDoc(doc(db, "users", user.uid), {
    //     uid: user.uid,
    //     name: user.displayName,
    //     email: user.email,
    //     photoURL: user.photoURL,
    //     provider: "google",
    //     createdAt: new Date(),
    //   });

    //   alert(`Welcome ${user.displayName}! Your account is saved.`);
    // } catch (error) {
    //   console.error("Google sign-in error:", error);
    //   alert(error.message);
    // }
  };

	// React will re-render when `user` or `error` changes
	useEffect(() => {
		if (user) {
			console.log("User created:", user.user);
			alert("Account created successfully!");
		}

		if (error) {
			console.log("🔥 Raw error object:", error);
			alert("Signup failed. Check console for details.");
		}
	}, [user, error]);

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
				className={`max-w-md w-full  p-8 rounded-2xl shadow-xl transition-colors duration-300 ${
					darkMode
						? "bg-gray-800 text-white"
						: "bg-white text-gray-800"
				}`}
			>
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold">
						Create your account
					</h2>
					<p
						className={`mt-2 text-center text-sm ${
							darkMode ? "text-gray-400" : "text-gray-600"
						}`}
					>
						Join us today and unlock exclusive features
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium mb-1"
							>
								Full Name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								value={formData.name}
								onChange={handleChange}
								className={` block w-full px-4 py-3 rounded-lg border ${
									errors.name
										? "border-red-500 focus:ring-red-500 focus:border-red-500"
										: darkMode
										? "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
										: "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
								} focus:outline-none focus:ring-2 ${
									darkMode
										? "bg-gray-700 text-white"
										: "bg-white text-gray-900"
								} transition-colors duration-300`}
								placeholder="Enter your full name"
							/>
							{errors.name && (
								<p className="mt-1 text-sm text-red-500">
									{errors.name}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium mb-1"
							>
								Email address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleChange}
								className={`relative block w-full px-4 py-3 rounded-lg border ${
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
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									value={formData.password}
									onChange={handleChange}
									className={`relative block w-full px-4 py-3 rounded-lg border ${
										errors.password
											? "border-red-500 focus:ring-red-500 focus:border-red-500"
											: darkMode
											? "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
											: "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
									} focus:outline-none focus:ring-2 ${
										darkMode
											? "bg-gray-700 text-white"
											: "bg-white text-gray-900"
									} transition-colors duration-300 pr-12`}
									placeholder="Create a password"
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

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium mb-1"
							>
								Confirm Password
							</label>
							<div className="relative">
								<input
									id="confirmPassword"
									name="confirmPassword"
									type={
										showConfirmPassword
											? "text"
											: "password"
									}
									value={formData.confirmPassword}
									onChange={handleChange}
									className={`relative block w-full px-4 py-3 rounded-lg border ${
										errors.confirmPassword
											? "border-red-500 focus:ring-red-500 focus:border-red-500"
											: darkMode
											? "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
											: "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
									} focus:outline-none focus:ring-2 ${
										darkMode
											? "bg-gray-700 text-white"
											: "bg-white text-gray-900"
									} transition-colors duration-300 pr-12`}
									placeholder="Confirm your password"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={() =>
										setShowConfirmPassword(
											!showConfirmPassword
										)
									}
								>
									{showConfirmPassword ? (
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
							{errors.confirmPassword && (
								<p className="mt-1 text-sm text-red-500">
									{errors.confirmPassword}
								</p>
							)}
						</div>
					</div>

					<div className="flex items-center">
						<input
							id="terms"
							name="terms"
							type="checkbox"
							className={`h-4 w-4 rounded ${
								darkMode
									? "bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"
									: "border-gray-300 text-blue-500 focus:ring-blue-600"
							}`}
						/>
						<label
							htmlFor="terms"
							className={`ml-2 block text-sm ${
								darkMode ? "text-gray-300" : "text-gray-700"
							}`}
						>
							I agree to the{" "}
							<a
								href="#"
								className="font-medium text-blue-500 hover:text-blue-400"
							>
								Terms and Conditions
							</a>
						</label>
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
									Creating account...
								</span>
							) : (
								"Sign up"
							)}
						</button>
					</div>

					<div className="text-center">
						<p
							className={`text-sm ${
								darkMode ? "text-gray-400" : "text-gray-600"
							}`}
						>
							Already have an account?{" "}
							<a
								onClick={handleGoogleSignIn}
								href="#"
								className="font-medium text-blue-500 hover:text-blue-400 transition-colors duration-300"
							>
								Sign in
							</a>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SignupPage;
