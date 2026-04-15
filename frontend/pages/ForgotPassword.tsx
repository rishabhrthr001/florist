import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, ShieldCheck } from "lucide-react";
import Button from "../components/Button";
import { toast } from "sonner";
import axios from "axios";
import API from "../config";

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"email" | "otp">("email");

    const handleSendOTP = async () => {
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API}/auth/forgot-password`, { email });
            setStep("otp");
            toast.success(response.data.msg || "OTP sent to your email!");
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.msg || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) {
            toast.error("Please enter OTP and new password");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API}/auth/reset-password`, {
                email,
                otp,
                newPassword
            });
            toast.success(response.data.msg || "Password reset successful!");
            navigate("/login");
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.msg || "Failed to reset password");
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
                        Recover Your <br /> Access.
                    </h2>
                    <p className="text-white/60 max-w-sm font-light">
                        {step === "email" 
                            ? "We'll send a 6-digit code to your registered email address."
                            : "Enter the code we sent and choose your new password."}
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
                        onClick={() => step === "otp" ? setStep("email") : navigate("/login")}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors mb-12"
                    >
                        <ArrowLeft size={14} /> {step === "otp" ? "Change Email" : "Back to Login"}
                    </button>

                    <div className="mb-12">
                        <h1 className="font-serif text-4xl text-[#1A1A1A] mb-2 font-bold">
                            {step === "email" ? "Forgot Password?" : "Reset Password"}
                        </h1>
                        <p className="text-gray-500 font-light text-sm">
                            {step === "email" 
                                ? "Enter your email and we'll send you an OTP."
                                : `We've sent a code to ${email}`}
                        </p>
                    </div>

                    <form
                        className="space-y-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            step === "email" ? handleSendOTP() : handleResetPassword();
                        }}
                    >
                        {step === "email" ? (
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
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                        Verification Code
                                    </label>
                                    <div className="relative group">
                                        <ShieldCheck
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F8BBD0] transition-colors"
                                            size={18}
                                        />
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="123456"
                                            className="w-full h-14 tracking-[1em] font-bold bg-white border border-gray-100 rounded-2xl pl-12 pr-6 text-center text-lg focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                        New Password
                                    </label>
                                    <div className="relative group">
                                        <Lock
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F8BBD0] transition-colors"
                                            size={18}
                                        />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <Button
                            variant="primary"
                            type="submit"
                            className="w-full h-14 shadow-lg"
                            disabled={loading}
                        >
                            {loading 
                                ? "Processing..." 
                                : (step === "email" ? "Send OTP" : "Update Password")}
                        </Button>
                    </form>

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
