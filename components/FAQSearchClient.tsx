"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import styles from "@/app/faqs/faqs.module.css";

const faqGroups = [
  {
    number: "01",
    title: "Before You Buy",
    description: "Helpful things to know before choosing a TCL solution.",
    items: [
      {
        question: "What does TCL Systems & Digitals PH offer?",
        answer:
          "TCL builds websites, booking systems, online shops, custom web systems, digital products, and other business-focused digital solutions. Some services have fixed published prices, while more advanced or fully customized projects require a quotation.",
      },
      {
        question: "Are TCL websites and systems just templates?",
        answer:
          "No. TCL develops working websites and web-based systems using modern web technologies. Some ready-made digital products may use reusable structures, but custom projects are built and configured around the agreed business requirements.",
      },
      {
        question: "Do I need to know coding?",
        answer:
          "No. TCL solutions are made for business owners and users, not developers. If your package includes an admin dashboard, normal management tasks are designed to be handled without editing code.",
      },
      {
        question: "How do I know which package is right for me?",
        answer:
          "Start with the published inclusions of each package. Starter Website is intended for a very simple one-page presence, Simple Business Website provides a larger business website, Basic Online Shop adds basic selling and order features, and more advanced requirements should go through Custom Development.",
      },
      {
        question: "Can I see a demo or previous work?",
        answer:
          "Some products have live demos or previews. You can also visit the Portfolio page to see selected TCL projects and examples of completed work.",
      },
      {
        question: "Can I ask general questions before purchasing?",
        answer:
          "Yes. You can ask general questions about TCL, published packages, or how the process works. If your question requires custom pricing or an assessment of your specific project requirements, please submit the Request a Quote form.",
      },
      {
        question: "Are all TCL products ready to use immediately?",
        answer:
          "Not always. Downloadable digital products may be available shortly after payment, while websites and systems may require setup, customization, business information, development, or account configuration before delivery.",
      },
      {
        question: "Can I purchase even if my business is not open yet?",
        answer:
          "Yes. You can prepare your website or digital setup before launch. Having your business name, branding, services, products, prices, contact information, and other content ready can make the process faster.",
      },
    ],
  },
  {
    number: "02",
    title: "Quotations & Custom Projects",
    description:
      "Why custom projects require requirements before TCL can provide pricing.",
    items: [
      {
        question: "Why do I need to fill out the Request a Quote form?",
        answer:
          "A project type alone is not enough to determine the actual development work required. The quotation form gives TCL the information needed to understand your requested pages, features, users, workflows, integrations, and other requirements before preparing a price.",
      },
      {
        question: 'Can you just tell me how much a "website" costs?',
        answer:
          "Fixed-price website packages already have published prices. For custom projects, there is no single website price because two websites can require completely different amounts of development. A simple informational website is very different from a website with customer accounts, dashboards, payments, booking logic, inventory, automation, or other custom features.",
      },
      {
        question: "Can TCL give me a rough estimate without my requirements?",
        answer:
          "For custom development, TCL avoids giving random estimates without enough project information. An estimate given before understanding the requirements can be misleading. Submit the quotation form so the price can be based on what you are actually requesting.",
      },
      {
        question: "I am not technical. How am I supposed to explain my requirements?",
        answer:
          "You do not need technical terms. Explain what you want the customer, admin, staff, or other users to be able to do. TCL can translate the business workflow into technical requirements and may ask written follow-up questions when clarification is needed.",
      },
      {
        question: "Does submitting a quotation request mean I have to purchase?",
        answer:
          "No. Submitting the Request a Quote form is not a commitment to purchase. It allows TCL to review your requirements and prepare the appropriate scope and pricing for you to consider.",
      },
      {
        question: "What happens after I submit the quotation form?",
        answer:
          "TCL reviews the information you provided and may ask written follow-up questions if anything needs clarification. Once the requirements are clear enough, a quotation and scope can be prepared for your review.",
      },
      {
        question: "Can I review the quotation before accepting?",
        answer:
          "Yes. You should review the project scope, inclusions, pricing, and applicable terms before accepting. Acceptance should only happen once you understand what is included.",
      },
      {
        question: "What if my requirements change after I receive the quotation?",
        answer:
          "The quotation is based on the requirements and scope available when it was prepared. Changes or additional requirements may need another scope review and can affect the project price or timeline.",
      },
      {
        question: "What if I remember another feature after development has started?",
        answer:
          "Tell TCL in writing. The request will be checked against the accepted scope. If it is a small reasonable adjustment it may be accommodated, but new functionality or significant changes can require additional pricing and development time.",
      },
      {
        question: "Are third-party expenses included in a custom quotation?",
        answer:
          "Only when the quotation specifically says they are included. Domains, paid hosting plans, database upgrades, email services, payment provider charges, APIs, subscriptions, licenses, and other third-party services may have separate costs paid by the client.",
      },
    ],
  },
  {
    number: "03",
    title: "Communication & Consultations",
    description:
      "How TCL handles inquiries, calls, requirements, approvals, and project communication.",
    items: [
      {
        question: "Can we discuss my project through chat?",
        answer:
          "Yes. Written communication is the standard for quotation and project-related discussions because requirements, decisions, approvals, revisions, and scope changes need a clear written record.",
      },
      {
        question: "Can we schedule a call?",
        answer:
          "A short introductory call may sometimes be accommodated depending on availability. It is intended for a brief introduction, general questions about TCL, or clients who simply want reassurance that they are communicating with a real person.",
      },
      {
        question: "Can we discuss all my project requirements during the call?",
        answer:
          "Project scope, custom pricing, detailed requirements, revisions, approvals, and scope changes should be communicated in writing. A short introductory call is not a substitute for the quotation or project communication process.",
      },
      {
        question: "Can I just explain everything on a call instead of filling out the quotation form?",
        answer:
          "No. A call does not replace the Request a Quote form. TCL needs written requirements to properly review the project and prepare a quotation based on the requested scope.",
      },
      {
        question: "Why does TCL prefer written project communication?",
        answer:
          "Written communication creates a clear reference for both TCL and the client. It reduces misunderstandings about what was requested, included, changed, approved, or agreed upon during the project.",
      },
      {
        question: "What if something important is discussed verbally?",
        answer:
          "Any verbal information that affects requirements, scope, pricing, revisions, approvals, or other project decisions should be confirmed in writing before it is treated as part of the project.",
      },
      {
        question: "Do you offer in-person appointments?",
        answer:
          "No. TCL does not currently offer in-person project appointments. The development and communication process is handled online.",
      },
      {
        question: "Can I call whenever I need project support?",
        answer:
          "Project support is primarily handled through written communication. This allows TCL to properly review the issue, keep a record of the request, and respond without losing important technical details.",
      },
    ],
  },
  {
    number: "04",
    title: "Payments & Pricing",
    description: "Answers about prices, payment options, fees, and balances.",
    items: [
      {
        question: "Are TCL products one-time payments?",
        answer:
          "Many TCL products and development services use a one-time purchase or project development fee. Your product page, quotation, or checkout will show the applicable payment arrangement before you proceed.",
      },
      {
        question: "Are there monthly TCL fees?",
        answer:
          "A one-time TCL development price does not automatically mean every third-party service is free forever. Domains, upgraded hosting, databases, email services, payment providers, APIs, subscriptions, and other external services can have their own charges.",
      },
      {
        question: "Are payment processing fees included?",
        answer:
          "The applicable total is shown before payment. Custom quotations may offer different payment arrangements with different processing fees depending on the payment method and payment plan selected.",
      },
      {
        question: "What payment methods can I use?",
        answer:
          "Available payment methods are displayed during the applicable checkout or quotation acceptance process. Options can vary depending on the type of purchase.",
      },
      {
        question: "Can custom projects use a down payment?",
        answer:
          "When offered on the quotation, you may select the available down-payment arrangement during acceptance. The quotation and checkout will show the applicable amount, processing fee, payments received, and remaining balance.",
      },
      {
        question: "Can I pay a custom project in full?",
        answer:
          "Yes, when a full-payment option is offered for your quotation. The available payment arrangements are shown before you accept and proceed to payment.",
      },
      {
        question: "Will I receive payment confirmation?",
        answer:
          "Successful payments are recorded with the order or project. Depending on the transaction, you may also receive an order confirmation, payment receipt, purchase email, or delivery notification.",
      },
      {
        question: "Can TCL prices change?",
        answer:
          "Published packages and future quotations may change over time. A custom quotation is based on its stated scope and applicable terms. Later additions or scope changes can still affect the total project cost.",
      },
    ],
  },
  {
    number: "05",
    title: "Delivery & Downloads",
    description:
      "What happens after payment and how digital purchases are delivered.",
    items: [
      {
        question: "How will I receive my purchase?",
        answer:
          "Delivery depends on the product. Digital products may use secure downloads, while websites and custom systems can include setup, account configuration, project turnover, credentials, instructions, or other delivery steps.",
      },
      {
        question: "When will I receive my purchase?",
        answer:
          "Automatically delivered products may become available after successful payment. Products requiring setup or customization are processed according to their stated process and turnaround time.",
      },
      {
        question: "What if my download link does not work?",
        answer:
          "Contact TCL with your order details so the purchase can be checked and the appropriate access assistance can be provided.",
      },
      {
        question: "Can I open my download link again later?",
        answer:
          "Access rules depend on the product. Secure links may have time or usage limits for security, so you should download your files within the provided access period and keep your own backup.",
      },
      {
        question: "What if I lose my downloaded files?",
        answer:
          "You are responsible for keeping backup copies after delivery. You may contact TCL to check whether another copy can be provided, but continued storage or recovery is not guaranteed.",
      },
      {
        question: "Can I download products using my phone?",
        answer:
          "Many digital files can be downloaded on a phone, although some files, setup instructions, or editing tasks may be easier to manage using a laptop or desktop computer.",
      },
      {
        question: "What if I accidentally close the payment success page?",
        answer:
          "Check the email address used for your purchase and any available order or access page. If you still cannot access your purchase, contact TCL with your order details.",
      },
      {
        question: "Why are secure download links limited?",
        answer:
          "Access limits help protect paid digital products and customer-only files from unauthorized sharing or public distribution.",
      },
    ],
  },
  {
    number: "06",
    title: "Websites & Domains",
    description:
      "Website packages, mobile compatibility, domains, hosting, and future edits.",
    items: [
      {
        question: "Will my TCL website work on mobile?",
        answer:
          "Yes. TCL websites are designed with responsive layouts so they can adapt to phones, tablets, laptops, and desktop screens.",
      },
      {
        question: "Do I need to purchase a custom domain?",
        answer:
          "No. Applicable website packages can use a free vercel.app subdomain. A custom domain such as yourbusiness.com is optional unless your project specifically requires one.",
      },
      {
        question: "Is a custom domain included in the website price?",
        answer:
          "Not unless the product page or quotation specifically states that it is included. Custom domain registration is normally a separate third-party expense.",
      },
      {
        question: "Can TCL help connect my custom domain?",
        answer:
          "Yes. TCL can assist with connecting a domain to the website when domain setup is part of the agreed service. The domain itself may still need to be purchased separately by the client.",
      },
      {
        question: "Does my website expire when maintenance support ends?",
        answer:
          "No. The included maintenance period is a support period, not the lifetime of the website. Your website does not automatically stop working when included TCL maintenance ends. Future assistance or changes can be handled separately when needed.",
      },
      {
        question: "Can I edit my website myself?",
        answer:
          "That depends on the package. Websites without an admin dashboard are not designed for the client to directly manage normal content changes. TCL can handle future edits for an additional fee. Custom systems with management features may allow the client to update specific content through an admin area.",
      },
      {
        question: "Can I use my own logo and brand colors?",
        answer:
          "Yes. Branding options depend on the selected package and agreed customization. Fully customized projects can be designed more specifically around the client's brand and requirements.",
      },
      {
        question: "Can TCL redesign my existing website?",
        answer:
          "Yes. Existing website redesigns can be reviewed as custom development. Submit a Request a Quote form with information about the current website and the changes you want.",
      },
      {
        question: "Can I add more pages or features later?",
        answer:
          "Yes, subject to technical feasibility. New pages, features, integrations, redesign work, or other additions are separate from the original delivered scope and may require additional pricing.",
      },
    ],
  },
  {
    number: "07",
    title: "Booking Systems",
    description:
      "Questions about booking websites, customer appointments, and admin tools.",
    items: [
      {
        question: "Can I manage the booking system myself?",
        answer:
          "If your booking package includes an admin dashboard, you can manage the business functions provided by that dashboard without editing the code.",
      },
      {
        question: "Can I add or edit services?",
        answer:
          "If service management is included, the admin can manage supported information such as service names, descriptions, prices, duration, variations, availability, or active status depending on the system.",
      },
      {
        question: "Can customers book using their phone?",
        answer:
          "Yes. TCL booking websites are designed to work across mobile and larger screens.",
      },
      {
        question: "Can I control unavailable dates or times?",
        answer:
          "If availability management is included in the booking system, the admin can control the dates, times, or schedules customers are allowed to book.",
      },
      {
        question: "Can I manage customer bookings from an admin dashboard?",
        answer:
          "Yes, when booking management is included in the selected package. The exact admin functions depend on the product or accepted project scope.",
      },
      {
        question: "Can booking statuses be updated?",
        answer:
          "Booking systems can include status management such as Pending, Confirmed, Cancelled, or Completed when those functions are part of the package.",
      },
      {
        question: "Can online payments be added to a booking system?",
        answer:
          "Payment functionality depends on the package and requirements. If it is not included in the published booking package, payment integration can be reviewed as an additional or custom feature.",
      },
      {
        question: "Can a booking system support several staff members?",
        answer:
          "Staff management depends on the system tier and required workflow. If you need separate staff schedules, accounts, assignments, permissions, or other multi-user features, include those requirements in your quotation request.",
      },
    ],
  },
  {
    number: "08",
    title: "Customization & Scope Changes",
    description:
      "Custom design, additional features, revisions, and changes after approval.",
    items: [
      {
        question: "Can I request a fully customized website or system?",
        answer:
          "Yes. Fully customized development is available for businesses that need functionality, workflows, integrations, or designs beyond TCL's fixed-price packages. Submit a Request a Quote form so the requirements can be reviewed.",
      },
      {
        question: "Is unlimited customization included in fixed-price packages?",
        answer:
          "No. Fixed-price packages include the features and level of customization stated on their product pages. Requirements beyond those inclusions may need a different package or custom quotation.",
      },
      {
        question: "Can I request a feature that is not listed in the shop?",
        answer:
          "Yes. TCL can review custom websites, systems, dashboards, booking workflows, business tools, integrations, and other web-based solutions even when they are not listed as a fixed-price shop product.",
      },
      {
        question: "Can I add new features after accepting the project scope?",
        answer:
          "You can request them, but they are not automatically included. TCL will check whether the request is already within the accepted scope, a small reasonable adjustment, or additional development requiring a scope and pricing review.",
      },
      {
        question: "Can changes affect the project timeline?",
        answer:
          "Yes. New requirements, delayed content, additional revisions, scope changes, third-party dependencies, or other changes can affect the original development schedule.",
      },
      {
        question: "Can TCL match my branding?",
        answer:
          "Yes. The amount of branding customization depends on the selected service. Fully customized projects can use your logo, colors, content, imagery, and agreed visual direction.",
      },
      {
        question: "What happens if the project becomes larger after development starts?",
        answer:
          "The existing completed work and payments remain part of the project record. Additional approved scope can increase the project total and remaining balance instead of treating the entire project as a new purchase.",
      },
    ],
  },
  {
    number: "09",
    title: "Support, Maintenance & Backups",
    description:
      "Included maintenance periods, technical support, future changes, and client responsibilities.",
    items: [
      {
        question: "How long is maintenance support included?",
        answer:
          "Starter Website and Simple Business Website include 1 month of maintenance support. Basic Online Shop and Standard Booking Website/System include 2 months. Fully Customized Website/System projects include 6 months of maintenance support.",
      },
      {
        question: "What is included in maintenance support?",
        answer:
          "Included maintenance support covers bugs or technical issues involving features that were part of the delivered and agreed scope, plus reasonable technical assistance related to the delivered project. The exact support available still depends on the issue and project.",
      },
      {
        question: "Does maintenance mean unlimited free edits?",
        answer:
          "No. Maintenance is not unlimited development or unlimited content editing. New pages, new features, redesigns, major content changes, additional integrations, new workflows, or requests outside the original scope may have an additional fee.",
      },
      {
        question: "When does my included maintenance period start?",
        answer:
          "The applicable maintenance period begins from the project's completed delivery or turnover unless different terms are specifically stated for your order or quotation.",
      },
      {
        question: "What happens when my free maintenance period ends?",
        answer:
          "Your website or system does not automatically expire when included maintenance ends. You can continue using it. If you later need TCL to troubleshoot, edit, maintain, redesign, or develop something new, the request can be reviewed and priced separately.",
      },
      {
        question: "What is the difference between a bug fix and a new feature?",
        answer:
          "A bug is when an agreed feature that should already work is not functioning as intended. A new feature changes or expands what the website or system is designed to do. New functionality is generally outside maintenance support.",
      },
      {
        question: "Are third-party problems covered by TCL maintenance?",
        answer:
          "TCL can help investigate issues affecting your project, but third-party fees, service limits, outages, policy changes, discontinued services, account restrictions, required upgrades, or changes made by external providers are outside TCL's control and may require additional work or costs.",
      },
      {
        question: "Can I still hire TCL for updates after maintenance ends?",
        answer:
          "Yes. You can request future updates, fixes, improvements, additional pages, features, or other development. TCL will review the request and advise if an additional fee applies.",
      },
      {
        question: "Am I responsible for backing up my files and business records?",
        answer:
          "Yes. After delivery or handover, you are responsible for keeping safe backup copies of important business files and records, including downloads, customer information, orders, bookings, exports, documents, and credentials.",
      },
      {
        question: "Will TCL permanently store backups of my business data?",
        answer:
          "You should not rely on TCL as permanent backup storage. Clients should regularly export and securely save important records and files related to their business.",
      },
      {
        question: "What if I accidentally delete important data?",
        answer:
          "Contact TCL so recovery options can be checked, but deleted or lost information cannot always be restored. Recovery is not guaranteed, and additional recovery work may have a separate fee.",
      },
    ],
  },
  {
    number: "10",
    title: "Accounts, Ownership & Handover",
    description:
      "What happens to project accounts, access, credentials, and instructions.",
    items: [
      {
        question: "Will the important project accounts belong to me?",
        answer:
          "For custom client projects, TCL aims to create important project services under client-owned accounts whenever practical. Your project handover will explain the accounts and access that belong to you.",
      },
      {
        question: "Will I own my finished website or custom system?",
        answer:
          "Ownership and permitted use depend on the product, quotation, license, and project terms. Custom client projects are handed over according to their agreed scope, while ready-made products or templates may have separate licensing restrictions.",
      },
      {
        question: "What is project handover?",
        answer:
          "Handover is the completion stage where TCL provides the applicable project access, credentials, instructions, files, account information, or other materials needed for the delivered website or system.",
      },
      {
        question: "Will I receive instructions?",
        answer:
          "Projects that require client management can include appropriate setup, usage, or handover instructions. The exact materials depend on the product and features delivered.",
      },
      {
        question: "Should I change passwords after handover?",
        answer:
          "Yes, when instructed. Keep credentials secure and update important passwords after handover when appropriate. Do not publish passwords, secret keys, or private admin information.",
      },
      {
        question: "Can multiple people use the same admin account?",
        answer:
          "That depends on the system. Sharing one admin login is not always the safest setup. If several staff members need access, role-based or separate user access may need to be included as a project requirement.",
      },
      {
        question: "What should I do after project handover?",
        answer:
          "Store your credentials securely, read the provided instructions, keep backup copies of important files and business records, and avoid changing technical settings you do not understand without checking first.",
      },
    ],
  },
  {
    number: "11",
    title: "Refunds & Order Problems",
    description:
      "What to do if there is a payment, order, access, or purchase issue.",
    items: [
      {
        question: "Does TCL offer refunds?",
        answer:
          "Refund eligibility depends on the type and status of the product or service and the applicable TCL policies. Please review the Policies page before purchasing or accepting a project.",
      },
      {
        question: "What if I purchase the wrong product?",
        answer:
          "Contact TCL as soon as possible. Available options can depend on whether the product has already been downloaded, accessed, customized, processed, or delivered.",
      },
      {
        question: "What if I entered the wrong email address?",
        answer:
          "Contact TCL with your order details. TCL may need to verify ownership of the purchase before changing customer or delivery information.",
      },
      {
        question: "What if I paid but did not receive anything?",
        answer:
          "Check your email, including spam or junk folders, and any applicable order status or access page. If the purchase is still unavailable, contact TCL with your order information.",
      },
      {
        question: "What if I was charged twice?",
        answer:
          "Contact TCL with the relevant order and transaction details so the payment records can be checked.",
      },
      {
        question: "What if my payment fails?",
        answer:
          "Check the payment information and available payment options. If the problem continues, contact TCL before repeatedly attempting the same transaction.",
      },
    ],
  },
  {
    number: "12",
    title: "Use, Sharing & Resale",
    description:
      "Rules for purchased files, systems, secure links, licenses, and resale.",
    items: [
      {
        question: "Can I share purchased TCL files?",
        answer:
          "Not unless the applicable product license allows it. Paid files, secure links, customer-only materials, and other protected digital products should not be distributed to people who did not purchase or receive authorized access.",
      },
      {
        question: "Can I resell a TCL product?",
        answer:
          "Only when the product or a separate agreement specifically grants resale rights. A normal purchase does not automatically include permission to resell TCL products.",
      },
      {
        question: "Can I copy a TCL system and sell it to other businesses?",
        answer:
          "Not unless your license or a separate written agreement specifically allows redistribution or resale. Purchasing a website or system for your own use does not automatically grant resale rights.",
      },
      {
        question: "Can I use my purchase for my own business?",
        answer:
          "Yes, according to the permitted use and license that applies to the product or custom project.",
      },
      {
        question: "Can I give my secure download link to someone else?",
        answer:
          "No. Secure purchase and download links should not be shared with unauthorized users.",
      },
      {
        question: "Can I post my finished website or system online?",
        answer:
          "Yes, you can normally promote or show your own finished business website or system. Do not expose private admin pages, customer information, credentials, secret keys, secure links, or other sensitive information.",
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
              Search words like &ldquo;quotation&rdquo;, &ldquo;call&rdquo;,
              &ldquo;maintenance&rdquo;, &ldquo;domain&rdquo;,
              &ldquo;payment&rdquo;, or &ldquo;refund&rdquo;.
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

                <nav
                  className={styles.categoryNav}
                  aria-label="FAQ categories"
                >
                  {filteredGroups.map((group) => (
                    <a key={group.title} href={`#faq-${group.number}`}>
                      <span>{group.number}</span>
                      {group.title}
                    </a>
                  ))}
                </nav>
              </div>

              <div className={styles.helpCard}>
                <span>Custom project?</span>
                <strong>Tell TCL what you need.</strong>
                <p>
                  Custom pricing requires your project requirements first.
                  Submit the quotation form so TCL can review the actual scope.
                </p>

                <Link href="/shop/custom-business-website">
                  Request a Quote
                  <span>→</span>
                </Link>
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
              Try a simpler keyword. For custom project pricing or requirements,
              submit a quotation request so TCL can review what you need.
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