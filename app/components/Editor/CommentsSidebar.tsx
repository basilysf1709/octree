'use client'

import React from 'react';
import { MessageSquare } from 'lucide-react';

export const CommentsSidebar: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Comments</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              JD
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">John Doe</span>
                <span className="text-sm text-gray-500">2h ago</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                We should add more details to this section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 