import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  GraduationCap,
  GitCompare,
} from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
 
 interface DashboardLayoutProps {
   children: ReactNode;
 }
 
const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Compare", href: "/compare", icon: GitCompare },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
];
 
 export function DashboardLayout({ children }: DashboardLayoutProps) {
   const location = useLocation();
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
         <div className="container flex items-center justify-between h-16 px-4">
           <Link to="/" className="flex items-center gap-3">
             <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
               <GraduationCap className="w-5 h-5" />
             </div>
             <div>
               <h1 className="text-lg font-bold font-display text-foreground">
                 EngagePredict
               </h1>
               <p className="text-xs text-muted-foreground">
                 Student Engagement Analytics
               </p>
             </div>
           </Link>
 
           <nav className="hidden md:flex items-center gap-1">
             {navigation.map((item) => {
               const isActive =
                 item.href === "/"
                   ? location.pathname === "/"
                   : location.pathname.startsWith(item.href);
 
               return (
                 <Link
                   key={item.name}
                   to={item.href}
                   className={cn(
                     "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                     isActive
                       ? "bg-primary text-primary-foreground"
                       : "text-muted-foreground hover:text-foreground hover:bg-muted"
                   )}
                 >
                   <item.icon className="w-4 h-4" />
                   {item.name}
                 </Link>
               );
              })}
            </nav>

            <UserMenu />
 
           {/* Mobile nav */}
           <nav className="flex md:hidden items-center gap-1">
             {navigation.map((item) => {
               const isActive =
                 item.href === "/"
                   ? location.pathname === "/"
                   : location.pathname.startsWith(item.href);
 
               return (
                 <Link
                   key={item.name}
                   to={item.href}
                   className={cn(
                     "flex items-center justify-center p-2 rounded-lg transition-colors",
                     isActive
                       ? "bg-primary text-primary-foreground"
                       : "text-muted-foreground hover:text-foreground hover:bg-muted"
                   )}
                 >
                   <item.icon className="w-5 h-5" />
                 </Link>
               );
             })}
           </nav>
         </div>
       </header>
 
       {/* Main content */}
       <main className="container px-4 py-8">{children}</main>
     </div>
   );
 }