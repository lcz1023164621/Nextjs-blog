'use client';

import { BookMarked, Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

type TabType = 'notes' | 'favorites' | 'likes';

interface PersonNavbarProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export const PersonNavbar = ({ 
  activeTab,
  onTabChange 
}: PersonNavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  
  // 根据当前路径判断激活的标签页
  const getCurrentTab = (): TabType => {
    if (activeTab) return activeTab;
    
    if (pathname.includes('/likes')) return 'likes';
    if (pathname.includes('/favourites')) return 'favorites';
    return 'notes';
  };
  
  const currentTab = getCurrentTab();

  const handleTabClick = (tab: TabType) => {
    onTabChange?.(tab);
    
    // 根据不同的标签页导航到对应路由
    if (user?.id) {
      switch (tab) {
        case 'notes':
          router.push(`/person/${user.id}`);
          break;
        case 'favorites':
          router.push(`/person/${user.id}/favourites`);
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

