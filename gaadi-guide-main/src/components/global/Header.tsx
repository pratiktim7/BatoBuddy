import { Link } from "react-router-dom";
import React, { useState } from "react";
import { headerItems } from "@/constants/headers";
import logo from "@/assets/logo-192x192.png";
import { Menu, X } from "lucide-react";
import { siteUrlMappings } from "@/constants/siteConfigs";
import { Button } from "../ui";

const Header = () => {
  const [isMobileMenuShown, setIsMobileMenuShown] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuShown((prev) => !prev);

  return (
    <header className="bg-gradient-to-r from-primary via-secondary to-accent sticky top-0 z-[99998] shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <Link
            to={`/${siteUrlMappings.search}`}
            className="block w-14 aspect-square shrink-0 bg-white/10 rounded-xl p-2 backdrop-blur-sm hover:bg-white/20 transition-all"
          >
            <img src={logo} alt="BatoBuddy logo" className="w-full h-full rounded-lg" />
          </Link>
          <div className="leading-tight text-white">
            <p className="text-2xl font-bold -mb-1 tracking-wide">Bato</p>
            <p className="text-lg font-semibold opacity-90">Buddy</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-6">
          {headerItems.map(({ path, name, newTab }) => (
            <li key={path}>
              <Link
                to={path}
                target={newTab ? "_blank" : undefined}
                className="block hover:underline transition-all text-white/90 hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <Button
            ariaLabel="Toggle mobile menu"
            onClick={toggleMobileMenu}
            icon={isMobileMenuShown ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
            className="bg-white/10 hover:bg-white/20 border-white/20"
          />
        </div>
      </div>

      {isMobileMenuShown && (
        <aside className="fixed inset-0 z-[99999] h-screen bg-gradient-to-br from-background via-surface-1 to-surface-2 p-4 md:hidden">
          <nav className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Link
                to={`/${siteUrlMappings.search}`}
                className="block w-14 aspect-square shrink-0 bg-primary/20 rounded-xl p-2 backdrop-blur-sm"
              >
                <img src={logo} alt="BatoBuddy logo" className="w-full h-full rounded-lg" />
              </Link>
              <div className="leading-tight text-text">
                <p className="text-2xl font-bold -mb-1 tracking-wide">Bato</p>
                <p className="text-lg font-semibold text-accent">Buddy</p>
              </div>
            </div>

            <Button
              ariaLabel="Close sidebar"
              onClick={toggleMobileMenu}
              icon={<X size={20} />}
              className="bg-surface-2 hover:bg-surface-3 border-on-surface/20"
            />
          </nav>

          <ul className="flex flex-col gap-4">
            {headerItems.map(({ path, name, icon, newTab }) => (
              <li key={path}>
                <Link
                  to={path}
                  target={newTab ? "_blank" : undefined}
                  className="flex items-center gap-3 px-6 py-4 rounded-xl border border-on-surface/20 bg-gradient-to-r from-surface-1 to-surface-2 transition-all hover:border-accent/50 hover:bg-gradient-to-r hover:from-surface-2 hover:to-surface-3 text-text hover:text-white"
                  onClick={toggleMobileMenu}
                >
                  <span className="text-accent">{icon}</span>
                  <span className="font-medium">{name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </header>
  );
};

export default React.memo(Header);
