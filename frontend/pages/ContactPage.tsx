import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Mail, Phone, User, MessageSquare, Send, ArrowLeft } from "lucide-react";
import Button from "../components/Button";
import API from "../config";

const ContactPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phone || !formData.message) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API}/contact`, formData);
            toast.success("Message sent successfully! We'll get back to you soon 🌸");
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        } catch (err) {
            toast.error("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] font-sans">
            {/* Hero Section */}
            <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                <img
                    src="/loginbg.png"
                    alt="Contact Us"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold mb-4 opacity-70"
                    >
                        Get in Touch
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-serif text-4xl md:text-6xl italic font-bold"
                    >
                        Contact Us
                    </motion.h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-24">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors mb-12"
                >
                    <ArrowLeft size={14} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Info Section */}
                    <div>
                        <h2 className="font-serif text-3xl text-[#1A1A1A] mb-4 font-bold">
                            We'd Love to Hear From You
                        </h2>
                        <p className="text-gray-500 font-light mb-8">
                            Have questions about our floral arrangements or need help with a custom order?
                            Our team is here to assist you with anything you need.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#FDF2F5] rounded-full flex items-center justify-center">
                                    <Phone size={20} className="text-[#F8BBD0]" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">
                                        Phone
                                    </p>
                                    <p className="font-semibold">+91 98765 43210</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#FDF2F5] rounded-full flex items-center justify-center">
                                    <Mail size={20} className="text-[#F8BBD0]" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">
                                        Email
                                    </p>
                                    <p className="font-semibold">hello@mangalamflorist.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                    >
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                    Full Name *
                                </label>
                                <div className="relative group">
                                    <User
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F8BBD0] transition-colors"
                                        size={18}
                                    />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your name"
                                        className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                    Email Address *
                                </label>
                                <div className="relative group">
                                    <Mail
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F8BBD0] transition-colors"
                                        size={18}
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@example.com"
                                        className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                    Phone Number *
                                </label>
                                <div className="relative group">
                                    <Phone
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F8BBD0] transition-colors"
                                        size={18}
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="What's this about?"
                                    className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-6 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all shadow-sm"
                                />
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                    Message *
                                </label>
                                <div className="relative group">
                                    <MessageSquare
                                        className="absolute left-4 top-4 text-gray-300 group-focus-within:text-[#F8BBD0] transition-colors"
                                        size={18}
                                    />
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us how we can help..."
                                        rows={4}
                                        className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all shadow-sm resize-none"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full h-14 shadow-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    "Sending..."
                                ) : (
                                    <>
                                        <Send size={18} className="mr-2" />
                                        Send Message
                                    </>
                                )}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
