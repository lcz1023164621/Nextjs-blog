import { HomeNavbar } from "@/modules/home/components/home-navbar/home-navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({children}:LayoutProps) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <HomeNavbar />
      {children}
    </div>
  )
}

export default Layout;