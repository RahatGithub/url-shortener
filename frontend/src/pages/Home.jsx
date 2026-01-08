import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLink, FiBarChart2, FiShield, FiZap } from 'react-icons/fi';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* hero section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Shorten Your URLs,
                        <span className="text-blue-600"> Expand Your Reach</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Create short, memorable links in seconds. Track clicks, 
                        manage your URLs, and share with ease.
                    </p>
                    
                    {isAuthenticated ? (
                        <Link
                            to="/dashboard"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition transform hover:scale-105"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <div className="space-x-4">
                            <Link
                                to="/register"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition transform hover:scale-105"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                to="/login"
                                className="inline-block bg-white hover:bg-gray-100 text-gray-800 font-semibold px-8 py-4 rounded-lg text-lg transition border border-gray-300"
                            >
                                Login
                            </Link>
                        </div>
                    )}
                </div>

                {/* features section */}
                <div className="mt-24 grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                        <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                            <FiZap className="text-3xl text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                        <p className="text-gray-600">
                            Create shortened URLs instantly with our powerful engine.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                        <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                            <FiBarChart2 className="text-3xl text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Track Clicks</h3>
                        <p className="text-gray-600">
                            Monitor your link performance with detailed click tracking.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                        <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                            <FiShield className="text-3xl text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                        <p className="text-gray-600">
                            Your links are safe with our secure infrastructure.
                        </p>
                    </div>
                </div>

                {/* stats section */}
                <div className="mt-24 bg-white rounded-xl shadow-lg p-8">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-600">100</div>
                            <div className="text-gray-600 mt-2">Free URLs per user</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-green-600">6-8</div>
                            <div className="text-gray-600 mt-2">Character short codes</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-600">∞</div>
                            <div className="text-gray-600 mt-2">Click tracking</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;