import { Link } from "react-router-dom";
import {
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope
} from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-[#172337] text-slate-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

                {/* TOP GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

                    {/* BRAND */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 bg-[#2874F0] rounded-lg flex items-center justify-center text-white text-xl">
                                👑
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    RV Gift Shop & Printing
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Gifts for every occasion
                                </p>
                            </div>
                        </div>

                        <p className="text-sm leading-relaxed mb-5">
                            Premium gifts, fast delivery and trusted service.
                            Order online and get gifts delivered with care.
                        </p>

                        {/* SOCIAL */}
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="w-9 h-9 bg-white/10 hover:bg-[#2874F0] rounded-full flex items-center justify-center transition"
                                aria-label="Facebook"
                            >
                                <FaFacebookF />
                            </a>
                            <a
                                href="https://www.instagram.com/rv_gift_shop_and_printing/"
                                className="w-9 h-9 bg-white/10 hover:bg-[#2874F0] rounded-full flex items-center justify-center transition"
                                aria-label="Instagram"
                            >
                                <FaInstagram />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 bg-white/10 hover:bg-[#2874F0] rounded-full flex items-center justify-center transition"
                                aria-label="Twitter"
                            >
                                <FaTwitter />
                            </a>
                        </div>
                    </div>

                    {/* QUICK LINKS */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase">
                            Quick Links
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="hover:text-white">Home</Link></li>
                            <li><Link to="/products" className="hover:text-white">Products</Link></li>
                            <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
                            <li><Link to="/orders" className="hover:text-white">My Orders</Link></li>
                        </ul>
                    </div>

                    {/* CATEGORIES */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase">
                            Categories
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/?category=gift" className="hover:text-white">Gifts</Link></li>
                            <li><Link to="/?category=toys" className="hover:text-white">Toys</Link></li>
                            <li><Link to="/?category=watch" className="hover:text-white">Watches</Link></li>
                            <li><Link to="/?category=custom" className="hover:text-white">Customized</Link></li>
                        </ul>
                    </div>

                    {/* CONTACT */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase">
                            Contact
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <FaMapMarkerAlt className="mt-1" />
                                <a href="https://maps.app.goo.gl/bpjDdpu4dJL3DcvT9"> Shop Location</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <FaPhoneAlt />
                                <a href="tel:+919876543210" className="hover:text-white">
                                    +09792770976
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <FaEnvelope />
                                <a
                                    href="mailto:hello@rvgiftshop.com"
                                    className="hover:text-white"
                                >
                                    hello@rvgiftshop.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="border-t border-white/10 pt-6 text-center text-xs sm:text-sm text-slate-400">
                    <p>
                        © {new Date().getFullYear()} RV Gift Shop & Printing. All rights reserved.
                    </p>
                    <p className="mt-1">
                        Built with MERN Stack • Made in India 🇮🇳 •
                        <a href="https://your-portfolio-link" target="_blank" className="underline">
                            Dhananjay Pandey
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;