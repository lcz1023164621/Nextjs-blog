import { HomeNavbar } from "@/modules/home/components/home-navbar/home-navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({children}:LayoutProps) => {
  return (
    <div className="relative">
      <div className="fixed top-0 left-0 right-0 z-50">
        <HomeNavbar />
      </div>
      {children}
    </div>
  )
}

export default Layout;