import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getBaseUrl = () => {
  return process.env.ENVIRONMENT === 'dev' 
    ? 'http://localhost:3000' 
    : 'https://useoctree.com';
};
