'use client'

import React, { useState } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, Share, MessageSquare, Type, ChevronDown, Moon, Sun, Grid2X2, List, History,
  ListOrdered, Heading2, Quote, Code, Link2,
  ImageIcon, Table
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface EditorToolbarProps {
  onShowSidebar: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ onShowSidebar }) => {
  const { theme, setTheme } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const colors = [
    { name: 'Default', color: '#000000' },
    { name: 'Red', color: '#ef4444' },
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Green', color: '#22c55e' },
    { name: 'Yellow', color: '#eab308' },
    { name: 'Purple', color: '#a855f7' },
  ];

  const handleColorClick = (color: string) => {
    try {
      document.execCommand('styleWithCSS', false);
      document.execCommand('foreColor', false, color);
    } catch (error) {
      console.error('Error applying text color:', error);
    }
    setShowColorPicker(false);
  };

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
  };

  return (
    <div className="border-b border-border bg-background">
      <div className="flex items-center p-2 gap-2 max-w-[1200px] mx-auto">
        <div className="flex items-center space-x-1 px-2">
          <button className="p-1.5 hover:bg-secondary rounded text-sm">File</button>
          <button className="p-1.5 hover:bg-secondary rounded text-sm">Edit</button>
          <button className="p-1.5 hover:bg-secondary rounded text-sm">View</button>
          <button className="p-1.5 hover:bg-secondary rounded text-sm">Insert</button>
        </div>
        
        <div className="h-4 w-px bg-border" />
        
        <div className="flex items-center space-x-1">
          <button 
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('bold')}
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button 
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('italic')}
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <button 
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('underline')}
            title="Underline"
          >
            <Underline size={18} />
          </button>
          <button 
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('formatBlock')}
            title="Heading"
          >
            <Heading2 size={18} />
          </button>
          <button 
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('insertUnorderedList')}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button 
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('insertOrderedList')}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </button>
          <button 
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('formatBlock')}
            title="Quote"
          >
            <Quote size={18} />
          </button>
          <button 
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('insertHTML')}
            title="Code Block"
          >
            <Code size={18} />
          </button>
          <button 
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('createLink')}
            title="Insert Link"
          >
            <Link2 size={18} />
          </button>
          <button 
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('insertImage')}
            title="Insert Image"
          >
            <ImageIcon size={18} />
          </button>
          <button 
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('insertHTML')}
            title="Insert Table"
          >
            <Table size={18} />
          </button>
          
          <div className="relative">
            <button 
              className="p-1.5 hover:bg-secondary rounded flex items-center"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Type size={18} />
              <ChevronDown size={14} />
            </button>
            
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-sm py-1 w-32 z-50">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    className="w-full text-left px-3 py-1 hover:bg-secondary flex items-center gap-2"
                    onClick={() => handleColorClick(color.color)}
                  >
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: color.color }}
                    />
                    <span style={{ color: color.color }}>{color.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="h-4 w-px bg-border" />
        
        <div className="flex items-center space-x-1">
          <button className="p-1.5 hover:bg-secondary rounded">
            <AlignLeft size={18} />
          </button>
          <button className="p-1.5 hover:bg-secondary rounded">
            <AlignCenter size={18} />
          </button>
          <button className="p-1.5 hover:bg-secondary rounded">
            <AlignRight size={18} />
          </button>
        </div>
        
        <div className="flex-1" />
        
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 hover:bg-secondary rounded"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button 
          onClick={onShowSidebar}
          className="p-1.5 hover:bg-secondary rounded mr-2"
        >
          <History size={18} />
        </button>
        
        <button className="flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          <Share size={18} className="mr-2" />
          Share
        </button>
      </div>
    </div>
  );
}; 