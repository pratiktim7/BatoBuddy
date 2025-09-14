import { ContainerLayout } from "@/components/layouts";
import { Heading } from "@/components/ui";
import {
  SITE_TOP_TITLE,
  SITE_BASE_URL,
  siteUrlMappings,
} from "@/constants/siteConfigs";

import { Helmet } from "react-helmet";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About {SITE_TOP_TITLE}</title>
        <link rel="canonical" href={`${SITE_BASE_URL}/about`} />
      </Helmet>

      <ContainerLayout size="xs">
        <Heading level={1}>Welcome to BatoBuddy!</Heading>

        <p className="mt-4 text-base leading-7 text-offText">
          Welcome to BatoBuddy - your friendly companion for navigating Nepal's roads! 
          This application provides a clear and interactive map of various bus routes 
          across Nepal. I am building this app to solve the lack of centralized, 
          easily accessible route information and make traveling across Nepal more convenient.
        </p>

        <p className="mt-4 text-base leading-7 text-offText">
          BatoBuddy is more than just a route finder - it's your trusted travel buddy 
          that helps you explore Nepal with confidence. This project is being actively 
          developed and you can see the full feature list I plan to add in the{" "}
          <a
            href="https://www.notion.so/2002054224e68038b8f1dd5e64f0a636?v=2002054224e681548951600c5b4845fc"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline text-accent hover:text-accent/80"
          >
            Notion page
          </a>
          .
        </p>

        <Heading level={2} className="mt-16">
          Key Features
        </Heading>

        <ul className="mt-4 list-disc list-inside text-base leading-7 text-offText">
          <li>Interactive map with real-time route visualization across Nepal</li>
          <li>Search and filter bus routes easily with smart suggestions</li>
          <li>View all stops along a selected route with detailed information</li>
          <li>Jump to a specific stop location on the map instantly</li>
          <li>Mobile-friendly design for seamless on-the-go navigation</li>
          <li>Designed for locals, tourists, and adventurers alike</li>
          <li>Friendly and intuitive user interface that feels like having a local guide</li>
        </ul>

        <Heading level={2} className="mt-16">
          Developed By
        </Heading>

        <p className="mt-4 text-base leading-7 text-offText">
          BatoBuddy was developed by{" "}
          <a
            href="https://sayuj.com.np/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline text-accent hover:text-accent/80"
          >
            Sayuj Kuickel
          </a>
          . I'm passionate about solving real-world problems using web
          technologies and making public transport more accessible for everyone
          traveling across Nepal.
        </p>

        <Heading level={2} className="mt-16">
          Contributors
        </Heading>

        <p className="mt-4 text-base leading-7 text-offText">
          Contributors and sources that have supported BatoBuddy:
        </p>
        <ul className="mt-4 list-disc list-inside text-base leading-7 text-offText">
          <li>
            <a
              href="https://github.com/SayujKuickel"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline text-accent hover:text-accent/80"
            >
              @SayujKuickel
            </a>{" "}
            – Project author and core developer
          </li>
          <li>
            <a
              href="https://github.com/neogeomat/yatayat"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline text-accent hover:text-accent/80"
            >
              @amritkarma's yatayat
            </a>{" "}
            – Bus route data used with permission from this open-source project
          </li>
          <li>
            <a
              href="https://www.sajhayatayat.com.np/short-routes"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline text-accent hover:text-accent/80"
            >
              Sajha Yatatat
            </a>{" "}
            – Routes From Sajya Yatayat from their website + Photos taken by me
            (sayuj)
          </li>
          <li>
            <a
              href="https://play.google.com/store/apps/details?id=com.slashplus.mahanagar_plus"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline text-accent hover:text-accent/80"
            >
              Mahanagar Plus
            </a>{" "}
            – Routes by Mahanagar Yatayat used from their Application + Photos
            taken by me (sayuj)
          </li>
        </ul>

        <Heading level={2} className="mt-16">
          Want to Help?
        </Heading>

        <p className="mt-4 text-base leading-7 text-offText">
          Contributions, ideas, and feedback are very welcome! Whether you're a
          developer, a designer, or just someone familiar with Nepal's
          transport system, your help can make BatoBuddy better for everyone. You
          can reach out via the{" "}
          <a
            href={`/${siteUrlMappings.contact}`}
            rel="noopener noreferrer"
            className="font-semibold underline text-accent hover:text-accent/80"
          >
            contact form
          </a>{" "}
          or explore the project on{" "}
          <a
            href="https://github.com/SayujKuickel/bato-buddy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline text-accent hover:text-accent/80"
          >
            GitHub
          </a>
          .
        </p>
      </ContainerLayout>
    </>
  );
};

export default About;
