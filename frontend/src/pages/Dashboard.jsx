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

    const handleShortUrlClick = (url) => {
        window.open(url.shortUrl, '_blank', 'noopener,noreferrer');
        setUrls(prev =>
            prev.map(u =>
                u.id === url.id ? { ...u, clicks: u.clicks + 1 } : u
            )
        );
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const truncateUrl = (url, max = 40) =>
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage your shortened URLs
                    </p>
                </div>

                {/* Usage */}
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-gray-800">Usage</h3>
                            <p className="text-gray-600">
                                {urlStats.totalUrls} / {urlStats.maxUrls} URLs used
                            </p>
                        </div>

                        <div className="w-full sm:w-64">
                            <div className="bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full ${
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
                        <div className="mt-4 flex items-center bg-yellow-50 text-yellow-800 p-3 rounded-lg">
                            <FiAlertCircle className="mr-2" />
                            <span>
                                Only {urlStats.remainingUrls} URLs remaining.
                                <button className="underline ml-1 font-semibold">
                                    Upgrade
                                </button>
                            </span>
                        </div>
                    )}
                </div>

                {/* Create URL */}
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
                    <h3 className="font-semibold mb-4">Create New Short URL</h3>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col sm:flex-row gap-3"
                    >
                        <div className="flex-1 relative">
                            <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="url"
                                placeholder="Enter your long URL"
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                {...register('url', { required: true })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={creating}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
                        >
                            <FiPlus />
                            {creating ? 'Creating...' : 'Shorten'}
                        </button>
                    </form>
                </div>

                {/* MOBILE VIEW */}
                <div className="md:hidden space-y-4">
                    {urls.map(url => (
                        <div key={url.id} className="bg-white rounded-xl shadow p-4 space-y-3">
                            <div
                                onClick={() =>
                                    setExpandedUrl(expandedUrl === url.id ? null : url.id)
                                }
                                className="text-sm text-gray-700 break-all cursor-pointer"
                            >
                                {expandedUrl === url.id
                                    ? url.originalUrl
                                    : truncateUrl(url.originalUrl)}
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    onClick={() => handleShortUrlClick(url)}
                                    className="text-blue-600 flex items-center gap-1"
                                >
                                    {truncateUrl(url.shortUrl, 30)}
                                    <FiExternalLink />
                                </button>
                                <span className="flex items-center gap-1 text-gray-600">
                                    <FiMousePointer /> {url.clicks}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                    {formatDate(url.createdAt)}
                                </span>
                                <div className="flex gap-3">
                                    <button onClick={() => copyToClipboard(url.shortUrl)}>
                                        <FiCopy />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(url.id)}
                                        className="text-red-600"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs text-gray-500">Original</th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500">Code</th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500">Short URL</th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500">Clicks</th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500">Created</th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {urls.map(url => (
                                <tr key={url.id}>
                                    <td className="px-6 py-4 max-w-xs truncate">
                                        {url.originalUrl}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                                            {url.shortCode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleShortUrlClick(url)}
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            {url.shortUrl}
                                            <FiExternalLink />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">{url.clicks}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {formatDate(url.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => copyToClipboard(url.shortUrl)}>
                                            <FiCopy />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(url.id)}
                                            className="text-red-600"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
