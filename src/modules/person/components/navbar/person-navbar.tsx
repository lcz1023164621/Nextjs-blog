'use client';

import { useState } from 'react';
import { BookMarked, Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

type TabType = 'notes' | 'favorites' | 'likes';

interface PersonNavbarProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export const PersonNavbar = ({ 
  activeTab = 'notes',
  onTabChange 
}: PersonNavbarProps) => {
  const [currentTab, setCurrentTab] = useState<TabType>(activeTab);
  const router = useRouter();
  const { user } = useUser();

  const handleTabClick = (tab: TabType) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
    
    // 根据不同的标签页导航到对应路由
    if (user?.id) {
      switch (tab) {
        case 'notes':
          router.push(`/person/${user.id}`);
          break;
        case 'favorites':
          router.push(`/person/${user.id}/favorites`);
          break;
        case 'likes':
          router.push(`/person/${user.id}/likes`);
          break;
      }
    }
  };

  const tabs = [
    { id: 'notes' as TabType, label: '笔记', icon: BookMarked },
    { id: 'favorites' as TabType, label: '收藏', icon: Star },
    { id: 'likes' as TabType, label: '点赞', icon: Heart },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-center gap-8 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex items-center gap-2 py-3 border-b-2 transition-colors relative",
                isActive
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

