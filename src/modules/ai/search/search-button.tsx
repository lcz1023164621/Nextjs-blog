"use client"

import { SearchIcon, Loader2 } from "lucide-react"
import { trpc } from "@/trpc/client"
import { useState, useImperativeHandle, forwardRef } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

interface SearchButtonProps {
    searchQuery: string;
}

export interface SearchButtonRef {
    triggerSearch: () => void;
}

interface SearchResult {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    author: {
        id: string;
        username: string;
        avatar: string | null;
    };
}

interface SearchResponse {
    success: boolean;
    query: string;
    expandedKeywords?: string[];
    total: number;
    results: SearchResult[];
    aiSummary: string;
}

export const SearchButton = forwardRef<SearchButtonRef, SearchButtonProps>(({ searchQuery }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);

    const searchMutation = trpc.ai.search.useMutation({
        onSuccess: (data) => {
            setSearchResults(data);
            setIsOpen(true);
            if (data.total === 0) {
                toast.info('未找到相关结果');
            } else {
                toast.success(`找到 ${data.total} 条相关结果`);
            }
        },
        onError: (error) => {
            toast.error(error.message || '搜索失败');
        },
    });

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            toast.error('请输入搜索关键词');
            return;
        }
        searchMutation.mutate({ query: searchQuery, limit: 10 });
    };

    // 暴露搜索方法给父组件
    useImperativeHandle(ref, () => ({
        triggerSearch: handleSearch
    }));

    return (
        <>
            <button 
                type="button"
                onClick={handleSearch}
                disabled={searchMutation.isPending}
                className="px-5 py-2.5 bg-gray-100 border border-l-0 rounded-r-full
                hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {searchMutation.isPending ? (
                    <Loader2 className="size-5 animate-spin" />
                ) : (
                    <SearchIcon className="size-5"/>
                )}
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>搜索结果：{searchResults?.query}</DialogTitle>
                    </DialogHeader>
                    
                    {searchResults && (
                        <div className="space-y-4">
                            {/* 扩展关键词 */}
                            {searchResults.expandedKeywords && searchResults.expandedKeywords.length > 1 && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-gray-600">相关关键词：</span>
                                        {searchResults.expandedKeywords.map((keyword, index) => (
                                            <span 
                                                key={index}
                                                className="inline-block px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI 总结 */}
                            {searchResults.aiSummary && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <span className="text-blue-600 font-semibold text-sm">AI 总结：</span>
                                        <p className="text-sm text-gray-700 flex-1">{searchResults.aiSummary}</p>
                                    </div>
                                </div>
                            )}

                            {/* 搜索结果 */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                    共找到 {searchResults.total} 条结果
                                </h3>
                                
                                {searchResults.results.length > 0 ? (
                                    <div className="space-y-3">
                                        {searchResults.results.map((result: SearchResult) => (
                                            <Link 
                                                key={result.id} 
                                                href={`/post/${result.id}`}
                                                onClick={() => setIsOpen(false)}
                                                className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <h4 className="font-semibold text-gray-900 mb-2">{result.title}</h4>
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                    {result.content}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>作者：{result.author.username}</span>
                                                    <span>•</span>
                                                    <span>{new Date(result.createdAt).toLocaleDateString('zh-CN')}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">暂无结果</p>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
});

SearchButton.displayName = 'SearchButton';
