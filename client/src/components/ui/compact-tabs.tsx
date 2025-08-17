import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  countColor?: string;
}

interface CompactTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  activeColor?: string;
  className?: string;
}

export const CompactTabs: React.FC<CompactTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  activeColor = 'blue',
  className = ''
}) => {
  const getActiveColorClasses = () => {
    switch (activeColor) {
      case 'red':
        return 'bg-white text-red-600 shadow-sm';
      case 'blue':
        return 'bg-white text-blue-600 shadow-sm';
      case 'green':
        return 'bg-white text-green-600 shadow-sm';
      default:
        return 'bg-white text-blue-600 shadow-sm';
    }
  };

  const getCountColorClasses = (countColor?: string) => {
    switch (countColor) {
      case 'red':
        return 'bg-red-500 text-white';
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'green':
        return 'bg-green-500 text-white';
      default:
        return 'bg-red-500 text-white';
    }
  };

  return (
    <div className={`flex space-x-0.5 bg-gray-100 p-0.5 rounded-lg ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
              isActive
                ? getActiveColorClasses()
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-3 h-3 inline mr-1" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-1 rounded-full text-[10px] px-1.5 py-0.5 ${getCountColorClasses(tab.countColor)}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CompactTabs;
