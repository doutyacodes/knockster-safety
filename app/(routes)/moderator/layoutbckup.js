// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { 
//   HomeIcon, 
//   BellAlertIcon, 
//   UsersIcon, 
//   ChartBarIcon, 
//   Cog6ToothIcon,
//   ArrowLeftOnRectangleIcon
// } from '@heroicons/react/24/outline';

// const navigation = [
//   { name: 'Dashboard', href: '/moderator/dashboard', icon: HomeIcon },
//   { name: 'Active Alerts', href: '/moderator/alerts', icon: BellAlertIcon },
//   { name: 'Users', href: '/moderator/users', icon: UsersIcon },
//   { name: 'Analytics', href: '/moderator/analytics', icon: ChartBarIcon },
//   { name: 'Settings', href: '/moderator/settings', icon: Cog6ToothIcon },
// ];

// export default function ModeratorLayout({ children }) {
//   const pathname = usePathname();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const handleLogout = () => {
//     // Clear token and redirect to login
//     document.cookie = 'user_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//     window.location.href = '/login';
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Sidebar for mobile */}
//       <div className="lg:hidden">
//         <div className="fixed inset-0 z-40 flex">
//           <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
//             {/* Mobile sidebar content */}
//             <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
//               <div className="flex flex-shrink-0 items-center px-4">
//                 <h1 className="text-xl font-bold text-gray-900">Safety Monitor</h1>
//               </div>
//               <nav className="mt-5 space-y-1 px-2">
//                 {navigation.map((item) => {
//                   const isActive = pathname === item.href;
//                   return (
//                     <Link
//                       key={item.name}
//                       href={item.href}
//                       className={`
//                         group flex items-center rounded-md px-2 py-2 text-sm font-medium
//                         ${isActive 
//                           ? 'bg-indigo-50 text-indigo-600' 
//                           : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                         }
//                       `}
//                     >
//                       <item.icon className={`
//                         mr-3 h-5 w-5 flex-shrink-0
//                         ${isActive ? 'text-indigo-500' : 'text-gray-400'}
//                       `} />
//                       {item.name}
//                     </Link>
//                   );
//                 })}
//               </nav>
//             </div>
//             <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
//               >
//                 <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Static sidebar for desktop */}
//       <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
//         <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
//           <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
//             <div className="flex flex-shrink-0 items-center px-4">
//               <h1 className="text-xl font-bold text-gray-900">Safety Monitor</h1>
//               <span className="ml-2 rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">
//                 Moderator
//               </span>
//             </div>
//             <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
//               {navigation.map((item) => {
//                 const isActive = pathname.startsWith(item.href);
//                 return (
//                   <Link
//                     key={item.name}
//                     href={item.href}
//                     className={`
//                       group flex items-center rounded-md px-2 py-2 text-sm font-medium
//                       ${isActive 
//                         ? 'bg-indigo-50 text-indigo-600' 
//                         : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                       }
//                     `}
//                   >
//                     <item.icon className={`
//                       mr-3 h-5 w-5 flex-shrink-0
//                       ${isActive ? 'text-indigo-500' : 'text-gray-400'}
//                     `} />
//                     {item.name}
//                   </Link>
//                 );
//               })}
//             </nav>
//           </div>
//           <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
//             <button
//               onClick={handleLogout}
//               className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
//             >
//               <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="lg:pl-64">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="py-10">
//             {children}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }