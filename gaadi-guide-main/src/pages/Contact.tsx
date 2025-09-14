import { useState } from "react";
import { Link } from "react-router-dom";
import {
  SITE_TOP_TITLE,
  SITE_BASE_URL,
  SITE_SUGGESTION_REDIREECT,
} from "@/constants/siteConfigs";
import { Helmet } from "react-helmet";
import { ContainerLayout } from "@/components/layouts";

const Contact = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Helmet>
        <title>Contact {SITE_TOP_TITLE} </title>
        <link rel="canonical" href={`${SITE_BASE_URL}/contact`} />
      </Helmet>

      <ContainerLayout size="sm">
        {loading && (
          <div className="text-offText leading-snug bg-surface-1 p-6 rounded-xl border border-accent/20">
            <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
              <span>🚌</span>
              Getting in touch with BatoBuddy
            </h2>
            <p className="mb-3">The contact form is loading, please wait...</p>
            <Link
              to={SITE_SUGGESTION_REDIREECT}
              target="_blank"
              className="text-accent hover:text-accent/80 font-medium underline"
            >
              If the form doesn't load, click here to reach out directly.
            </Link>
          </div>
        )}

        <div className="my-8 h-[275dvh] rounded-2xl overflow-hidden relative">
          <iframe
            src="https://garrulous-belly-2d2.notion.site/ebd/2172054224e680209d1dd7541bc86f48"
            width="100%"
            height="100%"
            className="w-full h-full border-none"
            onLoad={() => setLoading(false)}
          />
        </div>
      </ContainerLayout>
    </>
  );
};

export default Contact;
