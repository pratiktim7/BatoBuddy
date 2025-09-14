import { Link } from "react-router-dom";
import { Map, Route } from "lucide-react";
import { siteUrlMappings } from "@/constants/siteConfigs";
import { Button } from "@/components/ui";

interface NotFoundProps {
  title?: string;
}

const NotFound: React.FC<NotFoundProps> = ({ title }) => {
  return (
    <>
      <div className="my-32 text-center">
        <div className="max-w-md mx-auto bg-gradient-to-br from-surface-1 to-surface-2 p-8 rounded-2xl border border-accent/20">
          <div className="text-6xl mb-4 animate-bounce-gentle">🚌</div>
          
          <h1 className="heading-1 font-extrabold mb-4 text-text">
            {title ? title : "Oops! We took a wrong turn!"}
          </h1>
          
          <p className="text-offText mb-6 leading-relaxed">
            It looks like this page doesn't exist in our route map. 
            Don't worry, your BatoBuddy is here to help you find your way! 🧭
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to={"/"}>
              <Button
                icon={<Map size={18} />}
                ariaLabel="Go to map page"
                title={"Explore Map"}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-6 py-3 rounded-xl transition-all"
              />
            </Link>

            <Link to={`/${siteUrlMappings.bus}`}>
              <Button
                ariaLabel="Go to bus routes page"
                icon={<Route size={18} />}
                title={"Find Routes"}
                className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white px-6 py-3 rounded-xl transition-all"
              />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
