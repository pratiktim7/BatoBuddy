import {
  SITE_SUGGESTION_REDIREECT,
  siteUrlMappings,
} from "@/constants/siteConfigs";
import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="pt-8 pb-6 mt-24 bg-gradient-to-t from-surface-1 to-transparent">
      <div className="container mx-auto px-5">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-2xl mb-4">
            <span>🚌</span>
            <span className="font-bold text-text">Bato</span>
            <span className="font-semibold text-accent">Buddy</span>
          </div>
          
          <p className="flex items-center gap-2 text-center font-semibold mx-auto w-fit text-offText">
            <span>Crafted with</span>
            ❤️
            <span>and lots of</span>
            ☕
            <span>by</span>
            <a
              target="_blank"
              href="https://sayuj.com.np"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              Sayuj Kuickel.
            </a>
          </p>

          <div className="max-w-md mx-auto">
            <p className="text-xs text-offText text-center leading-relaxed">
              BatoBuddy is your friendly companion for navigating Nepal! 🗺️
              <br />
              This app is continuously improving. Data may be incomplete. <br />
              <span className="inline-flex items-center gap-2 mt-2">
                <Link
                  className="underline decoration-accent hover:text-accent transition-colors"
                  to={`/${siteUrlMappings.contact}`}
                >
                  Get in touch
                </Link>
                <span>•</span>
                <Link
                  to={SITE_SUGGESTION_REDIREECT}
                  target="_blank"
                  className="underline decoration-accent hover:text-accent transition-colors"
                >
                  Report issues
                </Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
