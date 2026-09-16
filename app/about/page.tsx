import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const stack = [
  {
    name: "Next.js",
    logo: "https://cdn.simpleicons.org/nextdotjs/FFFFFF",
  },
  {
    name: "React",
    logo: "https://cdn.simpleicons.org/react/61DAFB",
  },
  {
    name: "TypeScript",
    logo: "https://cdn.simpleicons.org/typescript/3178C6",
  },
  {
    name: "JavaScript",
    logo: "https://cdn.simpleicons.org/javascript/F7DF1E",
  },
  {
    name: "HTML",
    logo: "https://cdn.simpleicons.org/html5/E34F26",
  },
  {
    name: "CSS",
    logo: "https://cdn.simpleicons.org/css/663399",
  },
  {
    name: "Supabase",
    logo: "https://cdn.simpleicons.org/supabase/3FCF8E",
  },
  {
    name: "PostgreSQL",
    logo: "https://cdn.simpleicons.org/postgresql/4169E1",
  },
  {
    name: "Vercel",
    logo: "https://cdn.simpleicons.org/vercel/FFFFFF",
  },
  {
    name: "GitHub",
    logo: "https://cdn.simpleicons.org/github/FFFFFF",
  },
  {
    name: "PayPal",
    logo: "https://cdn.simpleicons.org/paypal/009CDE",
  },
  {
    name: "PayMongo",
    logo: null,
    fallback: "P",
  },
  {
    name: "Resend",
    logo: "https://cdn.simpleicons.org/resend/FFFFFF",
  },
];

const roles = [
  "Nutrition and Dietetics Student",
  "Virtual Assistant",
  "Property Management VA",
  "Nail Technician",
  "Nail Artist",
  "Digital Creator",
  "Web Designer",
  "MOM",
];

const services = [
  {
    number: "01",
    title: "Business Websites",
    description:
      "Clean, responsive websites built around the business, its services, and how customers actually interact with it.",
  },
  {
    number: "02",
    title: "Booking Systems",
    description:
      "Web-based booking experiences with services, schedules, customer information, availability, and management tools.",
  },
  {
    number: "03",
    title: "Online Shops",
    description:
      "Digital storefronts designed for selling products online, from simple ordering flows to more customized e-commerce setups.",
  },
  {
    number: "04",
    title: "Custom Web Systems",
    description:
      "Business-specific systems with dashboards, accounts, workflows, databases, integrations, and other custom functionality.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="aboutHero">
          <div className="aboutContainer">
            <div className="aboutHeroInner">
              <span className="eyebrow">ABOUT TCL</span>

              <h1>
                Digital solutions built
                <span>around the business.</span>
              </h1>

              <p>
                TCL Systems &amp; Digitals PH develops websites and web-based
                systems for businesses that need more than a generic online
                presence.
              </p>

              <div className="heroActions">
                <Link href="/shop" className="primaryButton">
                  Explore Solutions <span>→</span>
                </Link>

                <Link href="/portfolio" className="secondaryButton">
                  View Portfolio
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="tclSection">
          <div className="aboutContainer">
            <div className="tclGrid">
              <div className="sectionIntro">
                <span className="sectionKicker">
                  TCL SYSTEMS &amp; DIGITALS PH
                </span>

                <h2>
                  Not just pages.
                  <span>Solutions made to work.</span>
                </h2>
              </div>

              <div className="tclCopy">
                <p className="lead">
                  TCL Systems &amp; Digitals PH is an independent digital
                  development studio focused on creating modern websites and
                  practical web-based systems.
                </p>

                <p>
                  Instead of forcing every business into the same template, TCL
                  builds around what the business actually needs — whether that
                  is a simple website, an online shop, a booking experience, or
                  a more customized system with accounts, dashboards,
                  databases, and integrations.
                </p>

                <p>
                  Projects are approached one business at a time. The goal is
                  to keep the customer-facing experience simple while building
                  the functionality needed behind it.
                </p>
              </div>
            </div>

            <div className="stats">
              <div>
                <strong>2026</strong>
                <span>Established</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Custom Coded</span>
              </div>

              <div>
                <strong>1:1</strong>
                <span>Business-Focused</span>
              </div>
            </div>
          </div>
        </section>

        <section className="servicesSection">
          <div className="aboutContainer">
            <div className="servicesHeading">
              <div>
                <span className="sectionKicker">WHAT TCL BUILDS</span>
                <h2>From simple websites to custom systems.</h2>
              </div>

              <p>
                Different businesses need different levels of functionality.
                TCL builds solutions that can stay simple or grow into something
                more customized.
              </p>
            </div>

            <div className="servicesGrid">
              {services.map((service) => (
                <article className="serviceCard" key={service.number}>
                  <span className="serviceNumber">{service.number}</span>

                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="developmentSection">
          <div className="aboutContainer">
            <div className="developmentGrid">
              <div>
                <span className="sectionKicker lightKicker">
                  DEVELOPMENT APPROACH
                </span>

                <h2>
                  Designed with the front end
                  <span>and the system behind it in mind.</span>
                </h2>

                <p>
                  A website should look good, but it should also make sense for
                  the people using it and for the business managing what happens
                  behind the screen.
                </p>

                <Link href="/portfolio" className="lightLink">
                  See Selected Work <span>→</span>
                </Link>
              </div>

              <div className="stackPanel">
                <span className="stackLabel">
                  TECHNOLOGIES &amp; INTEGRATIONS
                </span>

                <div className="stackList">
                  {stack.map((item) => (
                    <span className="stackPill" key={item.name}>
                      {item.logo ? (
                        <img
                          src={item.logo}
                          alt=""
                          aria-hidden="true"
                          className="stackLogo"
                          width="15"
                          height="15"
                          loading="lazy"
                        />
                      ) : (
                        <span
                          className="stackLogoFallback"
                          aria-hidden="true"
                        >
                          {item.fallback}
                        </span>
                      )}

                      <span className="stackName">{item.name}</span>
                    </span>
                  ))}
                </div>

                <div className="stackNote">
                  <span>♡</span>
                  <p>
                    Technology choices can vary depending on the requirements of
                    each project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="developerSection">
          <div className="aboutContainer">
            <div className="developerGrid">
              <div className="developerPhotoWrap">
                <div className="developerPhoto">
                  <Image
                    src="/marie-about.jpg"
                    alt="Marie, founder of TCL Systems & Digitals PH"
                    fill
                    sizes="(max-width: 850px) 100vw, 42vw"
                    className="developerImage"
                    priority
                  />
                </div>

                <div className="photoBadge">
                  <span>CREATIVE GIRLY</span>
                  <small>with big dreams ♡</small>
                </div>
              </div>

              <div className="developerCopy">
                <span className="sectionKicker">ABOUT THE DEVELOPER</span>

                <h2>
                  Hey, I&apos;m Marie.
                  <span>A hardworking girly who wears many hats.</span>
                </h2>

                <p className="developerLead">
                  I&apos;m a Nutrition and Dietetics student at CEU, a Virtual
                  Assistant, nail technician and artist, digital creator, web
                  designer, a mom — and the girl behind TCL Systems &amp;
                  Digitals PH.
                </p>

                <p>
                  My days can look completely different from one another. Some
                  days are filled with school and studying, others with work,
                  creating, nails, websites, ideas, and of course, mommy duties.
                </p>

                <p>
                  TCL became a place where I could bring together the things I
                  enjoy most: creativity, technology, business, and building
                  something useful for other people.
                </p>

                <p>
                  What started from creating and exploring digital ideas grew
                  into building websites and systems designed around how a
                  business actually works.
                </p>

                <div className="roles">
                  {roles.map((role) => (
                    <span key={role}>{role}</span>
                  ))}
                </div>
              </div>
            </div>

            <blockquote className="developerQuote">
              <span>“</span>
              <p>
                A girl who studies, works, creates, and still makes room for
                bigger dreams. Same girl. Big dreams. ♡
              </p>
            </blockquote>
          </div>
        </section>

        <section className="aboutCta">
          <div className="aboutContainer">
            <div className="ctaInner">
              <div>
                <span className="sectionKicker">HAVE SOMETHING IN MIND?</span>

                <h2>
                  Tell TCL what
                  <span>you want to build.</span>
                </h2>

                <p>
                  Start with an existing website solution or request a quotation
                  for something built specifically around your business.
                </p>
              </div>

              <div className="ctaActions">
                <Link href="/shop" className="ctaPrimary">
                  Browse Solutions <span>→</span>
                </Link>

                <Link href="/contact" className="ctaSecondary">
                  Contact TCL
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      <style>{`
        * {
          box-sizing: border-box;
        }

        .aboutContainer {
          width: min(calc(100% - 40px), 1180px);
          margin-inline: auto;
        }

        .aboutHero {
          position: relative;
          overflow: hidden;
          padding: 115px 0 105px;
          background:
            radial-gradient(
              circle at 85% 20%,
              rgba(230, 171, 194, 0.3),
              transparent 28%
            ),
            radial-gradient(
              circle at 8% 85%,
              rgba(255, 222, 234, 0.5),
              transparent 25%
            ),
            linear-gradient(145deg, #fffdfd, #fff5f8);
        }

        .aboutHero::after {
          content: "♡";
          position: absolute;
          right: 7%;
          bottom: -70px;
          color: rgba(164, 97, 122, 0.06);
          font-size: 220px;
          line-height: 1;
          pointer-events: none;
        }

        .aboutHeroInner {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: auto;
          text-align: center;
        }

        .eyebrow {
          display: inline-flex;
          padding: 8px 13px;
          border: 1px solid #ecd7df;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.75);
          color: #9c6076;
          font-size: 0.65rem;
          font-weight: 850;
          letter-spacing: 0.15em;
        }

        .aboutHero h1 {
          max-width: 900px;
          margin: 24px auto 20px;
          color: #302429;
          font-size: clamp(4rem, 7vw, 7rem);
          font-weight: 850;
          line-height: 0.9;
          letter-spacing: -0.07em;
        }

        .aboutHero h1 span {
          display: block;
          color: #aa6880;
        }

        .aboutHero p {
          max-width: 630px;
          margin: auto;
          color: #75656b;
          font-size: 0.95rem;
          line-height: 1.75;
        }

        .heroActions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 29px;
        }

        .primaryButton,
        .secondaryButton,
        .ctaPrimary,
        .ctaSecondary {
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 18px;
          border-radius: 12px;
          font-size: 0.74rem;
          font-weight: 800;
          text-decoration: none;
        }

        .primaryButton {
          background: #35282d;
          color: white;
        }

        .secondaryButton {
          border: 1px solid #e4cfd7;
          background: rgba(255, 255, 255, 0.75);
          color: #513d45;
        }

        .tclSection,
        .servicesSection,
        .developerSection {
          padding: 100px 0;
        }

        .tclSection {
          background: #ffffff;
        }

        .tclGrid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: clamp(50px, 8vw, 110px);
        }

        .sectionKicker {
          display: block;
          color: #a0647b;
          font-size: 0.65rem;
          font-weight: 850;
          letter-spacing: 0.15em;
        }

        .sectionIntro h2,
        .servicesHeading h2,
        .developmentGrid h2,
        .developerCopy h2,
        .aboutCta h2 {
          margin: 12px 0 0;
          color: #33272c;
          font-size: clamp(2.6rem, 4.6vw, 4.6rem);
          font-weight: 850;
          line-height: 0.95;
          letter-spacing: -0.055em;
        }

        .sectionIntro h2 span,
        .developmentGrid h2 span,
        .developerCopy h2 span,
        .aboutCta h2 span {
          display: block;
          color: #ad6a82;
        }

        .tclCopy p {
          margin: 0 0 20px;
          color: #78696f;
          font-size: 0.88rem;
          line-height: 1.8;
        }

        .tclCopy .lead {
          color: #49383f;
          font-size: 1.05rem;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 65px;
          padding: 30px 0;
          border-top: 1px solid #ecdee3;
          border-bottom: 1px solid #ecdee3;
        }

        .stats > div {
          padding: 0 30px;
          border-right: 1px solid #ecdee3;
          text-align: center;
        }

        .stats > div:last-child {
          border-right: 0;
        }

        .stats strong {
          display: block;
          color: #382b30;
          font-size: clamp(2rem, 4vw, 3.4rem);
          line-height: 1;
          letter-spacing: -0.05em;
        }

        .stats span {
          display: block;
          margin-top: 7px;
          color: #8a797f;
          font-size: 0.65rem;
        }

        .servicesSection {
          background: #fff7fa;
        }

        .servicesHeading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 60px;
          margin-bottom: 42px;
        }

        .servicesHeading > div {
          max-width: 700px;
        }

        .servicesHeading > p {
          max-width: 410px;
          margin: 0;
          color: #796a70;
          font-size: 0.82rem;
          line-height: 1.7;
        }

        .servicesGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .serviceCard {
          min-height: 235px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px;
          border: 1px solid #eadde2;
          border-radius: 20px;
          background: white;
        }

        .serviceNumber {
          color: #ae7087;
          font-size: 0.65rem;
          font-weight: 850;
          letter-spacing: 0.1em;
        }

        .serviceCard h3 {
          margin: 0 0 8px;
          color: #3a2c31;
          font-size: 1.2rem;
        }

        .serviceCard p {
          max-width: 470px;
          margin: 0;
          color: #7d6e74;
          font-size: 0.75rem;
          line-height: 1.65;
        }

        .developmentSection {
          position: relative;
          overflow: hidden;
          padding: 100px 0;
          background: #30262a;
        }

        .developmentGrid {
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          align-items: center;
          gap: clamp(55px, 8vw, 100px);
        }

        .lightKicker {
          color: #e4adc1;
        }

        .developmentGrid h2 {
          color: white;
        }

        .developmentGrid h2 span {
          color: #dfa8bc;
        }

        .developmentGrid > div:first-child > p {
          max-width: 580px;
          margin: 22px 0 0;
          color: #cdbfc4;
          font-size: 0.87rem;
          line-height: 1.75;
        }

        .lightLink {
          display: inline-flex;
          gap: 8px;
          margin-top: 26px;
          color: #f0bfd1;
          font-size: 0.75rem;
          font-weight: 800;
          text-decoration: none;
        }

        .stackPanel {
          padding: 34px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.055);
        }

        .stackLabel {
          display: block;
          margin-bottom: 17px;
          color: #e0a9bd;
          font-size: 0.58rem;
          font-weight: 850;
          letter-spacing: 0.14em;
        }

        .stackList {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .stackPill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 32px;
          padding: 7px 10px 7px 8px;
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.055);
          color: #f4e9ed;
          font-size: 0.62rem;
          font-weight: 650;
          line-height: 1;
        }

        .stackLogo {
          display: block;
          width: 15px;
          height: 15px;
          flex: 0 0 15px;
          object-fit: contain;
        }

        .stackLogoFallback {
          width: 15px;
          height: 15px;
          flex: 0 0 15px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          background: #6c5ce7;
          color: #ffffff;
          font-size: 8px;
          font-weight: 900;
          line-height: 1;
        }

        .stackName {
          display: block;
          white-space: nowrap;
        }

        .stackNote {
          display: flex;
          gap: 10px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stackNote span {
          color: #e4afc2;
        }

        .stackNote p {
          margin: 0;
          color: #bcaeb3;
          font-size: 0.65rem;
          line-height: 1.55;
        }

        .developerSection {
          background: #ffffff;
        }

        .developerGrid {
          display: grid;
          grid-template-columns: minmax(320px, 0.8fr) 1.2fr;
          align-items: center;
          gap: clamp(50px, 8vw, 105px);
        }

        .developerPhotoWrap {
          position: relative;
          width: 100%;
          max-width: 470px;
        }

        .developerPhoto {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          border-radius: 28px;
          background: #f8e8ee;
          box-shadow: 0 25px 60px rgba(78, 48, 60, 0.12);
        }

        .developerImage {
          object-fit: cover;
        }

        .photoBadge {
          position: absolute;
          right: -25px;
          bottom: 35px;
          min-width: 160px;
          padding: 15px 18px;
          border: 1px solid #ecd8df;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 14px 35px rgba(75, 47, 57, 0.1);
        }

        .photoBadge span,
        .photoBadge small {
          display: block;
        }

        .photoBadge span {
          color: #8e586d;
          font-size: 0.62rem;
          font-weight: 850;
          letter-spacing: 0.09em;
        }

        .photoBadge small {
          margin-top: 3px;
          color: #88777d;
          font-size: 0.58rem;
        }

        .developerCopy h2 {
          margin-bottom: 24px;
        }

        .developerCopy p {
          margin: 0 0 17px;
          color: #796a70;
          font-size: 0.84rem;
          line-height: 1.75;
        }

        .developerCopy .developerLead {
          color: #49383f;
          font-size: 0.98rem;
        }

        .roles {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 26px;
        }

        .roles span {
          padding: 7px 10px;
          border: 1px solid #eadde2;
          border-radius: 999px;
          background: #fff8fa;
          color: #795766;
          font-size: 0.6rem;
          font-weight: 700;
        }

        .developerQuote {
          position: relative;
          max-width: 850px;
          margin: 85px auto 0;
          padding: 42px 55px;
          border: 1px solid #eadde2;
          border-radius: 24px;
          background: #fff8fa;
          text-align: center;
        }

        .developerQuote > span {
          position: absolute;
          top: 7px;
          left: 25px;
          color: #e6bccb;
          font-size: 4rem;
          line-height: 1;
        }

        .developerQuote p {
          margin: 0;
          color: #4b3940;
          font-size: clamp(1.2rem, 2.2vw, 1.7rem);
          font-weight: 750;
          line-height: 1.45;
          letter-spacing: -0.025em;
        }

        .aboutCta {
          padding: 85px 0;
          background: #fff2f6;
        }

        .ctaInner {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 60px;
        }

        .ctaInner > div:first-child {
          max-width: 700px;
        }

        .aboutCta h2 {
          font-size: clamp(2.8rem, 5vw, 5rem);
        }

        .aboutCta p {
          max-width: 570px;
          margin: 18px 0 0;
          color: #796970;
          font-size: 0.84rem;
          line-height: 1.7;
        }

        .ctaActions {
          display: flex;
          flex-direction: column;
          flex: 0 0 auto;
          gap: 8px;
        }

        .ctaPrimary,
        .ctaSecondary {
          min-width: 180px;
        }

        .ctaPrimary {
          background: #35282d;
          color: white;
        }

        .ctaSecondary {
          border: 1px solid #dfc6d0;
          background: white;
          color: #523e46;
        }

        @media (max-width: 900px) {
          .tclGrid,
          .developmentGrid,
          .developerGrid {
            grid-template-columns: 1fr;
          }

          .developerPhotoWrap {
            max-width: 520px;
            margin: auto;
          }

          .servicesHeading,
          .ctaInner {
            align-items: flex-start;
            flex-direction: column;
          }

          .servicesHeading {
            gap: 20px;
          }

          .ctaInner {
            gap: 30px;
          }

          .ctaActions {
            flex-direction: row;
          }
        }

        @media (max-width: 650px) {
          .aboutContainer {
            width: min(calc(100% - 28px), 1180px);
          }

          .aboutHero {
            padding: 75px 0 70px;
          }

          .aboutHero h1 {
            margin-top: 19px;
            font-size: clamp(3rem, 14vw, 4.5rem);
          }

          .aboutHero p {
            max-width: 350px;
            font-size: 0.76rem;
            line-height: 1.65;
          }

          .heroActions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
            margin-top: 23px;
          }

          .primaryButton,
          .secondaryButton {
            min-height: 41px;
            padding: 0 9px;
            font-size: 0.61rem;
          }

          .tclSection,
          .servicesSection,
          .developerSection,
          .developmentSection {
            padding: 65px 0;
          }

          .tclGrid {
            gap: 27px;
          }

          .sectionIntro h2,
          .servicesHeading h2,
          .developmentGrid h2,
          .developerCopy h2,
          .aboutCta h2 {
            font-size: clamp(2.2rem, 10vw, 3rem);
          }

          .tclCopy .lead {
            font-size: 0.88rem;
          }

          .tclCopy p {
            font-size: 0.76rem;
            line-height: 1.7;
          }

          .stats {
            grid-template-columns: repeat(3, 1fr);
            margin-top: 40px;
            padding: 22px 0;
          }

          .stats > div {
            min-width: 0;
            padding: 0 7px;
          }

          .stats strong {
            font-size: 1.5rem;
          }

          .stats span {
            font-size: 0.52rem;
            line-height: 1.3;
          }

          .servicesHeading {
            margin-bottom: 25px;
          }

          .servicesHeading > p {
            font-size: 0.74rem;
          }

          .servicesGrid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .serviceCard {
            min-height: 170px;
            padding: 20px;
            border-radius: 16px;
          }

          .serviceCard h3 {
            font-size: 1rem;
          }

          .serviceCard p {
            font-size: 0.68rem;
          }

          .developmentGrid {
            gap: 35px;
          }

          .developmentGrid > div:first-child > p {
            font-size: 0.76rem;
          }

          .stackPanel {
            padding: 22px;
            border-radius: 18px;
          }

          .stackPill {
            min-height: 30px;
            gap: 6px;
            padding: 6px 9px 6px 7px;
            font-size: 0.58rem;
          }

          .stackLogo,
          .stackLogoFallback {
            width: 14px;
            height: 14px;
            flex-basis: 14px;
          }

          .developerGrid {
            gap: 42px;
          }

          .developerPhotoWrap {
            width: calc(100% - 20px);
          }

          .developerPhoto {
            border-radius: 21px;
          }

          .photoBadge {
            right: -10px;
            bottom: 22px;
            min-width: 135px;
            padding: 12px 14px;
          }

          .developerCopy .developerLead {
            font-size: 0.85rem;
          }

          .developerCopy p {
            font-size: 0.75rem;
            line-height: 1.7;
          }

          .roles {
            gap: 5px;
            margin-top: 21px;
          }

          .roles span {
            padding: 6px 8px;
            font-size: 0.54rem;
          }

          .developerQuote {
            margin-top: 50px;
            padding: 35px 23px;
            border-radius: 18px;
          }

          .developerQuote p {
            font-size: 1.05rem;
          }

          .aboutCta {
            padding: 65px 0;
          }

          .ctaInner {
            gap: 27px;
          }

          .ctaActions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
          }

          .ctaPrimary,
          .ctaSecondary {
            min-width: 0;
            min-height: 41px;
            padding: 0 8px;
            font-size: 0.61rem;
          }
        }
      `}</style>
    </>
  );
}