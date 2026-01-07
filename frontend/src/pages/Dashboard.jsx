import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { urlAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
    FiLink, FiCopy, FiTrash2, FiExternalLink, 
    FiPlus, FiAlertCircle, FiMousePointer 
} from 'react-icons/fi';

const Dashboard = () => {
    const [urls, setUrls] = useState([]);
    const [newUrl, setNewUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [urlStats, setUrlStats] = useState({ totalUrls: 0, maxUrls: 100, remainingUrls: 100 });
    const [expandedUrl, setExpandedUrl] = useState(null);

    const { isAuthenticated } = useAuth();

    // Fetch URLs on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchUrls();
        }
    }, [isAuthenticated]);

    const fetchUrls = async () => {
        try {
            const response = await urlAPI.getAll();
            setUrls(response.data.urls);
            setUrlStats({
                totalUrls: response.data.totalUrls,
                maxUrls: response.data.maxUrls,
                remainingUrls: response.data.remainingUrls
            });
        } catch (error) {
            toast.error('Failed to fetch URLs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUrl = async (e) => {
        e.preventDefault();

        if (!newUrl) {
            toast.error('Please enter a URL');
            return;
        }

        setCreating(true);

        try {
            const response = await urlAPI.create(newUrl);
            
            if (response.data.limitReached) {
                toast.error(response.data.message);
                return;
            }

            toast.success('URL shortened successfully!');
            setNewUrl('');
            fetchUrls();
        } catch (error) {
            if (error.response?.data?.limitReached) {
                toast.error(
                    <div>
                        <strong>Limit Reached!</strong>
                        <p>Upgrade to Premium for unlimited URLs</p>
                    </div>,
                    { duration: 5000 }
                );
            } else {
                toast.error(error.response?.data?.message || 'Failed to create short URL');
            }
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this URL?')) {
            return;
        }

        try {
            await urlAPI.delete(id);
            toast.success('URL deleted successfully!');
            fetchUrls();
        } catch (error) {
            toast.error('Failed to delete URL');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const truncateUrl = (url, maxLength = 50) => {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage your shortened URLs</p>
                </div>

                {/* Usage Stats */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Usage</h3>
                            <p className="text-gray-600">
                                {urlStats.totalUrls} / {urlStats.maxUrls} URLs used
                            </p>
                        </div>
                        <div className="w-64">
                            <div className="bg-gray-200 rounded-full h-4">
                                <div 
                                    className={`h-4 rounded-full ${
                                        urlStats.remainingUrls <= 10 ? 'bg-red-500' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${(urlStats.totalUrls / urlStats.maxUrls) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {urlStats.remainingUrls <= 10 && (
                        <div className="mt-4 flex items-center bg-yellow-50 text-yellow-800 p-4 rounded-lg">
                            <FiAlertCircle className="text-xl mr-2" />
                            <span>
                                You have only {urlStats.remainingUrls} URLs remaining. 
                                <button className="font-semibold underline ml-1">
                                    Upgrade to Premium
                                </button> for unlimited URLs!
                            </span>
                        </div>
                    )}
                </div>

                {/* Create URL Form */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Create New Short URL
                    </h3>
                    <form onSubmit={handleCreateUrl} className="flex gap-4">
                        <div className="flex-1 relative">
                            <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="url"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="Enter your long URL here (e.g., https://example.com/very/long/url)"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={creating}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
                        >
                            <FiPlus />
                            {creating ? 'Creating...' : 'Shorten'}
                        </button>
                    </form>
                </div>

                {/* URLs Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Your URLs</h3>
                    </div>

                    {urls.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <FiLink className="text-5xl mx-auto mb-4 text-gray-300" />
                            <p>No URLs yet. Create your first short URL above!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Original URL
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Short Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Short URL
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Clicks
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {urls.map((url) => (
                                        <tr key={url.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div 
                                                    className="max-w-xs cursor-pointer"
                                                    onClick={() => setExpandedUrl(expandedUrl === url.id ? null : url.id)}
                                                    title={url.originalUrl}
                                                >
                                                    <span className="text-gray-900">
                                                        {expandedUrl === url.id 
                                                            ? url.originalUrl 
                                                            : truncateUrl(url.originalUrl)
                                                        }
                                                    </span>
                                                    {url.originalUrl.length > 50 && (
                                                        <span className="text-blue-500 text-sm ml-1">
                                                            {expandedUrl === url.id ? '(collapse)' : '(expand)'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-mono">
                                                    {url.shortCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <a 
                                                    href={url.shortUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    {url.shortUrl}
                                                    <FiExternalLink className="text-sm" />
                                                </a>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <FiMousePointer />
                                                    <span className="font-semibold">{url.clicks}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {formatDate(url.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => copyToClipboard(url.shortUrl)}
                                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Copy to clipboard"
                                                    >
                                                        <FiCopy />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(url.id)}
                                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;