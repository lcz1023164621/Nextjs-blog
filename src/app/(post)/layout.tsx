import { HomeNavbar } from "@/modules/home/components/home-navbar/home-navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({children}:LayoutProps) => {
  return (
    <div className="relative">
      <HomeNavbar />
      {children}
    </div>
  )
}

export default Layout;