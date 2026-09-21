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
    name: "Cloudflare",
    logo: "https://cdn.simpleicons.org/cloudflare/F38020",
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
            <div className="developerTopline">
              <span>04 / ABOUT THE DEVELOPER</span>
              <span>DESIGN / BUILD / CREATE</span>
            </div>

            <div className="developerGrid">
              <div className="developerVisual">
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

                  <div className="photoIndex">TCL / 001</div>
                </div>

                <div className="developerMiniBio">
                  <span>BASED IN THE PHILIPPINES</span>
                  <p>Independent creator building practical digital experiences.</p>
                </div>
              </div>

              <div className="developerCopy">
                <span className="sectionKicker">THE GIRL BEHIND TCL</span>

                <h2>
                  Hey, I&apos;m Marie.
                  <span>I build while wearing many hats.</span>
                </h2>

                <p className="developerLead">
                  I&apos;m a Nutrition and Dietetics student at CEU, a Virtual
                  Assistant, nail technician and artist, digital creator, web
                  designer, a mom — and the girl behind TCL Systems &amp;
                  Digitals PH.
                </p>

                <div className="developerStory">
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
                </div>

                <div className="roleBlock">
                  <span className="roleLabel">CURRENTLY WEARING MANY HATS</span>
                  <div className="roles">
                    {roles.map((role, index) => (
                      <span key={role}>
                        <small>{String(index + 1).padStart(2, "0")}</small>
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <blockquote className="developerQuote">
              <span className="quoteMark">“</span>
              <p>
                A girl who studies, works, creates, and still makes room for
                <em> bigger dreams.</em>
              </p>
              <small>SAME GIRL / BIG DREAMS ♡</small>
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
        * { box-sizing: border-box; }

        main {
          --ink: #211b1e;
          --graphite: #30272b;
          --pink: #c97b99;
          --pink-soft: #e5a9bf;
          --muted: #74666c;
          --line: rgba(70, 49, 58, 0.14);
          background: #fffdfd;
          color: var(--ink);
          overflow: hidden;
        }

        .aboutContainer {
          width: min(calc(100% - 48px), 1180px);
          margin-inline: auto;
        }

        .aboutHero {
          position: relative;
          overflow: hidden;
          padding: 100px 0 88px;
          border-bottom: 1px solid var(--line);
          background:
            linear-gradient(rgba(77,55,64,.04) 1px, transparent 1px),
            linear-gradient(90deg,rgba(77,55,64,.04) 1px, transparent 1px),
            radial-gradient(circle at 82% 22%, rgba(207,126,158,.20), transparent 25rem),
            linear-gradient(135deg,#fffdfd,#f7eef2);
          background-size: 64px 64px,64px 64px,auto,auto;
        }

        .aboutHero::before {
          content: "TCL / STUDIO PROFILE / 2026";
          position: absolute;
          top: 23px;
          left: max(24px, calc((100% - 1180px) / 2));
          color: #a66b82;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .17em;
        }

        .aboutHero::after {
          content: "TCL";
          position: absolute;
          right: 2%;
          bottom: -.12em;
          color: rgba(82,57,68,.04);
          font-size: clamp(150px, 23vw, 330px);
          font-weight: 950;
          line-height: 1;
          letter-spacing: -.09em;
          pointer-events: none;
        }

        .aboutHeroInner {
          position: relative;
          z-index: 1;
          max-width: 1020px;
          margin: 0;
          text-align: left;
        }

        .eyebrow, .sectionKicker {
          display: inline-flex;
          color: var(--pink);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .eyebrow {
          padding: 0 0 10px;
          border: 0;
          border-bottom: 1px solid var(--pink);
          border-radius: 0;
          background: transparent;
          box-shadow: none;
        }

        .aboutHero h1 {
          max-width: 1000px;
          margin: 26px 0 22px;
          color: var(--ink);
          font-size: clamp(68px, 9vw, 128px);
          font-weight: 950;
          line-height: .8;
          letter-spacing: -.075em;
          text-transform: uppercase;
        }

        .aboutHero h1 span {
          display: block;
          color: transparent;
          -webkit-text-stroke: 1.3px var(--pink);
        }

        .aboutHero p {
          max-width: 650px;
          margin: 0;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.75;
        }

        .heroActions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 30px;
        }

        .primaryButton, .secondaryButton, .ctaPrimary, .ctaSecondary {
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 0 16px;
          border-radius: 0;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .04em;
          text-transform: uppercase;
          text-decoration: none;
          transition: .2s ease;
        }

        .primaryButton, .ctaPrimary {
          border: 1px solid var(--graphite);
          background: var(--graphite);
          color: #fff;
        }

        .secondaryButton, .ctaSecondary {
          border: 1px solid var(--line);
          background: rgba(255,255,255,.78);
          color: #513d45;
        }

        .primaryButton:hover, .ctaPrimary:hover { background: var(--pink); border-color: var(--pink); }
        .secondaryButton:hover, .ctaSecondary:hover { border-color: var(--pink); color: #9f5e77; }

        .tclSection, .servicesSection, .developerSection { padding: 100px 0; }
        .tclSection { background: #fff; }

        .tclGrid {
          display: grid;
          grid-template-columns: .9fr 1.1fr;
          gap: clamp(50px, 8vw, 110px);
        }

        .sectionIntro h2, .servicesHeading h2, .developmentGrid h2,
        .developerCopy h2, .aboutCta h2 {
          margin: 13px 0 0;
          color: var(--ink);
          font-size: clamp(46px, 5.5vw, 76px);
          font-weight: 900;
          line-height: .9;
          letter-spacing: -.06em;
        }

        .sectionIntro h2 span, .developmentGrid h2 span,
        .developerCopy h2 span, .aboutCta h2 span {
          display: block;
          color: var(--pink);
        }

        .tclCopy p {
          margin: 0 0 20px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.8;
        }

        .tclCopy .lead { color: #49383f; font-size: 17px; }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 66px;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }

        .stats > div {
          padding: 27px 30px;
          border-right: 1px solid var(--line);
          text-align: left;
        }

        .stats > div:last-child { border-right: 0; }
        .stats strong { display:block; color:var(--ink); font-size:clamp(32px,4vw,54px); line-height:1; letter-spacing:-.05em; }
        .stats span { display:block; margin-top:8px; color:#8a797f; font-size:11px; font-weight:700; }

        .servicesSection {
          position: relative;
          background:
            linear-gradient(rgba(77,55,64,.035) 1px,transparent 1px),
            linear-gradient(90deg,rgba(77,55,64,.035) 1px,transparent 1px),
            #fff7fa;
          background-size: 70px 70px;
        }

        .servicesHeading {
          display:flex;
          justify-content:space-between;
          align-items:end;
          gap:60px;
          margin-bottom:42px;
        }

        .servicesHeading > div { max-width:720px; }
        .servicesHeading > p { max-width:410px; margin:0; color:var(--muted); font-size:14px; line-height:1.75; }

        .servicesGrid { display:grid; grid-template-columns:repeat(2,1fr); gap:1px; background:var(--line); border:1px solid var(--line); }

        .serviceCard {
          min-height: 235px;
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          padding:29px;
          border:0;
          border-radius:0;
          background:#fff;
        }

        .serviceNumber { color:var(--pink); font-size:10px; font-weight:900; letter-spacing:.12em; }
        .serviceCard h3 { margin:0 0 9px; color:var(--ink); font-size:21px; }
        .serviceCard p { max-width:470px; margin:0; color:var(--muted); font-size:13px; line-height:1.7; }

        .developmentSection {
          position:relative;
          overflow:hidden;
          padding:100px 0;
          background:
            linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px),
            var(--graphite);
          background-size:70px 70px;
        }

        .developmentGrid { display:grid; grid-template-columns:1fr .9fr; align-items:center; gap:clamp(55px,8vw,100px); }
        .lightKicker { color:#e4adc1; }
        .developmentGrid h2 { color:#fff; }
        .developmentGrid h2 span { color:transparent; -webkit-text-stroke:1px #dfa8bc; }
        .developmentGrid > div:first-child > p { max-width:580px; margin:22px 0 0; color:#cdbfc4; font-size:14px; line-height:1.75; }

        .lightLink {
          display:inline-flex;
          gap:8px;
          margin-top:27px;
          color:#f0bfd1;
          font-size:12px;
          font-weight:900;
          text-decoration:none;
          text-transform:uppercase;
        }

        .stackPanel { padding:34px; border:1px solid rgba(255,255,255,.14); border-radius:0; background:rgba(255,255,255,.045); }
        .stackLabel { display:block; margin-bottom:18px; color:#e0a9bd; font-size:10px; font-weight:900; letter-spacing:.14em; }
        .stackList { display:flex; flex-wrap:wrap; gap:7px; }
        .stackPill {
          display:inline-flex; align-items:center; gap:8px; min-height:35px; padding:8px 11px 8px 9px;
          border:1px solid rgba(255,255,255,.12); border-radius:0; background:rgba(255,255,255,.045);
          color:#f4e9ed; font-size:11px; font-weight:700; line-height:1;
        }
        .stackLogo { display:block; width:16px; height:16px; flex:0 0 16px; object-fit:contain; }
        .stackLogoFallback { width:16px;height:16px;flex:0 0 16px;display:inline-flex;align-items:center;justify-content:center;background:#6c5ce7;color:#fff;font-size:8px;font-weight:900; }
        .stackName { display:block; white-space:nowrap; }
        .stackNote { display:flex;gap:10px;margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,.1); }
        .stackNote span { color:#e4afc2; }
        .stackNote p { margin:0;color:#bcaeb3;font-size:11px;line-height:1.6; }

        .developerSection { background:#fff; }

        .developerGrid {
          display:grid;
          grid-template-columns:minmax(320px,.82fr) 1.18fr;
          align-items:center;
          gap:clamp(50px,8vw,105px);
        }

        .developerPhotoWrap { position:relative;width:100%;max-width:470px; }
        .developerPhoto {
          position:relative;width:100%;aspect-ratio:4/5;overflow:hidden;border-radius:0;
          background:#f8e8ee;box-shadow:18px 18px 0 #f5e7ec;
        }
        .developerImage { object-fit:cover; }

        .photoBadge {
          position:absolute;right:-25px;bottom:35px;min-width:170px;padding:15px 18px;
          border:1px solid var(--line);border-radius:0;background:rgba(255,255,255,.96);
          box-shadow:0 14px 35px rgba(75,47,57,.08);
        }
        .photoBadge span,.photoBadge small{display:block}
        .photoBadge span{color:#8e586d;font-size:10px;font-weight:900;letter-spacing:.09em}
        .photoBadge small{margin-top:4px;color:#88777d;font-size:10px}

        .developerCopy h2 { margin-bottom:25px; }
        .developerCopy p { margin:0 0 17px;color:var(--muted);font-size:14px;line-height:1.75; }
        .developerCopy .developerLead { color:#49383f;font-size:16px; }

        .roles { display:flex;flex-wrap:wrap;gap:6px;margin-top:27px; }
        .roles span { padding:7px 10px;border:1px solid var(--line);border-radius:0;background:#fff8fa;color:#795766;font-size:10px;font-weight:800; }

        .developerQuote {
          position:relative;max-width:900px;margin:86px auto 0;padding:43px 56px;
          border:1px solid var(--line);border-radius:0;background:#fff8fa;text-align:center;
        }
        .developerQuote > span { position:absolute;top:7px;left:25px;color:#e6bccb;font-size:64px;line-height:1; }
        .developerQuote p { margin:0;color:#4b3940;font-size:clamp(20px,2.2vw,28px);font-weight:750;line-height:1.45;letter-spacing:-.025em; }

        .aboutCta { padding:90px 0;background:#fff3f7; }
        .ctaInner { display:flex;align-items:end;justify-content:space-between;gap:60px; }
        .ctaInner > div:first-child { max-width:730px; }
        .aboutCta h2 { font-size:clamp(48px,6vw,82px); }
        .aboutCta p { max-width:570px;margin:20px 0 0;color:var(--muted);font-size:14px;line-height:1.75; }
        .ctaActions { display:flex;flex-direction:column;flex:0 0 auto;gap:8px; }
        .ctaPrimary,.ctaSecondary { min-width:190px; }

        @media (max-width:900px) {
          .tclGrid,.developmentGrid,.developerGrid { grid-template-columns:1fr; }
          .developerPhotoWrap { max-width:520px;margin:auto; }
          .servicesHeading,.ctaInner { align-items:flex-start;flex-direction:column; }
          .servicesHeading { gap:20px; }
          .ctaInner { gap:30px; }
          .ctaActions { flex-direction:row; }
        }

        @media (max-width:650px) {
          .aboutContainer { width:min(calc(100% - 28px),1180px); }
          .aboutHero { padding:78px 0 60px; }
          .aboutHero::before { left:14px;top:18px;font-size:7px; }
          .aboutHero h1 { margin-top:21px;font-size:clamp(50px,15vw,72px);line-height:.8; }
          .aboutHero p { max-width:360px;font-size:14px; }
          .heroActions { width:100%;display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:24px; }
          .primaryButton,.secondaryButton { min-height:42px;padding:0 9px;font-size:9px; }

          .tclSection,.servicesSection,.developerSection,.developmentSection { padding:65px 0; }
          .tclGrid { gap:28px; }
          .sectionIntro h2,.servicesHeading h2,.developmentGrid h2,.developerCopy h2,.aboutCta h2 {
            font-size:clamp(39px,11vw,54px);
          }
          .tclCopy .lead { font-size:16px; }
          .tclCopy p { font-size:14px;line-height:1.72; }

          .stats { margin-top:41px; }
          .stats > div { min-width:0;padding:20px 7px; }
          .stats strong { font-size:24px; }
          .stats span { font-size:9px;line-height:1.3; }

          .servicesHeading { margin-bottom:26px; }
          .servicesHeading > p { font-size:13px; }
          .servicesGrid { grid-template-columns:1fr; }
          .serviceCard { min-height:165px;padding:21px; }
          .serviceCard h3 { font-size:18px; }
          .serviceCard p { font-size:13px; }

          .developmentGrid { gap:36px; }
          .developmentGrid > div:first-child > p { font-size:14px; }
          .stackPanel { padding:22px; }
          .stackPill { min-height:32px;gap:6px;padding:7px 9px 7px 7px;font-size:10px; }
          .stackLogo,.stackLogoFallback { width:14px;height:14px;flex-basis:14px; }

          .developerGrid { gap:43px; }
          .developerPhotoWrap { width:calc(100% - 20px); }
          .photoBadge { right:-10px;bottom:22px;min-width:145px;padding:12px 14px; }
          .developerCopy .developerLead { font-size:15px; }
          .developerCopy p { font-size:14px;line-height:1.72; }
          .roles { gap:5px;margin-top:22px; }
          .roles span { padding:6px 8px;font-size:9px; }

          .developerQuote { margin-top:51px;padding:36px 23px; }
          .developerQuote p { font-size:18px; }

          .aboutCta { padding:65px 0; }
          .ctaInner { gap:27px; }
          .aboutCta p { font-size:13px; }
          .ctaActions { width:100%;display:grid;grid-template-columns:1fr 1fr;gap:7px; }
          .ctaPrimary,.ctaSecondary { min-width:0;min-height:42px;padding:0 8px;font-size:9px; }
        }


        /* ABOUT THE DEVELOPER — EDITORIAL PROFILE */
        .developerSection {
          position: relative;
          background:
            linear-gradient(rgba(77,55,64,.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(77,55,64,.03) 1px,transparent 1px),
            #fff;
          background-size: 70px 70px;
        }

        .developerTopline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 34px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--line);
          color: #9a7886;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .15em;
        }

        .developerGrid {
          align-items: start;
          grid-template-columns: minmax(300px,.78fr) 1.22fr;
        }

        .developerVisual {
          position: sticky;
          top: 110px;
        }

        .developerPhotoWrap {
          max-width: 440px;
        }

        .developerPhoto {
          aspect-ratio: 4 / 5.25;
          border: 1px solid var(--line);
          box-shadow: 16px 16px 0 #f3e4ea;
        }

        .developerPhoto::after {
          content: "";
          position: absolute;
          inset: 12px;
          z-index: 2;
          border: 1px solid rgba(255,255,255,.42);
          pointer-events: none;
        }

        .photoIndex {
          position: absolute;
          right: -16px;
          bottom: -16px;
          z-index: 3;
          padding: 9px 11px;
          border: 1px solid var(--line);
          background: var(--graphite);
          color: #fff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .13em;
        }

        .developerMiniBio {
          max-width: 360px;
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 18px;
          margin-top: 35px;
          padding-top: 16px;
          border-top: 1px solid var(--line);
        }

        .developerMiniBio span,
        .roleLabel {
          color: var(--pink);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .13em;
          line-height: 1.45;
        }

        .developerMiniBio p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .developerCopy {
          padding-top: 13px;
        }

        .developerCopy h2 {
          max-width: 720px;
          margin: 16px 0 28px;
          font-size: clamp(54px, 6.5vw, 91px);
          line-height: .84;
        }

        .developerCopy h2 span {
          margin-top: 8px;
          color: transparent;
          -webkit-text-stroke: 1.2px var(--pink);
        }

        .developerCopy .developerLead {
          max-width: 670px;
          padding: 0 0 25px 22px;
          border-left: 2px solid var(--pink);
          color: #49383f;
          font-size: 17px;
          line-height: 1.75;
        }

        .developerStory {
          max-width: 670px;
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 0;
          margin-top: 28px;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }

        .developerStory p {
          margin: 0;
          padding: 20px 18px;
          border-right: 1px solid var(--line);
          font-size: 12px;
          line-height: 1.7;
        }

        .developerStory p:first-child { padding-left: 0; }
        .developerStory p:last-child { border-right: 0; }

        .roleBlock {
          margin-top: 30px;
        }

        .roleLabel {
          display: block;
          margin-bottom: 12px;
        }

        .roles {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 1px;
          margin: 0;
          border: 1px solid var(--line);
          background: var(--line);
        }

        .roles span {
          min-height: 44px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border: 0;
          background: #fff;
          color: #5f4953;
          font-size: 11px;
          font-weight: 800;
        }

        .roles small {
          color: var(--pink);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .developerQuote {
          max-width: none;
          display: grid;
          grid-template-columns: 70px minmax(0,1fr) auto;
          align-items: end;
          gap: 24px;
          margin: 90px 0 0;
          padding: 40px 0 0;
          border: 0;
          border-top: 1px solid var(--line);
          background: transparent;
          text-align: left;
        }

        .developerQuote .quoteMark {
          position: static;
          color: #e2a9be;
          font-size: 90px;
          line-height: .55;
        }

        .developerQuote p {
          max-width: 800px;
          font-size: clamp(27px,3.5vw,48px);
          font-weight: 850;
          line-height: 1.05;
          letter-spacing: -.045em;
        }

        .developerQuote p em {
          color: var(--pink);
          font-style: normal;
        }

        .developerQuote > small {
          padding-bottom: 4px;
          color: #9a7886;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .14em;
          white-space: nowrap;
        }

        @media (max-width:900px) {
          .developerVisual {
            position: static;
          }

          .developerGrid {
            grid-template-columns: 1fr;
          }

          .developerPhotoWrap {
            margin: 0;
          }

          .developerStory {
            grid-template-columns: 1fr;
          }

          .developerStory p,
          .developerStory p:first-child {
            padding: 16px 0;
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }

          .developerStory p:last-child {
            border-bottom: 0;
          }

          .developerQuote {
            grid-template-columns: 55px 1fr;
          }

          .developerQuote > small {
            grid-column: 2;
          }
        }

        @media (max-width:650px) {
          .developerTopline {
            margin-bottom: 25px;
            font-size: 7px;
          }

          .developerPhotoWrap {
            width: calc(100% - 18px);
          }

          .developerMiniBio {
            grid-template-columns: 105px 1fr;
            margin-top: 31px;
          }

          .developerCopy {
            padding-top: 0;
          }

          .developerCopy h2 {
            margin: 14px 0 24px;
            font-size: clamp(47px,14vw,67px);
          }

          .developerCopy .developerLead {
            padding: 0 0 20px 15px;
            font-size: 15px;
          }

          .developerStory p {
            font-size: 13px;
          }

          .roles {
            grid-template-columns: 1fr 1fr;
          }

          .roles span {
            min-height: 47px;
            padding: 9px;
            font-size: 9px;
          }

          .developerQuote {
            grid-template-columns: 38px 1fr;
            gap: 12px;
            margin-top: 60px;
            padding-top: 28px;
          }

          .developerQuote .quoteMark {
            font-size: 65px;
          }

          .developerQuote p {
            font-size: clamp(24px,8vw,34px);
          }

          .developerQuote > small {
            font-size: 7px;
          }
        }

        @media (prefers-reduced-motion:reduce) {
          .primaryButton,.secondaryButton,.ctaPrimary,.ctaSecondary { transition:none; }
        }
      `}</style>
    </>
  );
}