"use client";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./lib/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import UserAvatar from './components/UserAvatar'

export default function Home() {
	const [user] = useAuthState(auth);
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = useState(false);
	const token = localStorage.getItem("authToken");

	const handleSignOut = async () => {
		setIsSigningOut(true);
		const success = await signOut(auth);
		localStorage.removeItem("authToken");
	};

	// Use useEffect to check authentication status
	useEffect(() => {
		const token = localStorage.getItem("authToken");
		if (!user || !token) {
			router.push("/sign-in");
		}
	}, [user, router]);
	console.log({ user });
	
	return (
		<div className="min-h-screen bg-gray-100 p-8">
			<div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
				<h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
					Welcome to Firebase Auth Demo
				</h1>

				<div className="bg-gray-50 p-4 rounded-lg mb-6">
					<h2 className="text-xl font-semibold mb-3">
						User Information
					</h2>
					<UserAvatar user={user} className={'absolute top-15 right-5'}/>
					<p className="text-lg mb-2">
						<strong>Name:</strong>{" "}
						{user?.displayName || "Not provided"}
					</p>
					<p className="text-lg mb-2">
						<strong>Email:</strong> {user?.email}
					</p>
					<p className="text-lg mb-2">
						<strong>Email Verified:</strong>{" "}
						{user?.emailVerified ? "Yes" : "No"}
					</p>
					<p className="text-lg">
						<strong>User ID:</strong> {user?.uid}
					</p>
				</div>

				<div className="flex justify-center">
					<button
						onClick={handleSignOut}
						disabled={isSigningOut}
						className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
					>
						{isSigningOut ? "Signing out..." : "Sign Out"}
					</button>
				</div>
			</div>
		</div>
	);
}
