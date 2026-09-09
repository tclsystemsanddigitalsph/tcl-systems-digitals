"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "@/app/faqs/faqs.module.css";

const faqGroups = [
  {
    number: "01",
    title: "Before You Buy",
    description: "Helpful things to know before choosing a TCL product.",
    items: [
      {
        question: "What does TCL Systems & Digitals PH sell?",
        answer:
          "TCL sells booking systems, websites, digital products, business tools, and custom digital services. Each product page explains what is included so you know exactly what you are buying.",
      },
      {
        question: "Are these just Canva templates?",
        answer:
          "No. Some TCL products may be simple editable digital files, but others are working systems or websites with real features such as booking forms, admin pages, schedules, and customer tools.",
      },
      {
        question: "Do I need to know coding?",
        answer:
          "No. Products made for business owners are designed to be easy to use. If a system includes an admin area, you should be able to handle normal updates there without touching code.",
      },
      {
        question: "How do I know which product is right for me?",
        answer:
          "Start by checking the product description, features, price, and who the product is made for. If you are still unsure, message TCL and tell us what your business needs.",
      },
      {
        question: "Can I see a demo first?",
        answer:
          "Some products have a live demo or preview. If one is available, you will see it on the product page.",
      },
      {
        question: "Can I ask questions before buying?",
        answer:
          "Yes. If something is unclear, please ask before paying. It is better to make sure the product fits your needs first.",
      },
      {
        question: "Are all TCL products ready to use right away?",
        answer:
          "Not always. Some products are ready to download and use, while others may need setup, business details, or customization first. The product page will explain what applies.",
      },
      {
        question: "Can I buy even if my business is not open yet?",
        answer:
          "Yes. Many products can be prepared while you are still setting up your business. Just make sure you already know the basic information you want to use, such as your business name, services, and prices.",
      },
    ],
  },
  {
    number: "02",
    title: "Payments & Pricing",
    description: "Easy answers about prices, fees, and payments.",
    items: [
      {
        question: "Are TCL products one-time payments?",
        answer:
          "Many TCL products are sold with a one-time payment. The exact price and payment setup will always be shown before you pay.",
      },
      {
        question: "Are there monthly fees?",
        answer:
          "TCL may only charge you once for the product itself, but some services used by a website or system may have their own future costs. For example, a custom domain or certain third-party services may charge separately.",
      },
      {
        question: "Are payment fees included in the price?",
        answer:
          "Your checkout page will show the total amount before you pay. If there is a payment processing fee, it should be shown there.",
      },
      {
        question: "What payment methods can I use?",
        answer:
          "The payment options available to you will appear during checkout. These may depend on the product and payment provider being used.",
      },
      {
        question: "Will I get a receipt or confirmation?",
        answer:
          "Yes, successful purchases may come with an order confirmation, payment confirmation, purchase email, or delivery message.",
      },
      {
        question: "Can prices change?",
        answer:
          "Yes. TCL may update product prices, offers, or packages in the future. The price shown when you place your order is the price that applies to that purchase.",
      },
      {
        question: "Can I pay in installments?",
        answer:
          "Only if an installment option is clearly offered for that product or service. If you do not see one, the full amount is due at checkout.",
      },
      {
        question: "Do custom projects have the same price as ready-made products?",
        answer:
          "No. Custom work may cost more because it is made around your specific business needs. You will normally receive a separate quote.",
      },
    ],
  },
  {
    number: "03",
    title: "Delivery & Downloads",
    description: "What happens after payment and how you receive your purchase.",
    items: [
      {
        question: "How will I receive my purchase?",
        answer:
          "It depends on the product. Some digital products can be downloaded after payment. Other products may come with setup instructions, account handover, or extra steps.",
      },
      {
        question: "When will I receive my purchase?",
        answer:
          "Products with automatic delivery may be available after your payment is confirmed. Custom work can take longer because it needs to be prepared for you.",
      },
      {
        question: "What if my download link does not work?",
        answer:
          "Message TCL with your order details so we can check the purchase and help you access your file.",
      },
      {
        question: "Can I open my download link again later?",
        answer:
          "This depends on the product. Some secure links may have limits for safety. It is best to download your files and keep your own backup copy.",
      },
      {
        question: "What if I lose my files?",
        answer:
          "Please keep a backup of your purchased files. If you lose them, contact TCL and we will check what help is available based on your order.",
      },
      {
        question: "Can I download on my phone?",
        answer:
          "Many digital files can be downloaded on a phone, but some files may be easier to open, edit, or save using a laptop or desktop computer.",
      },
      {
        question: "What if I accidentally close the success page?",
        answer:
          "Check your purchase email first. If you still cannot access your order, contact TCL with the email address you used during checkout.",
      },
      {
        question: "Why do download links have security limits?",
        answer:
          "Secure links help protect your purchase from being shared publicly or used by people who did not buy the product.",
      },
    ],
  },
  {
    number: "04",
    title: "Booking Systems",
    description: "Questions about booking websites and admin tools.",
    items: [
      {
        question: "Can I manage the booking system myself?",
        answer:
          "Yes, if the product includes an admin dashboard. The goal is for you to handle normal business updates without needing to contact TCL every time.",
      },
      {
        question: "Can I add or edit my services?",
        answer:
          "If your package includes service management, yes. You can usually update details such as service names, prices, duration, and availability from the admin side.",
      },
      {
        question: "Can customers book from their phone?",
        answer:
          "Yes. TCL booking systems are designed to work on phones as well as larger screens.",
      },
      {
        question: "Can I block unavailable dates or times?",
        answer:
          "If your booking package includes schedule management, you can control when customers are allowed to book.",
      },
      {
        question: "Will I see customer bookings in an admin page?",
        answer:
          "If an admin dashboard is included in your package, you will be able to view and manage customer bookings there.",
      },
      {
        question: "Can I change a booking status?",
        answer:
          "This depends on the system, but admin dashboards may include statuses such as Pending, Confirmed, Cancelled, or Completed.",
      },
      {
        question: "Can I add online payments to my booking system?",
        answer:
          "Payment features depend on your package. Some systems may include payment options, while others can have them added as a separate feature.",
      },
      {
        question: "Can I use the booking system for a salon with several staff members?",
        answer:
          "It depends on the product tier. A basic system may be better for a solo business owner, while larger businesses may need a higher tier with staff or team features.",
      },
    ],
  },
  {
    number: "05",
    title: "Websites & Domains",
    description: "Simple answers about websites, domains, and going live.",
    items: [
      {
        question: "Will my website work on mobile?",
        answer:
          "Yes. TCL websites are designed to adjust for phones, tablets, and desktop screens.",
      },
      {
        question: "Do I need my own domain name?",
        answer:
          "Not always. A website can sometimes start with a hosted link. If you want a custom address such as yourbusiness.com, you will need to buy a domain.",
      },
      {
        question: "Is the domain included in the website price?",
        answer:
          "Only if the product or quote clearly says it is included. In many cases, domain fees are paid separately to the domain provider.",
      },
      {
        question: "Can TCL connect my domain for me?",
        answer:
          "Yes, domain setup can be included or offered as part of a website service depending on your package.",
      },
      {
        question: "Can I change my website text and photos later?",
        answer:
          "This depends on your website setup. Some updates may be easy for you to manage, while bigger design changes may need TCL's help.",
      },
      {
        question: "Can I use my own logo and brand colors?",
        answer:
          "Yes. Custom website services can be designed around your business branding.",
      },
      {
        question: "Can TCL redesign an existing website?",
        answer:
          "Yes. You can ask for a custom quote if you already have a website and want it improved or redesigned.",
      },
      {
        question: "Can I have more pages added later?",
        answer:
          "Yes. Extra pages can usually be added later. Additional work may have an extra fee depending on what you need.",
      },
    ],
  },
  {
    number: "06",
    title: "Customization",
    description: "For businesses that need something more personal.",
    items: [
      {
        question: "Can I request a custom design?",
        answer:
          "Yes. TCL can create a website or system that matches your business style, colors, content, and needs.",
      },
      {
        question: "Is customization already included?",
        answer:
          "Only the customization listed in your product or package is included. Anything extra may need a separate quote.",
      },
      {
        question: "Can I ask for new features?",
        answer:
          "Yes. Tell TCL what you want the system to do. We can check if it can be added and whether there will be an extra cost.",
      },
      {
        question: "Can TCL make something that is not in the shop?",
        answer:
          "Yes. The shop is not the limit. You can ask about a custom website, booking system, digital tool, or another business solution.",
      },
      {
        question: "Can you match my business branding?",
        answer:
          "Yes. For custom work, we can use your business colors, logo, wording, photos, and overall style.",
      },
      {
        question: "Can I change my mind during a custom project?",
        answer:
          "Small changes may be possible, but large changes after work has already started may affect the price or timeline.",
      },
    ],
  },
  {
    number: "07",
    title: "Support & Updates",
    description: "What help is available after your purchase.",
    items: [
      {
        question: "Is support included after I buy?",
        answer:
          "Support depends on the product. Your product details or handover guide will explain what help is included.",
      },
      {
        question: "What does bug support mean?",
        answer:
          "Bug support means help when a feature that should already work is not working properly. It does not normally include adding brand-new features.",
      },
      {
        question: "Are future changes free?",
        answer:
          "Not always. Small fixes may be covered depending on your support terms, but new pages, features, redesigns, and major changes may cost extra.",
      },
      {
        question: "Can TCL update my system later?",
        answer:
          "Yes. You can contact TCL when you want changes or improvements. We can check the request and give you a quote if needed.",
      },
      {
        question: "What if another service used by my website changes?",
        answer:
          "Websites sometimes use outside services for things like payments, email, hosting, or databases. If one of those services changes, your website may need an update later.",
      },
      {
        question: "Can I get help if I forget how to use the admin page?",
        answer:
          "Yes. If your purchase includes a user guide or handover manual, check that first. You can also contact TCL if you still need help.",
      },
      {
        question: "Do you offer long-term maintenance?",
        answer:
          "Maintenance may be available as a separate service depending on the system and what kind of ongoing help you need.",
      },
      {
        question: "Am I responsible for backing up my files and business records?",
        answer:
          "Yes. Once your files, system, records, or account access have been delivered to you, you are responsible for keeping your own backup copies. This includes order records, booking records, customer information, downloaded files, exports, and handover documents.",
      },
      {
        question: "Will TCL keep a backup of my orders, bookings, or customer records for me?",
        answer:
          "You should not rely on TCL as your backup storage. After delivery or handover, you are responsible for regularly saving copies of important business records and files in a safe place.",
      },
      {
        question: "What if I accidentally delete orders, bookings, files, or other important data?",
        answer:
          "Contact TCL and we can check whether recovery is possible, but deleted or lost information cannot always be restored. Recovery is not guaranteed, and extra recovery work may have an additional fee.",
      },
      {
        question: "What should I regularly back up?",
        answer:
          "Keep copies of anything important to your business, such as customer and order records, booking records, downloaded files, product or service information, exports, business documents, login information, and handover files.",
      },
    ],
  },
  {
    number: "08",
    title: "Accounts & Handover",
    description: "Questions about ownership, logins, and business accounts.",
    items: [
      {
        question: "Will I own my business accounts?",
        answer:
          "For custom client systems, the goal is for important business accounts to belong to the client whenever possible. Your handover will explain which accounts are yours.",
      },
      {
        question: "Will TCL keep my passwords?",
        answer:
          "You should change important passwords after handover when instructed. Never send passwords or secret keys through public messages.",
      },
      {
        question: "What is a handover?",
        answer:
          "A handover is when TCL gives you the important information, access, instructions, and files you need to manage your finished system or website.",
      },
      {
        question: "Will I get instructions on how to use everything?",
        answer:
          "For products that need guidance, TCL can provide instructions or a customer manual explaining the main features and how to use them.",
      },
      {
        question: "Can someone else in my business use the admin account?",
        answer:
          "That depends on your setup. If several people need access, it is better to ask TCL what the safest option is for your system.",
      },
      {
        question: "What should I do after handover?",
        answer:
          "Keep your files safe, change passwords when instructed, save your login details securely, and read the customer guide before making major changes.",
      },
    ],
  },
  {
    number: "09",
    title: "Refunds & Order Problems",
    description: "What to do when something goes wrong with an order.",
    items: [
      {
        question: "Do you offer refunds?",
        answer:
          "Refunds depend on the type of product or service and TCL's current policies. Please read the Policies page before buying.",
      },
      {
        question: "What if I bought the wrong product?",
        answer:
          "Contact TCL as soon as possible. What we can do may depend on whether the product has already been downloaded, delivered, or used.",
      },
      {
        question: "What if I entered the wrong email address?",
        answer:
          "Contact TCL with your order details. We may need to confirm that the order belongs to you before changing any information.",
      },
      {
        question: "What if I paid but did not receive anything?",
        answer:
          "First check your email, including spam or junk folders. If nothing arrives, contact TCL with your order details so we can check the payment and delivery.",
      },
      {
        question: "What if I was charged twice?",
        answer:
          "Contact TCL and provide the order information for both charges. We will check the records and help you understand what happened.",
      },
      {
        question: "What if my payment fails?",
        answer:
          "You can try again using the available payment options. If the problem continues, contact TCL before making repeated payments.",
      },
    ],
  },
  {
    number: "10",
    title: "Use, Sharing & Resale",
    description: "Rules about what you can and cannot do with your purchase.",
    items: [
      {
        question: "Can I share my purchased files?",
        answer:
          "Usually, no. Your purchase is for the use allowed by that product. Please do not share paid files, secure links, or customer-only materials unless the product says sharing is allowed.",
      },
      {
        question: "Can I resell a TCL product?",
        answer:
          "Only if the product clearly says resale rights are included. A normal purchase does not automatically give you permission to resell it.",
      },
      {
        question: "Can I copy the system and sell it to my own clients?",
        answer:
          "Not unless you have a separate agreement or license that allows it. A regular customer purchase is for your own permitted use.",
      },
      {
        question: "Can I use the product for my own business?",
        answer:
          "Yes, as long as you follow the rules and license that come with the product.",
      },
      {
        question: "Can I give my download link to a friend?",
        answer:
          "No. Secure download links are connected to a real purchase and should not be shared.",
      },
      {
        question: "Can I post screenshots of my finished website or system?",
        answer:
          "Yes, you can normally show your own finished business website or system. Just avoid sharing private admin pages, passwords, customer information, or secure links.",
      },
    ],
  },
];

export default function FAQSearchClient() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) {
      return faqGroups;
    }

    return faqGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          `${item.question} ${item.answer}`
            .toLowerCase()
            .includes(cleanQuery),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);

  const resultCount = filteredGroups.reduce(
    (total, group) => total + group.items.length,
    0,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(input);
  }

  function handleClear() {
    setInput("");
    setQuery("");
  }

  return (
    <section className={styles.contentSection}>
      <div className="container">
        <div className={styles.searchCard}>
          <div>
            <span className={styles.searchKicker}>Search FAQs</span>
            <h2>What can we help you with?</h2>
            <p>
              Type a word or short phrase like “refund”, “download”, “domain”,
              “support”, or “monthly fee”.
            </p>
          </div>

          <form className={styles.searchForm} onSubmit={handleSubmit}>
            <div className={styles.searchInputWrap}>
              <span className={styles.searchIcon} aria-hidden="true">
                ⌕
              </span>
              <input
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Search a keyword..."
                aria-label="Search frequently asked questions"
              />
            </div>
            <button type="submit">Search</button>
          </form>

          {query && (
            <div className={styles.searchStatus}>
              <span>
                {resultCount > 0
                  ? `${resultCount} answer${resultCount === 1 ? "" : "s"} found for “${query}”`
                  : `No answers found for “${query}”`}
              </span>
              <button type="button" onClick={handleClear}>
                Clear search
              </button>
            </div>
          )}
        </div>

        {filteredGroups.length > 0 ? (
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <span className={styles.sidebarKicker}>Browse by topic</span>
                <h2>Find what you need.</h2>

                <nav className={styles.categoryNav} aria-label="FAQ categories">
                  {filteredGroups.map((group) => (
                    <a key={group.title} href={`#faq-${group.number}`}>
                      <span>{group.number}</span>
                      {group.title}
                    </a>
                  ))}
                </nav>
              </div>

              <div className={styles.helpCard}>
                <span>Still unsure?</span>
                <strong>Ask TCL before purchasing.</strong>
                <p>
                  Tell us what your business needs and we&apos;ll help point you
                  toward the right option.
                </p>
                <a
                  href="https://t.me/tclsystemsanddigitalsph"
                  target="_blank"
                  rel="noreferrer"
                >
                  Message on Telegram
                  <span>↗</span>
                </a>
              </div>
            </aside>

            <div className={styles.groups}>
              {filteredGroups.map((group) => (
                <section
                  className={styles.group}
                  id={`faq-${group.number}`}
                  key={group.title}
                >
                  <div className={styles.groupHeading}>
                    <div className={styles.groupNumber}>{group.number}</div>
                    <div>
                      <span>FAQ CATEGORY</span>
                      <h2>{group.title}</h2>
                      <p>{group.description}</p>
                    </div>
                  </div>

                  <div className={styles.faqList}>
                    {group.items.map((faq) => (
                      <details className={styles.faqItem} key={faq.question}>
                        <summary>
                          <span>{faq.question}</span>
                          <i>+</i>
                        </summary>
                        <div className={styles.answer}>
                          <p>{faq.answer}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>⌕</div>
            <h2>No matching FAQs found.</h2>
            <p>
              Try a simpler keyword, or message TCL if your question is more
              specific.
            </p>
            <button type="button" onClick={handleClear}>
              Show all FAQs
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
