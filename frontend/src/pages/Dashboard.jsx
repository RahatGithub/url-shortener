import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { urlAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    FiLink, FiCopy, FiTrash2, FiExternalLink,
    FiPlus, FiAlertCircle, FiMousePointer
} from 'react-icons/fi';
import { useForm } from 'react-hook-form';

const Dashboard = () => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [expandedUrl, setExpandedUrl] = useState(null);
    const [urlStats, setUrlStats] = useState({
        totalUrls: 0,
        maxUrls: 100,
        remainingUrls: 100
    });

    const { isAuthenticated } = useAuth();
    const { register, handleSubmit, reset } = useForm();

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
        } catch {
            toast.error('Failed to fetch URLs');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        if (!data.url) return;

        setCreating(true);
        try {
            const response = await urlAPI.create(data.url);

            if (response.data.limitReached) {
                toast.error(response.data.message);
                return;
            }

            toast.success('URL shortened successfully!');
            reset();
            fetchUrls();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to create short URL'
            );
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this URL?')) return;

        try {
            await urlAPI.delete(id);
            toast.success('URL deleted successfully!');
            fetchUrls();
        } catch {
            toast.error('Failed to delete URL');
        }
    };

    const handleShortUrlClick = async (url) => {
        window.open(url.shortUrl, '_blank', 'noopener,noreferrer');

        setUrls(prev =>
            prev.map(u =>
                u.id === url.id ? { ...u, clicks: u.clicks + 1 } : u
            )
        );

        try {
            await urlAPI.getAll();
        } catch {
            // silent fail. UI already updated
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const truncateUrl = (url, max = 50) =>
        url.length <= max ? url : url.slice(0, max) + '...';

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

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

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage your shortened URLs</p>
                </div>

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
                                        urlStats.remainingUrls <= 10
                                            ? 'bg-red-500'
                                            : 'bg-blue-600'
                                    }`}
                                    style={{
                                        width: `${(urlStats.totalUrls / urlStats.maxUrls) * 100}%`
                                    }}
                                />
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
                                </button>
                            </span>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Create New Short URL
                    </h3>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4">
                        <div className="flex-1 relative">
                            <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="url"
                                placeholder="Enter your long URL"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                {...register('url', { required: true })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={creating}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50"
                        >
                            <FiPlus />
                            {creating ? 'Creating...' : 'Shorten'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Your URLs
                        </h3>
                    </div>

                    {urls.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <FiLink className="text-5xl mx-auto mb-4 text-gray-300" />
                            <p>No URLs yet. Create your first short URL!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Original URL
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Short Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Short URL
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Clicks
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {urls.map(url => (
                                        <tr key={url.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div
                                                    className="max-w-xs cursor-pointer"
                                                    onClick={() =>
                                                        setExpandedUrl(
                                                            expandedUrl === url.id ? null : url.id
                                                        )
                                                    }
                                                >
                                                    {expandedUrl === url.id
                                                        ? url.originalUrl
                                                        : truncateUrl(url.originalUrl)}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-mono">
                                                    {url.shortCode}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleShortUrlClick(url)}
                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    {url.shortUrl}
                                                    <FiExternalLink className="text-sm" />
                                                </button>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <FiMousePointer />
                                                    <span className="font-semibold">
                                                        {url.clicks}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-gray-500">
                                                {formatDate(url.createdAt)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            copyToClipboard(url.shortUrl)
                                                        }
                                                        className="p-2 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <FiCopy />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(url.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
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
