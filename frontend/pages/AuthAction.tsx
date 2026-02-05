import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import {
    sendPasswordResetEmail,
    confirmPasswordReset,
    applyActionCode
} from "firebase/auth";
import { auth } from "../lib/firebase";
import Button from "../components/Button";
import { toast } from "sonner";

const AuthAction: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const mode = searchParams.get("mode"); // resetPassword, verifyEmail
    const oobCode = searchParams.get("oobCode"); // The action code from Firebase

    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Handle password reset confirmation
    const handlePasswordReset = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (!oobCode) {
            toast.error("Invalid reset link");
            return;
        }

        try {
            setLoading(true);
            await confirmPasswordReset(auth, oobCode, newPassword);
            setSuccess(true);
            toast.success("Password reset successful!");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to reset password");
            toast.error("Failed to reset password. Link may be expired.");
        } finally {
            setLoading(false);
        }
    };

    // Handle email verification
    const handleVerifyEmail = async () => {
        if (!oobCode) {
            setError("Invalid verification link");
            return;
        }

        try {
            setLoading(true);
            await applyActionCode(auth, oobCode);
            setSuccess(true);
            toast.success("Email verified successfully!");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to verify email");
            toast.error("Verification failed. Link may be expired.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-verify email on page load
    React.useEffect(() => {
        if (mode === "verifyEmail" && oobCode) {
            handleVerifyEmail();
        }
    }, [mode, oobCode]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF9F6] font-sans p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10"
            >
                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors mb-8"
                >
                    <ArrowLeft size={14} /> Back to Login
                </button>

                {mode === "resetPassword" && (
                    <>
                        <h1 className="font-serif text-3xl text-[#1A1A1A] mb-2 font-bold">
                            Reset Password
                        </h1>
                        <p className="text-gray-500 font-light text-sm mb-8">
                            Enter your new password below.
                        </p>

                        {success ? (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-4">✅</div>
                                <p className="text-green-600 font-medium">Password reset successful!</p>
                                <p className="text-gray-500 text-sm mt-2">Redirecting to login...</p>
                            </div>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                        New Password
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F8BBD0] transition-colors" size={18} />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                        Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F8BBD0] transition-colors" size={18} />
                                        <input
                                            type="password"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all"
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-sm">{error}</p>}

                                <Button variant="primary" type="submit" className="w-full h-14" disabled={loading}>
                                    {loading ? "Resetting..." : "Reset Password"}
                                </Button>
                            </form>
                        )}
                    </>
                )}

                {mode === "verifyEmail" && (
                    <div className="text-center py-8">
                        {loading && (
                            <>
                                <div className="text-5xl mb-4 animate-pulse">📧</div>
                                <p className="text-gray-600 font-medium">Verifying your email...</p>
                            </>
                        )}
                        {success && (
                            <>
                                <div className="text-5xl mb-4">✅</div>
                                <p className="text-green-600 font-medium">Email verified successfully!</p>
                                <p className="text-gray-500 text-sm mt-2">Redirecting to login...</p>
                            </>
                        )}
                        {error && (
                            <>
                                <div className="text-5xl mb-4">❌</div>
                                <p className="text-red-600 font-medium">Verification failed</p>
                                <p className="text-gray-500 text-sm mt-2">{error}</p>
                            </>
                        )}
                    </div>
                )}

                {!mode && (
                    <div className="text-center py-8">
                        <div className="text-5xl mb-4">🔗</div>
                        <p className="text-gray-600 font-medium">Invalid or expired link</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="mt-4 text-[#F8BBD0] hover:underline"
                        >
                            Go to Login
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AuthAction;
