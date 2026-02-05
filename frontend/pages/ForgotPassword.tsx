import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import Button from "../components/Button";
import { toast } from "sonner";

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSendResetEmail = async () => {
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email, {
                url: `${window.location.origin}/login`, // Redirect after reset
            });
            setSent(true);
            toast.success("Password reset email sent!");
        } catch (err: any) {
            console.error(err);
            if (err.code === "auth/user-not-found") {
                toast.error("No account found with this email");
            } else if (err.code === "auth/invalid-email") {
                toast.error("Invalid email address");
            } else {
                toast.error("Failed to send reset email");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#FAF9F6] font-sans">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden h-screen sticky top-0">
                <img
                    src="/loginbg.png"
                    alt="Signature Floral Backdrop"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                <div className="absolute inset-0 flex flex-col justify-end p-20 text-white">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4 opacity-70">
                        The Mangalam Experience
                    </span>
                    <h2 className="font-serif text-6xl italic font-bold mb-6">
                        Reset Your <br /> Password.
                    </h2>
                    <p className="text-white/60 max-w-sm font-light">
                        We'll send you a link to reset your password.
                    </p>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <button
                        onClick={() => navigate("/login")}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors mb-12"
                    >
                        <ArrowLeft size={14} /> Back to Login
                    </button>

                    <div className="mb-12">
                        <h1 className="font-serif text-4xl text-[#1A1A1A] mb-2 font-bold">
                            Forgot Password?
                        </h1>
                        <p className="text-gray-500 font-light text-sm">
                            Enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    {sent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 bg-green-50 rounded-3xl"
                        >
                            <div className="text-6xl mb-4">📧</div>
                            <h3 className="font-serif text-2xl text-[#1A1A1A] mb-2 font-bold">
                                Check Your Email
                            </h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                            <button
                                onClick={() => setSent(false)}
                                className="mt-6 text-[#F8BBD0] hover:underline text-sm font-medium"
                            >
                                Didn't receive it? Send again
                            </button>
                        </motion.div>
                    ) : (
                        <form
                            className="space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendResetEmail();
                            }}
                        >
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F8BBD0] transition-colors"
                                        size={18}
                                    />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-full h-14 shadow-lg"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </form>
                    )}

                    <p className="mt-12 text-center text-xs text-gray-500">
                        Remember your password?
                        <button
                            onClick={() => navigate("/login")}
                            className="ml-1 font-bold text-[#F8BBD0] hover:underline uppercase tracking-tighter"
                        >
                            Login
                        </button>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
