// components/UserAvatar.jsx
"use client";
import Image from "next/image";
import { useState } from "react";

const UserAvatar = ({ user, size = "md", className = "" }) => {
	const [imageError, setImageError] = useState(false);
	const sizeClasses = {
		sm: "w-8 h-8 text-xs",
		md: "w-12 h-12 text-sm",
		lg: "w-24 h-24 text-2xl",
		xl: "w-32 h-32 text-3xl",
	};

	// Generate background color based on user ID or name
	const generateBackgroundColor = (seed) => {
		const colors = [
			"bg-blue-500",
			"bg-green-500",
			"bg-purple-500",
			"bg-red-500",
			"bg-yellow-500",
			"bg-pink-500",
			"bg-indigo-500",
			"bg-teal-500",
			"bg-orange-500",
		];
		const index = seed ? seed.charCodeAt(0) % colors.length : 0;

		return colors[index];
	};

	// Get user initials
	const getInitials = () => {
		if (user?.displayName) {
			return user.displayName
				.split(" ")
				.map((name) => name[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);
		}
		if (user?.email) {
			return user.email[0].toUpperCase();
		}
		return "U";
	};

	const bgColor = generateBackgroundColor(user?.uid || user?.email);

	if (user?.photoURL && !imageError) {
		return (
			<Image
				src={user.photoURL}
                width={96}
                height={96}
				alt="Profile"
				className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
				onError={() => setImageError(true)}
			/>
		);
	}

	return (
		<div
			className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
		>
			{getInitials()}
		</div>
	);
};

export default UserAvatar;
