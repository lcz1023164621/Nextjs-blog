"use client"

import { SearchButton, SearchButtonRef } from "@/modules/ai/search/search-button"
import { useState, useRef } from "react"

export const HomeSearchbar = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const searchButtonRef = useRef<SearchButtonRef>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // 触发 SearchButton 的搜索方法
        searchButtonRef.current?.triggerSearch();
    };

    return(
        <form className="flex w-full max-w-[600px]" onSubmit={handleSearch}>
            
            <div className="relative w-full">
                <input 
                    type="text" 
                    placeholder="Search" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none
                    focus:border-blue-500" 
                />
            </div>

            <SearchButton ref={searchButtonRef} searchQuery={searchQuery} />
            
        </form>
    )
}