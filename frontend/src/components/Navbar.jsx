import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiLink,
    FiLogOut,
    FiUser,
    FiMenu,
    FiX
} from 'react-icons/fi';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setOpen(false);
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <FiLink className="text-2xl text-blue-600" />
                        <span className="text-xl font-bold text-gray-800">
                            URL Shortener
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="text-gray-600 hover:text-blue-600 font-medium transition"
                                >
                                    Dashboard
                                </Link>

                                <div className="flex items-center space-x-2 text-gray-600">
                                    <FiUser />
                                    <span className="text-sm">{user?.email}</span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                                >
                                    <FiLogOut />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-blue-600 font-medium transition"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden text-gray-600 text-2xl"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                onClick={() => setOpen(false)}
                                className="block text-gray-600 hover:text-blue-600 font-medium"
                            >
                                Dashboard
                            </Link>

                            <div className="flex items-center space-x-2 text-gray-600">
                                <FiUser />
                                <span className="text-sm break-all">
                                    {user?.email}
                                </span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                            >
                                <FiLogOut />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                onClick={() => setOpen(false)}
                                className="block text-center text-gray-600 hover:text-blue-600 font-medium"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                onClick={() => setOpen(false)}
                                className="block bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg transition"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
