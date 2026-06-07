import { Globe, Mail, Phone } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

const footerLinks = [
  {
    title: "Platform",
    links: ["How it Works", "Buy Points", "Browse Spaces"]
  },
  {
    title: "Support",
    links: ["Help & FAQ", "Report an Issue", "Contact Us"]
  },
  {
    title: "Legal",
    links: ["Terms of Service", "Privacy Policy", "Refund Policy"]
  }
];

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        {/* Changed to a 12-column grid for perfect proportional spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand Section */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src="/imports/jilanihome_logo.png"
                alt="Logo"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <span className="font-['Space_Grotesk'] font-bold text-2xl tracking-wide text-white">Jilani Home</span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
              The premium gated marketplace for verified office spaces and event halls. Connect directly, pay once, and secure your perfect venue.
            </p>
          </div>

          {/* Links Section */}
          {footerLinks.map((column, i) => (
            <div key={i} className="lg:col-span-2 space-y-6">
              <h4 className="text-white font-semibold font-['Space_Grotesk'] tracking-wide">
                {column.title}
              </h4>
              <ul className="space-y-4">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-gray-500 hover:text-[#3B82F6] text-sm transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Developer Agency Section */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-white font-semibold font-['Space_Grotesk'] tracking-wide">
              Developed By
            </h4>
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src="/agency/neosparkx.jpeg"
                  alt="NeoSparkX"
                  className="w-12 h-12 rounded-xl object-cover bg-gray-900"
                />
                <div>
                  <h5 className="text-white font-bold tracking-wide text-sm">NEOSPARKX</h5>
                  <p className="text-[#3B82F6] text-xs font-medium mt-0.5">A Software Agency</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/5">
                <a href="mailto:hello@neosparkx.com" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="truncate">hello@neosparkx.com</span>
                </a>
                <a href="https://neosparkx.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="truncate">neosparkx.com</span>
                </a>
                <a href="https://wa.me/8801788992953" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="truncate">+880 1788-992953</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-6">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Jilani Home Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-gray-500">
            {/* Facebook */}
            <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            {/* X (Twitter) */}
            <a href="#" className="hover:text-white transition-colors" aria-label="X (Twitter)">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L2.25 2.25h6.919l4.259 5.623L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}