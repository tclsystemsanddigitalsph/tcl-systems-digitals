export type ProductPageFaq = {
  question: string;
  answer: string;
};

export type ProductPageSection = {
  title: string;
  description: string;
};

export type ProductPageDetails = {
  eyebrow: string;
  headline: string;
  introduction: string;

  idealFor: string[];

  inclusions: ProductPageSection[];

  clientProvides: string[];

  tclHandles: string[];

  editingAccess: {
    title: string;
    description: string;
  };

  domainHosting: string[];

  maintenance: {
    period: string;
    description: string;
    covered: string[];
    notCovered: string[];
  };

  notIncluded: string[];

  upgrades: string[];

  process: ProductPageSection[];

  faqs: ProductPageFaq[];
};

export const productPageDetails: Record<string, ProductPageDetails> = {
  "starter-website": {
    eyebrow: "STARTER WEBSITE",

    headline: "A simple online home for your business.",

    introduction:
      "The Starter Website is designed for small businesses, freelancers, professionals, and personal brands that need a clean and professional online presence without the cost or complexity of a larger website.",

    idealFor: [
      "Small businesses that are just starting online",
      "Freelancers and independent professionals",
      "Home-based businesses",
      "Service providers with a small number of services",
      "Personal brands",
      "Businesses that mainly receive inquiries through Messenger, social media, phone, or email",
      "Anyone who only needs the essential business information on one page",
    ],

    inclusions: [
      {
        title: "1-Page Website",
        description:
          "Your main business information is organized into one responsive scrolling website.",
      },
      {
        title: "Hero / Introduction",
        description:
          "A clear opening section featuring your business name or logo, short introduction, and primary call-to-action.",
      },
      {
        title: "About Section",
        description:
          "A short section introducing your business, brand, service, or professional background.",
      },
      {
        title: "Services or Products Section",
        description:
          "Present your main services, offers, packages, or selected products in an organized layout.",
      },
      {
        title: "Contact Section",
        description:
          "Display your preferred contact information and available social or messaging links.",
      },
      {
        title: "Basic Calls-to-Action",
        description:
          "Buttons can direct visitors to supported contact destinations such as Messenger, email, phone, or social media.",
      },
      {
        title: "Responsive Design",
        description:
          "The website is designed to work across mobile phones, tablets, laptops, and desktop screens.",
      },
      {
        title: "Brand Customization",
        description:
          "Your available logo, business colors, content, and overall visual direction are applied to the website.",
      },
      {
        title: "Deployment & Setup",
        description:
          "TCL prepares and deploys the completed website as part of the initial project setup.",
      },
    ],

    clientProvides: [
      "Business or brand name",
      "Business type or industry",
      "Short About / business description",
      "Services, products, packages, or offers to display, including prices if you want them shown",
      "Contact details to display",
      "Social media or messaging links",
      "Business location or service area, when applicable",
      "Logo, if available",
      "Preferred colors and design style",
      "Images or photos you want included",
    ],

    tclHandles: [
      "Website layout and implementation",
      "Responsive mobile, tablet, and desktop design",
      "Initial content placement",
      "Basic visual customization",
      "Website deployment",
      "Initial technical setup",
    ],

    editingAccess: {
      title: "No Admin Dashboard",
      description:
        "The Starter Website does not include a content management or admin dashboard. The website is delivered with the approved content. If you need TCL to change text, images, services, or other content later, future editing may be quoted separately.",
    },

    domainHosting: [
      "A free vercel.app subdomain can be used for the website.",
      "A custom domain is optional and is not included in the ₱999 package price.",
      "If you want a custom domain, the domain registration or renewal cost is separate.",
      "TCL can assist with connecting a compatible custom domain when applicable.",
      "Third-party hosting, domain, platform, or provider fees are separate when required.",
    ],

    maintenance: {
      period: "1 Month",
      description:
        "The Starter Website includes 1 month of maintenance support beginning from completed delivery or turnover, unless otherwise stated.",
      covered: [
        "Bugs or errors affecting features included in the delivered scope",
        "Reasonable technical assistance related to the delivered website",
        "Issues caused by the original TCL implementation within the agreed scope",
      ],
      notCovered: [
        "Unlimited content edits",
        "New pages or sections",
        "New website features",
        "Major redesign requests",
        "New integrations",
        "Changes outside the original agreed scope",
        "Third-party outages, policy changes, limits, or paid upgrades",
      ],
    },

    notIncluded: [
      "Admin dashboard",
      "Customer accounts or login system",
      "Online booking system",
      "Shopping cart",
      "Online checkout",
      "Automated payment gateway",
      "Inventory management",
      "Database-driven management features",
      "Custom web application features",
      "Custom domain registration fees",
      "Unlimited revisions or future edits",
    ],

    upgrades: [
      "Additional pages",
      "Custom domain assistance",
      "Additional content or sections",
      "Future content edits",
      "Advanced forms",
      "Booking functionality",
      "Online selling features",
      "Admin dashboard",
      "Custom systems or integrations",
    ],

    process: [
      {
        title: "Purchase",
        description:
          "Purchase the Starter Website through the TCL storefront.",
      },
      {
        title: "Prepare Your Content",
        description:
          "Prepare your business details, branding, services, contact information, and available images.",
      },
      {
        title: "Submit Requirements",
        description:
          "Follow the post-purchase instructions to provide the information needed for your website.",
      },
      {
        title: "Website Setup",
        description:
          "TCL builds and customizes the one-page website using the approved package scope.",
      },
      {
        title: "Review",
        description:
          "The completed website is prepared for review before final turnover.",
      },
      {
        title: "Launch & Turnover",
        description:
          "After completion, the website is deployed and your maintenance period begins.",
      },
    ],

    faqs: [
      {
        question: "Can I edit the website myself?",
        answer:
          "This package does not include an admin dashboard. Future content changes can be requested from TCL and may have an editing fee.",
      },
      {
        question: "Can I use my own domain?",
        answer:
          "Yes. A custom domain can be connected when compatible, but domain registration and renewal fees are separate from the package.",
      },
      {
        question: "Can I add another page later?",
        answer:
          "Yes, but additional pages are outside the Starter Website package and may require an additional fee or package upgrade.",
      },
      {
        question: "Does the website stop working after 1 month?",
        answer:
          "No. The 1-month period refers to included maintenance support. The delivered website does not automatically expire when maintenance ends.",
      },
      {
        question: "Can I accept online payments with this package?",
        answer:
          "Automated online payments are not included. If you need checkout, payment processing, booking, or other advanced functionality, TCL can recommend another package or prepare a custom quotation.",
      },
    ],
  },

  "simple-business-website": {
    eyebrow: "SIMPLE BUSINESS WEBSITE",

    headline: "A complete informational website for your business.",

    introduction:
      "The Simple Business Website is for businesses that need more space than a one-page website to professionally present their services, story, and contact information without requiring an admin dashboard or advanced business system.",

    idealFor: [
      "Small and growing businesses",
      "Service-based businesses",
      "Freelancers and professionals",
      "Beauty and wellness businesses",
      "Home-based businesses",
      "Local service providers",
      "Businesses that need a professional multi-page online presence",
    ],

    inclusions: [
      {
        title: "Home Page",
        description:
          "A branded homepage introducing your business, primary offer, important information, and calls-to-action.",
      },
      {
        title: "Services Page",
        description:
          "A dedicated page for your services, packages, offers, or selected products.",
      },
      {
        title: "About Page",
        description:
          "A separate page where customers can learn more about your business, story, experience, or brand.",
      },
      {
        title: "Contact Page",
        description:
          "A dedicated contact page for your business details, social links, location information, and supported contact methods.",
      },
      {
        title: "Brand Customization",
        description:
          "The website is customized using your business name, available logo, colors, content, and preferred visual direction.",
      },
      {
        title: "Responsive Design",
        description:
          "Pages are designed for mobile phones, tablets, laptops, and desktop screens.",
      },
      {
        title: "Basic Contact Links",
        description:
          "Supported calls-to-action can direct visitors to your preferred contact or social channels.",
      },
      {
        title: "Deployment & Initial Setup",
        description:
          "TCL handles the initial website deployment and technical setup included in the package.",
      },
    ],

    clientProvides: [
      "Business name and business type / industry",
      "Logo, if available",
      "Home page headline, introduction, and key business information",
      "About page content / business description",
      "Services, packages, or offers with descriptions and prices when applicable",
      "Contact page details",
      "Business location and hours, when applicable",
      "Social media or messaging links",
      "Preferred destination for website inquiries",
      "Brand colors, preferred design style, or visual references",
      "Website images or photos",
      "Domain preference or existing domain details, when applicable",
    ],

    tclHandles: [
      "Four-page website implementation",
      "Page layout and visual presentation",
      "Responsive design",
      "Initial content placement",
      "Basic brand customization",
      "Website deployment",
      "Initial technical setup",
    ],

    editingAccess: {
      title: "No Admin Dashboard",
      description:
        "This package does not include an admin dashboard for self-editing. TCL can assist with future text, image, service, or content changes for a separate editing fee when needed.",
    },

    domainHosting: [
      "A free vercel.app subdomain can be used.",
      "A custom domain is optional and purchased separately.",
      "Domain registration and renewal charges are not included in the package.",
      "TCL can assist with compatible domain connection.",
      "Any required third-party paid services remain separate.",
    ],

    maintenance: {
      period: "1 Month",
      description:
        "The Simple Business Website includes 1 month of maintenance support from completed delivery or turnover, unless otherwise stated.",
      covered: [
        "Bugs and errors affecting originally delivered features",
        "Reasonable technical assistance for the delivered website",
        "Issues within the original agreed website scope",
      ],
      notCovered: [
        "Unlimited content updates",
        "Additional pages",
        "New functionality",
        "Major redesigns",
        "New integrations",
        "Out-of-scope development",
        "Third-party outages, limits, policy changes, or upgrades",
      ],
    },

    notIncluded: [
      "Admin dashboard",
      "Customer accounts",
      "Booking management system",
      "Shopping cart or ecommerce checkout",
      "Automated payment gateway",
      "Inventory management",
      "Advanced database features",
      "Custom application workflows",
      "Custom domain fees",
      "Unlimited future content changes",
    ],

    upgrades: [
      "Additional pages",
      "Additional sections",
      "Custom domain assistance",
      "Future content updates",
      "Advanced inquiry forms",
      "Booking functionality",
      "Online shop functionality",
      "Admin dashboard",
      "Custom integrations or systems",
    ],

    process: [
      {
        title: "Purchase",
        description:
          "Purchase the Simple Business Website through the storefront.",
      },
      {
        title: "Prepare",
        description:
          "Prepare your business content, branding, services, contact details, and images.",
      },
      {
        title: "Submit Requirements",
        description:
          "Provide the required website information using TCL's post-purchase process.",
      },
      {
        title: "Build",
        description:
          "TCL customizes and builds the four-page website within the package scope.",
      },
      {
        title: "Review",
        description:
          "Review the prepared website before completion and turnover.",
      },
      {
        title: "Launch",
        description:
          "The completed website is deployed and the included maintenance period begins.",
      },
    ],

    faqs: [
      {
        question: "How many pages are included?",
        answer:
          "The package includes four pages: Home, Services, About, and Contact.",
      },
      {
        question: "Can I manage the website myself?",
        answer:
          "An admin dashboard is not included. Future content changes can be requested from TCL for a separate editing fee.",
      },
      {
        question: "Can I add booking later?",
        answer:
          "Yes, but booking functionality is outside this package. Depending on your requirements, you may upgrade to a booking package or request a custom quotation.",
      },
      {
        question: "Can I connect a custom domain?",
        answer:
          "Yes. Compatible custom domains can be connected, but registration and renewal costs are separate.",
      },
      {
        question: "What happens after the maintenance period?",
        answer:
          "Your website does not automatically stop working. Future maintenance, troubleshooting, edits, or development can be quoted separately when needed.",
      },
    ],
  },

  "basic-online-shop": {
    eyebrow: "BASIC ONLINE SHOP",

    headline: "A simple storefront for businesses ready to sell online.",

    introduction:
      "The Basic Online Shop is designed for small businesses that want customers to browse products, add items to a cart, submit an order, and follow manual payment instructions without the complexity of a fully automated ecommerce system.",

    idealFor: [
      "Small product-based businesses",
      "Home-based online sellers",
      "Businesses moving from social-media-only selling",
      "Small catalogs with straightforward ordering",
      "Businesses comfortable confirming payments manually",
      "Businesses that do not need a self-managed admin dashboard",
    ],

    inclusions: [
      {
        title: "Online Storefront",
        description:
          "A customer-facing shop where visitors can browse your initial products.",
      },
      {
        title: "Up to 10 Initial Products",
        description:
          "TCL sets up up to 10 products initially using the information and images you provide.",
      },
      {
        title: "Product Information",
        description:
          "Products can display essential information such as name, price, image, and description based on the agreed design.",
      },
      {
        title: "Shopping Cart",
        description:
          "Customers can add supported products to a cart before proceeding with their order.",
      },
      {
        title: "Basic Checkout / Order Submission",
        description:
          "Customers can provide the required order and contact information through the included checkout or order flow.",
      },
      {
        title: "Manual Payment Instructions",
        description:
          "Your shop can display approved manual payment instructions such as GCash, QR Ph, or bank transfer details.",
      },
      {
        title: "About Page",
        description:
          "A page introducing your business, brand, or shop.",
      },
      {
        title: "Contact Page",
        description:
          "A page containing your customer contact channels and relevant business information.",
      },
      {
        title: "Responsive Design",
        description:
          "The storefront is designed for phones, tablets, laptops, and desktop screens.",
      },
      {
        title: "Deployment & Setup",
        description:
          "TCL handles the initial setup and deployment included in the package.",
      },
    ],

    clientProvides: [
      "Business or shop name and business type / industry",
      "Logo, if available",
      "Short About / shop description",
      "Up to 10 initial products with names, prices, descriptions, images, and variants/options when applicable",
      "Basic product categories or collections, when applicable",
      "Manual payment instructions such as GCash, QR Ph, or bank transfer details",
      "Customer information you need collected during ordering",
      "Shipping, pickup, or delivery information",
      "Shop, payment, cancellation, return, or exchange policies that apply to your business",
      "Business contact information",
      "Social media or messaging links",
      "Brand colors, preferred design style, or visual references",
      "Domain preference or existing domain details, when applicable",
    ],

    tclHandles: [
      "Initial storefront setup",
      "Initial setup of up to 10 products",
      "Cart implementation",
      "Basic checkout or order submission flow",
      "Manual payment instruction presentation",
      "Responsive design",
      "About and Contact page setup",
      "Initial deployment",
    ],

    editingAccess: {
      title: "No Admin Dashboard",
      description:
        "The Basic Online Shop does not include a self-service admin dashboard. TCL handles the initial product setup. Future product additions, removals, price changes, image changes, or other store content updates can be requested for an additional editing fee.",
    },

    domainHosting: [
      "A free vercel.app subdomain can be used.",
      "A custom domain is optional and paid separately.",
      "Domain registration and renewal are not included in the package price.",
      "TCL can assist with connecting a compatible custom domain.",
      "Third-party services or provider upgrades are separate when required.",
    ],

    maintenance: {
      period: "2 Months",
      description:
        "The Basic Online Shop includes 2 months of maintenance support beginning from completed delivery or turnover, unless otherwise stated.",
      covered: [
        "Bugs affecting the delivered storefront",
        "Errors affecting the included cart or order flow",
        "Reasonable technical assistance for delivered functionality",
        "Issues within the original approved package scope",
      ],
      notCovered: [
        "Ongoing product uploads",
        "Routine price or inventory changes",
        "Unlimited content editing",
        "New ecommerce functionality",
        "New integrations",
        "Major redesigns",
        "Third-party outages, policy changes, limits, or paid upgrades",
      ],
    },

    notIncluded: [
      "Admin dashboard",
      "Automated inventory management",
      "Customer account system",
      "Member accounts or member pricing",
      "Automated payment gateway",
      "Automated payment verification",
      "Automated shipping integrations",
      "Advanced order management dashboard",
      "Points or loyalty systems",
      "Referral systems",
      "Subscriptions",
      "Multi-vendor functionality",
      "Unlimited product uploads",
      "Custom domain fees",
    ],

    upgrades: [
      "Additional product setup",
      "Future product or price changes",
      "Custom domain assistance",
      "Automated payment gateway",
      "Customer accounts",
      "Admin dashboard",
      "Inventory management",
      "Advanced order management",
      "Membership features",
      "Points or rewards",
      "Custom shipping integrations",
      "Other custom ecommerce functionality",
    ],

    process: [
      {
        title: "Purchase",
        description:
          "Purchase the Basic Online Shop package through the TCL storefront.",
      },
      {
        title: "Prepare Products",
        description:
          "Prepare your initial products, images, prices, descriptions, payment details, policies, and branding.",
      },
      {
        title: "Submit Requirements",
        description:
          "Provide the required store information following TCL's post-purchase instructions.",
      },
      {
        title: "Shop Setup",
        description:
          "TCL builds and configures the storefront within the standard package scope.",
      },
      {
        title: "Review & Test",
        description:
          "The store and included order flow are reviewed and tested before turnover.",
      },
      {
        title: "Launch",
        description:
          "The completed online shop is deployed and the included maintenance period begins.",
      },
    ],

    faqs: [
      {
        question: "Can I add products myself?",
        answer:
          "Not with the Basic Online Shop package. It does not include an admin dashboard. Future product changes can be requested from TCL for an additional fee.",
      },
      {
        question: "How many products are included?",
        answer:
          "Initial setup includes up to 10 products. Additional product setup can be quoted separately.",
      },
      {
        question: "Does it accept GCash?",
        answer:
          "The standard package can provide manual payment instructions such as GCash, QR Ph, or bank transfer. Automated payment processing is not included.",
      },
      {
        question: "Does it include online card payments?",
        answer:
          "No automated payment gateway is included in the standard package. Gateway integration requires additional scope or a custom quotation.",
      },
      {
        question: "Can I have an admin dashboard?",
        answer:
          "Yes, but an admin dashboard is an upgrade beyond the Basic Online Shop package and requires scope and pricing review.",
      },
    ],
  },

  "basic-booking-system": {
    eyebrow: "BASIC BOOKING SYSTEM",

    headline: "A simple booking system with the essentials to manage appointments.",

    introduction:
      "The Basic Booking System is designed for small appointment-based businesses that need customers to book online and need a simple admin dashboard to manage bookings, services, availability, and basic business settings without advanced scheduling complexity.",

    idealFor: [
      "Small appointment-based businesses",
      "Beauty and wellness service providers",
      "Nail, lash, brow, and beauty studios",
      "Freelancers and independent professionals",
      "Consultation-based services",
      "Businesses moving from manual booking through chat or social media",
      "Businesses that need simple booking management without advanced staff scheduling",
    ],

    inclusions: [
      {
        title: "Customer-Facing Website",
        description:
          "A responsive business website with Home, Services, About, Contact, Book Now, and booking confirmation pages.",
      },
      {
        title: "Simple Online Booking Form",
        description:
          "Customers can complete a straightforward booking form without a multi-step booking wizard.",
      },
      {
        title: "Service Selection",
        description:
          "Customers can choose from the active services configured for the business.",
      },
      {
        title: "Service Variations & Add-ons",
        description:
          "Supported services can include basic variations and optional add-ons that customers can select when booking.",
      },
      {
        title: "Date & Time Selection",
        description:
          "Customers can select a booking date and choose from available time slots based on the configured business availability.",
      },
      {
        title: "Customer Information",
        description:
          "The booking form collects essential customer details such as name, contact information, email, and optional notes.",
      },
      {
        title: "Booking Confirmation / Reference",
        description:
          "After submission, customers receive an on-screen booking confirmation or reference through the included booking flow.",
      },
      {
        title: "Booking Statuses",
        description:
          "Bookings can be managed using Pending, Confirmed, Canceled, and Completed statuses.",
      },
      {
        title: "Basic Admin Dashboard",
        description:
          "A protected admin area provides access to the booking, service, availability, and settings tools included in the package.",
      },
      {
        title: "Booking Management",
        description:
          "View submitted bookings, create supported manual bookings, and update booking statuses from the admin area.",
      },
      {
        title: "Service Management",
        description:
          "Add and edit supported services, prices, durations, variations, add-ons, and active or inactive status.",
      },
      {
        title: "Service Booking Capacity",
        description:
          "Set how many bookings a service can accept per time slot and optionally set a maximum number of bookings for that service per day.",
      },
      {
        title: "General Availability",
        description:
          "Configure business-wide working days and hours used by the booking system.",
      },
      {
        title: "Unavailable Dates",
        description:
          "Block dates when the business is unavailable for bookings.",
      },
      {
        title: "Basic Business Settings",
        description:
          "Manage the supported business information and basic settings used by the booking website.",
      },
      {
        title: "Responsive Design",
        description:
          "The customer-facing website and supported admin interfaces are designed for mobile, tablet, laptop, and desktop screens.",
      },
      {
        title: "Deployment & Setup",
        description:
          "TCL handles the initial deployment and technical setup included in the package.",
      },
    ],

    clientProvides: [
      "Business name and business type / industry",
      "Logo, if available",
      "Short About / business description",
      "Services with prices and durations",
      "Service variations and add-ons, when applicable",
      "Maximum bookings per time slot and optional daily service limits, when applicable",
      "Working days and business hours",
      "Dates the business should be unavailable for booking",
      "Customer information you need collected during booking",
      "Cancellation, rescheduling, and no-show policies",
      "Contact information and business location, when applicable",
      "Social media or messaging links",
      "Brand colors, preferred design style, or visual references",
      "Website and service images",
      "Domain preference or existing domain details, when applicable",
    ],

    tclHandles: [
      "Customer-facing booking website",
      "Simple booking form implementation",
      "Basic admin dashboard setup",
      "Booking management setup",
      "Service, variation, and add-on management setup",
      "Per-service booking capacity setup",
      "General availability and unavailable-date setup",
      "Basic business settings",
      "Responsive implementation",
      "Database and application setup required by the package",
      "Initial deployment",
    ],

    editingAccess: {
      title: "Basic Admin Dashboard Included",
      description:
        "The Basic Booking System includes an admin dashboard for the booking, service, availability, capacity, and basic business-management features included in the package. Advanced scheduling, staff management, and custom business workflows are not automatically included.",
    },

    domainHosting: [
      "A free vercel.app subdomain can be used.",
      "A custom domain can be connected when compatible.",
      "Custom domain registration and renewal costs are separate.",
      "The setup may use third-party hosting and database services.",
      "Free service tiers may have usage limits.",
      "If the business exceeds a provider's free limits, any required provider upgrade is the client's responsibility.",
    ],

    maintenance: {
      period: "2 Months",
      description:
        "The Basic Booking System includes 2 months of maintenance support beginning from completed delivery or turnover, unless otherwise stated.",
      covered: [
        "Bugs affecting originally delivered booking functionality",
        "Errors affecting included admin features",
        "Errors affecting the included service-capacity rules",
        "Reasonable technical assistance related to the delivered system",
        "Issues within the approved Basic Booking System package scope",
      ],
      notCovered: [
        "New booking workflows",
        "New dashboard modules",
        "New integrations",
        "Major redesigns",
        "Ongoing data entry",
        "Unlimited service or content changes performed by TCL",
        "Third-party outages, limits, policy changes, or provider upgrades",
      ],
    },

    notIncluded: [
      "Multi-step booking wizard",
      "Service-specific working schedules or availability calendars",
      "Staff-specific scheduling",
      "Resource or room scheduling",
      "Advanced capacity or resource allocation rules",
      "Multiple branches or locations",
      "Customer accounts or member portal",
      "Automated online payment gateway",
      "Subscriptions",
      "Loyalty or rewards system",
      "Advanced admin roles and permissions",
      "Advanced analytics and reporting",
      "Automated SMS services",
      "Complex third-party integrations",
      "Custom workflows outside the basic booking structure",
      "Custom domain fees",
    ],

    upgrades: [
      "Multi-step booking experience",
      "Service-specific availability",
      "Staff-specific scheduling",
      "Resource or room scheduling",
      "Multiple locations or branches",
      "Online payment gateway",
      "Customer accounts or member portal",
      "Advanced admin roles and permissions",
      "Advanced reports and analytics",
      "Automated email or messaging workflows",
      "SMS integration",
      "Loyalty or rewards",
      "Advanced booking rules",
      "Other business-specific booking features",
    ],

    process: [
      {
        title: "Purchase",
        description:
          "Purchase the Basic Booking System through the TCL storefront.",
      },
      {
        title: "Prepare Requirements",
        description:
          "Prepare your services, prices, durations, variations, add-ons, capacity limits, availability, policies, branding, and business information.",
      },
      {
        title: "Submit Details",
        description:
          "Provide the required booking and business information through TCL's post-purchase process.",
      },
      {
        title: "System Setup",
        description:
          "TCL configures and customizes the Basic Booking System within the included package scope.",
      },
      {
        title: "Review & Testing",
        description:
          "The customer booking flow, capacity rules, and included admin functions are tested and prepared for review.",
      },
      {
        title: "Launch & Handover",
        description:
          "The completed booking system is deployed and the included maintenance period begins.",
      },
    ],

    faqs: [
      {
        question: "Does the Basic Booking System include an admin dashboard?",
        answer:
          "Yes. It includes a basic admin dashboard for managing bookings, services, variations, add-ons, general availability, unavailable dates, service capacity, and supported business settings.",
      },
      {
        question: "How does the booking capacity work?",
        answer:
          "Each service can have a maximum number of bookings allowed per time slot and an optional maximum number of bookings per day. Canceled bookings do not continue using that capacity.",
      },
      {
        question: "Can different services have completely different schedules?",
        answer:
          "The Basic Booking System uses general business-wide availability. Service-specific working schedules or separate service calendars require an upgrade or custom scope.",
      },
      {
        question: "Can multiple staff members have their own schedules?",
        answer:
          "No. Staff-specific scheduling is not included in the Basic Booking System. Businesses that need individual staff calendars require additional scope.",
      },
      {
        question: "Can customers pay when they book?",
        answer:
          "Automated online payment processing is not included in the standard Basic Booking System package. Payment gateway integration requires additional scope or a custom quotation.",
      },
      {
        question: "What is the difference between Basic and Standard Booking?",
        answer:
          "Basic is intended for straightforward booking with a simple form, basic admin management, general availability, and simple per-service capacity. Standard is for businesses that need a more developed booking experience and additional booking controls beyond the Basic package.",
      },
      {
        question: "Can I request more booking features later?",
        answer:
          "Yes. Features outside the Basic Booking System package can be reviewed as an upgrade or custom quotation.",
      },
    ],
  },


  "standard-booking-system": {
    eyebrow: "STANDARD BOOKING WEBSITE / SYSTEM",

    headline: "Let customers book while you manage everything in one place.",

    introduction:
      "The Standard Booking Website/System combines a customer-facing booking experience with an admin area for managing the core parts of your booking workflow. It is designed for service-based businesses with straightforward appointment or reservation requirements.",

    idealFor: [
      "Beauty and wellness businesses",
      "Nail and beauty studios",
      "Salons and service providers",
      "Consultation-based businesses",
      "Appointment-based professionals",
      "Small businesses currently managing bookings manually",
      "Businesses with a straightforward booking workflow",
    ],

    inclusions: [
      {
        title: "Customer-Facing Website",
        description:
          "A responsive business website where customers can learn about your services and access online booking.",
      },
      {
        title: "Services",
        description:
          "Display the services customers can choose when making a booking.",
      },
      {
        title: "Service Variations",
        description:
          "Supported services can include standard variations when required by the agreed setup.",
      },
      {
        title: "Add-ons",
        description:
          "Optional service add-ons can be included where they fit the standard booking structure.",
      },
      {
        title: "Date Selection",
        description:
          "Customers can select an available booking date.",
      },
      {
        title: "Available Time Selection",
        description:
          "Customers can choose from available booking times based on configured availability.",
      },
      {
        title: "Customer Information",
        description:
          "The booking flow collects the required customer information before submission.",
      },
      {
        title: "Booking Confirmation / Reference",
        description:
          "Submitted bookings receive an on-screen confirmation or reference as provided by the standard system.",
      },
      {
        title: "Booking Statuses",
        description:
          "Core booking statuses include Pending, Confirmed, Canceled, and Completed.",
      },
      {
        title: "Admin Dashboard",
        description:
          "A protected admin area provides access to the standard management tools included in the package.",
      },
      {
        title: "Booking Management",
        description:
          "View and manage submitted bookings from the admin area.",
      },
      {
        title: "Services Management",
        description:
          "Manage the standard service information supported by the booking system.",
      },
      {
        title: "Availability Management",
        description:
          "Configure the business availability used by the standard booking flow.",
      },
      {
        title: "Business Settings",
        description:
          "Manage supported basic business settings used by the booking website.",
      },
      {
        title: "Responsive Design",
        description:
          "Customer-facing and supported admin interfaces are designed for modern screen sizes.",
      },
      {
        title: "Deployment & Setup",
        description:
          "TCL handles the initial deployment and technical setup included in the package.",
      },
    ],

    clientProvides: [
      "Business name and business type / industry",
      "Logo, if available",
      "Short About / business description",
      "Services with prices and durations",
      "Service variations and add-ons, when applicable",
      "Working days, hours, breaks, and normal booking availability",
      "Booking rules such as lead time, advance-booking limits, blocked dates, or time intervals",
      "Customer information you need collected during booking",
      "Cancellation, rescheduling, and no-show policies",
      "Contact information and business location, when applicable",
      "Social media or messaging links",
      "Brand colors, preferred design style, or visual references",
      "Website and service images",
      "Domain preference or existing domain details, when applicable",
    ],

    tclHandles: [
      "Customer-facing booking website",
      "Standard booking flow implementation",
      "Admin dashboard setup",
      "Booking management setup",
      "Services management setup",
      "Availability setup",
      "Basic business settings",
      "Responsive implementation",
      "Database and application setup required by the standard package",
      "Initial deployment",
    ],

    editingAccess: {
      title: "Admin Dashboard Included",
      description:
        "Unlike the simpler website packages, the Standard Booking Website/System includes an admin dashboard for the standard booking management features included in the package. The dashboard does not automatically include every possible business-management feature.",
    },

    domainHosting: [
      "A free vercel.app subdomain can be used.",
      "A custom domain can be connected when compatible.",
      "Custom domain registration and renewal costs are separate.",
      "The standard setup may use third-party hosting and database services.",
      "Free service tiers may have usage limits.",
      "If your business exceeds a provider's free limits, any required provider upgrade is the client's responsibility.",
    ],

    maintenance: {
      period: "2 Months",
      description:
        "The Standard Booking Website/System includes 2 months of maintenance support from completed delivery or turnover, unless otherwise stated.",
      covered: [
        "Bugs affecting originally delivered booking functionality",
        "Errors affecting included admin features",
        "Reasonable technical assistance related to the delivered system",
        "Issues within the approved standard package scope",
      ],
      notCovered: [
        "New booking workflows",
        "New dashboard modules",
        "New integrations",
        "Major redesigns",
        "Ongoing data entry",
        "Unlimited service/content changes performed by TCL",
        "Third-party outages, limits, policy changes, or provider upgrades",
      ],
    },

    notIncluded: [
      "Automated online payment gateway",
      "Customer membership system",
      "Customer account portal",
      "Loyalty or points system",
      "Subscriptions",
      "Complex staff-specific scheduling",
      "Advanced staff roles and permissions",
      "Complex multi-branch scheduling",
      "Advanced analytics",
      "Automated SMS services",
      "Complex third-party integrations",
      "Custom workflows outside the standard booking structure",
      "Custom domain fees",
    ],

    upgrades: [
      "Online payment gateway",
      "Customer accounts",
      "Member portal",
      "Staff-specific scheduling",
      "Multiple locations or branches",
      "Advanced admin permissions",
      "Advanced reports",
      "Automated email or messaging workflows",
      "SMS integration",
      "Loyalty or rewards",
      "Custom booking rules",
      "Other business-specific system features",
    ],

    process: [
      {
        title: "Purchase",
        description:
          "Purchase the Standard Booking Website/System through the storefront.",
      },
      {
        title: "Prepare Requirements",
        description:
          "Prepare your services, prices, durations, availability, policies, branding, and business information.",
      },
      {
        title: "Submit Details",
        description:
          "Provide the required booking and business information through TCL's post-purchase process.",
      },
      {
        title: "System Setup",
        description:
          "TCL configures and customizes the standard booking website and admin system.",
      },
      {
        title: "Review & Testing",
        description:
          "The customer booking flow and included admin functions are tested and prepared for review.",
      },
      {
        title: "Launch & Handover",
        description:
          "The completed system is deployed and the included maintenance period begins.",
      },
    ],

    faqs: [
      {
        question: "Does this include an admin dashboard?",
        answer:
          "Yes. The standard package includes an admin area for the booking, service, availability, and supported business settings included in the package.",
      },
      {
        question: "Can customers pay when they book?",
        answer:
          "Automated online payment processing is not included in the standard package. Payment gateway integration requires additional scope or a custom quotation.",
      },
      {
        question: "Can multiple staff members have different schedules?",
        answer:
          "Complex staff-specific scheduling is not included in the standard package. If your booking workflow depends on individual staff calendars, TCL can review it as a custom requirement.",
      },
      {
        question: "Can I use this for multiple branches?",
        answer:
          "The standard package is intended for a straightforward business setup. Multi-location or complex branch scheduling requires scope review.",
      },
      {
        question: "Can I request additional booking features?",
        answer:
          "Yes. Features outside the standard package can be reviewed and quoted separately.",
      },
    ],
  },


  "online-shop-with-admin": {
    eyebrow: "ONLINE SHOP + ADMIN",

    headline: "Sell online and manage your shop from your own admin dashboard.",

    introduction:
      "The Online Shop + Admin package is designed for product-based businesses that need more control than the Basic Online Shop. Customers can browse products, add items to their cart, submit orders, and follow manual payment instructions, while you can manage products, review orders, verify payments, and update order statuses through a dedicated admin dashboard.",

    idealFor: [
      "Small and growing product-based businesses",
      "Online sellers that want their own branded storefront",
      "Businesses that regularly update products, prices, or product details",
      "Businesses that want to manage orders from an admin dashboard",
      "Businesses using manual GCash, QR Ph, or bank transfer payments",
      "Businesses that need manual payment verification",
      "Businesses that have outgrown a storefront without self-management tools",
    ],

    inclusions: [
      {
        title: "Professional Online Storefront",
        description:
          "A responsive customer-facing online shop where visitors can browse and view your products.",
      },
      {
        title: "Product Catalog & Product Pages",
        description:
          "Products can be organized and displayed with information such as names, prices, descriptions, images, and supported options.",
      },
      {
        title: "Product Variations",
        description:
          "Supported products can include standard variations or options where applicable to the agreed store setup.",
      },
      {
        title: "Shopping Cart",
        description:
          "Customers can add supported products and quantities to a cart before proceeding to checkout.",
      },
      {
        title: "Customer Checkout & Order Submission",
        description:
          "Customers can provide the required order, contact, and delivery information and submit their order through the storefront.",
      },
      {
        title: "Manual Payment Options",
        description:
          "The shop can provide approved manual payment instructions such as GCash, QR Ph, or bank transfer.",
      },
      {
        title: "Payment Proof Submission",
        description:
          "Customers can submit supported payment proof for manual review as part of the agreed order workflow.",
      },
      {
        title: "Order Confirmation / Reference",
        description:
          "Submitted orders can receive an on-screen confirmation or reference through the included order flow.",
      },
      {
        title: "Admin Dashboard",
        description:
          "A protected admin area provides access to the standard shop-management tools included in the package.",
      },
      {
        title: "Product Management",
        description:
          "Add and edit products, update supported product details and prices, and activate or deactivate products from the admin area.",
      },
      {
        title: "Order Management",
        description:
          "View submitted orders and manage their progress through the included order-management workflow.",
      },
      {
        title: "Manual Payment Verification",
        description:
          "Review submitted payment information or proof and manually verify or reject payments from the admin workflow.",
      },
      {
        title: "Order Status Management",
        description:
          "Manage the standard order progression, such as Pending, Confirmed, Processing, Ready, and Completed, as supported by the store setup.",
      },
      {
        title: "Basic Store Settings",
        description:
          "Manage supported basic business or store information used by the online shop.",
      },
      {
        title: "Responsive Storefront & Admin",
        description:
          "The customer storefront and supported admin interfaces are designed for modern mobile, tablet, laptop, and desktop screen sizes.",
      },
      {
        title: "Deployment & Setup",
        description:
          "TCL handles the initial deployment and technical setup included in the package.",
      },
    ],

    clientProvides: [
      "Business or shop name and business type / industry",
      "Logo, if available",
      "Business information and contact details",
      "Product names, descriptions, prices, and images",
      "Product variations or options, when applicable",
      "Product categories or collections, when applicable",
      "GCash, QR Ph, or bank payment instructions",
      "Customer information you need collected during checkout",
      "Shipping, pickup, delivery, or order information",
      "Shop, payment, cancellation, return, or exchange policies that apply to your business",
      "Social media or messaging links, when applicable",
      "Brand colors, preferred design style, or visual references",
      "Domain preference or existing domain details, when applicable",
      "Admin / business setup information required for the included management features",
    ],

    tclHandles: [
      "Customer-facing online storefront",
      "Product catalog and product-page setup",
      "Shopping cart implementation",
      "Customer checkout and order-submission flow",
      "Manual payment instruction and payment-proof workflow",
      "Admin dashboard setup",
      "Product management setup",
      "Order management setup",
      "Manual payment verification workflow",
      "Basic store settings",
      "Responsive implementation",
      "Database and application setup required by the standard package",
      "Initial deployment",
    ],

    editingAccess: {
      title: "Admin Dashboard Included",
      description:
        "Unlike the Basic Online Shop, this package includes an admin dashboard for the standard product, order, payment-verification, and store-management features included in the package. Advanced ecommerce management features are not automatically included.",
    },

    domainHosting: [
      "A free vercel.app subdomain can be used.",
      "A custom domain can be connected when compatible.",
      "Custom domain registration and renewal costs are separate.",
      "The standard setup may use third-party hosting, database, storage, or other services.",
      "Free service tiers may have usage limits.",
      "If the business exceeds a provider's free limits, any required provider upgrade is the client's responsibility.",
    ],

    maintenance: {
      period: "2 Months",
      description:
        "The Online Shop + Admin package includes 2 months of maintenance support beginning from completed delivery or turnover, unless otherwise stated.",
      covered: [
        "Bugs affecting the originally delivered storefront",
        "Errors affecting the included cart, checkout, or order flow",
        "Errors affecting included admin features",
        "Issues affecting the included manual payment-verification workflow",
        "Reasonable technical assistance related to the delivered system",
        "Issues within the approved standard package scope",
      ],
      notCovered: [
        "Ongoing product or data entry performed by TCL",
        "New ecommerce functionality",
        "New dashboard modules",
        "New integrations",
        "Major redesigns",
        "Custom business workflows outside the package",
        "Third-party outages, policy changes, usage limits, or paid upgrades",
      ],
    },

    notIncluded: [
      "Automated payment gateways",
      "Customer account system",
      "Memberships or member pricing",
      "Loyalty points or rewards systems",
      "Subscriptions",
      "Referral systems",
      "Advanced inventory automation",
      "Complex shipping or courier integrations",
      "Advanced analytics",
      "Custom admin roles and permissions",
      "Multi-vendor functionality",
      "Custom business workflows outside the standard shop structure",
      "Custom domain fees",
    ],

    upgrades: [
      "Automated payment gateway",
      "Customer accounts",
      "Membership or member pricing",
      "Loyalty points and rewards",
      "Subscriptions",
      "Referral features",
      "Advanced inventory automation",
      "Custom shipping or courier integrations",
      "Advanced analytics and reporting",
      "Additional admin roles or permissions",
      "Custom order or business workflows",
      "Other advanced ecommerce functionality",
    ],

    process: [
      {
        title: "Purchase",
        description:
          "Purchase the Online Shop + Admin package through the TCL storefront.",
      },
      {
        title: "Prepare Requirements",
        description:
          "Prepare your business information, products, images, prices, variations, payment details, delivery information, policies, and branding.",
      },
      {
        title: "Submit Details",
        description:
          "Provide the required store and admin setup information through TCL's post-purchase process.",
      },
      {
        title: "Store & Admin Setup",
        description:
          "TCL builds and configures the customer storefront and standard admin dashboard within the package scope.",
      },
      {
        title: "Review & Testing",
        description:
          "The storefront, cart, order flow, manual payment workflow, and included admin functions are tested and prepared for review.",
      },
      {
        title: "Launch & Handover",
        description:
          "The completed online shop and admin system are deployed and the included maintenance period begins.",
      },
    ],

    faqs: [
      {
        question:
          "What is the difference between this and the ₱5,999 Basic Online Shop?",
        answer:
          "The Basic Online Shop does not include an admin dashboard. The Online Shop + Admin package includes standard tools for managing products, orders, manual payment verification, order statuses, and supported store settings.",
      },
      {
        question: "Can I add and edit products myself?",
        answer:
          "Yes. The included admin dashboard provides the standard product-management features supported by this package, including adding and editing products and updating supported product details and prices.",
      },
      {
        question: "Does it automatically process GCash, Maya, or card payments?",
        answer:
          "No. The standard package uses manual payment methods such as GCash, QR Ph, or bank transfer with manual verification. Automated payment gateway integration requires additional scope or a custom quotation.",
      },
      {
        question: "Can customers upload payment proof?",
        answer:
          "Yes. Payment proof submission can be included as part of the standard manual payment workflow for admin review.",
      },
      {
        question: "Does it include inventory automation?",
        answer:
          "Advanced inventory automation is not included in the standard package. If your business requires automated stock rules, inventory integrations, or more complex inventory workflows, TCL can review them as a custom requirement.",
      },
      {
        question:
          "Can I add memberships, rewards, referrals, or customer accounts?",
        answer:
          "Those features are outside the standard Online Shop + Admin package and require additional scope and pricing review.",
      },
    ],
  },

  "custom-business-website": {
    eyebrow: "CUSTOM WEBSITE / SYSTEM",

    headline: "Built around your actual business requirements.",

    introduction:
      "Custom development is for businesses, professionals, organizations, educators, and other clients whose project cannot be properly covered by a fixed TCL package. The final scope, features, pricing, and timeline are determined after reviewing your requirements.",

    idealFor: [
      "Businesses with custom workflows",
      "Projects requiring an admin dashboard",
      "Custom booking or scheduling systems",
      "Advanced ecommerce requirements",
      "Portals and account-based systems",
      "Quiz, reviewer, or educational systems",
      "Management tools",
      "Organizations with specialized website requirements",
      "Projects requiring custom integrations",
      "Ideas that do not fit a fixed TCL package",
    ],

    inclusions: [
      {
        title: "Custom Project Planning",
        description:
          "The project is reviewed based on the actual goal, users, workflow, features, and technical requirements.",
      },
      {
        title: "Custom Pages & Structure",
        description:
          "The number and type of pages can be planned according to the approved project scope.",
      },
      {
        title: "Custom User Experience",
        description:
          "Customer, member, student, staff, or administrator workflows can be designed around the approved requirements.",
      },
      {
        title: "Admin & Management Features",
        description:
          "Admin dashboards and management tools can be included when required by the approved quotation.",
      },
      {
        title: "Database Features",
        description:
          "Projects can include structured data storage and management when required by the approved system design.",
      },
      {
        title: "Integrations",
        description:
          "Supported third-party services can be integrated when technically appropriate and included in the approved scope.",
      },
      {
        title: "Responsive Development",
        description:
          "Customer-facing interfaces are designed for appropriate modern screen sizes based on project requirements.",
      },
      {
        title: "Testing & Deployment",
        description:
          "The approved project is tested and prepared for deployment as defined by the project scope.",
      },
    ],

    clientProvides: [
      "Project or business information",
      "Main project goal and the problem the project should solve",
      "Content and details for the pages or sections included in the accepted quotation",
      "Workflow and functionality details for features included in the accepted scope",
      "Business rules, statuses, approvals, calculations, roles, schedules, or restrictions when applicable",
      "Branding, visual references, content, and available media",
      "Information needed for integrations or third-party services included in the accepted quotation",
      "Domain preference or existing domain details, when applicable",
      "Any other materials specifically identified during quotation or project review",
    ],

    tclHandles: [
      "Project scope review",
      "Technical planning",
      "Approved interface implementation",
      "Approved system functionality",
      "Database setup when required",
      "Approved integrations",
      "Responsive implementation",
      "Testing",
      "Deployment",
      "Project handover based on the agreed scope",
    ],

    editingAccess: {
      title: "Based on the Approved Scope",
      description:
        "Admin dashboards, self-management tools, user accounts, permissions, and other management features are not automatically included in every custom project. They are included when specified in the approved quotation and scope of work.",
    },

    domainHosting: [
      "Domain, hosting, database, email, storage, payment, and other provider requirements depend on the project.",
      "Free provider tiers may be used when appropriate and available.",
      "Third-party usage limits and provider policies apply.",
      "Paid provider plans, domains, subscriptions, transaction charges, and other external fees are separate unless specifically included in the quotation.",
      "Client-owned service accounts may be required for certain projects.",
    ],

    maintenance: {
      period: "6 Months",
      description:
        "Fully customized websites and systems include 6 months of maintenance support beginning from completed delivery or turnover, unless the approved quotation states otherwise.",
      covered: [
        "Bugs or errors affecting functionality delivered within the approved scope",
        "Reasonable technical assistance related to the delivered project",
        "Issues caused by the original implementation within the agreed scope",
      ],
      notCovered: [
        "New features",
        "New pages or modules",
        "Major redesigns",
        "New integrations",
        "Changes to the approved workflow",
        "Ongoing content or data-entry work",
        "Third-party outages, policy changes, usage limits, price changes, or required upgrades",
      ],
    },

    notIncluded: [
      "Any feature not listed in the approved quotation or scope",
      "Unlimited revisions",
      "Unlimited future development",
      "Unlimited content management by TCL",
      "Third-party subscriptions unless specifically included",
      "Domain registration unless specifically included",
      "Provider usage fees unless specifically included",
      "Features requested after scope approval without additional review",
    ],

    upgrades: [
      "Additional pages or modules",
      "Additional user roles",
      "New dashboards",
      "New workflows",
      "Additional integrations",
      "Payment systems",
      "Advanced automation",
      "Reporting and analytics",
      "Additional account or portal features",
      "Future development after project completion",
    ],

    process: [
      {
        title: "Request a Quote",
        description:
          "Complete TCL's quotation form with as much information as you currently have about the project.",
      },
      {
        title: "Project Review",
        description:
          "TCL reviews the project goal, workflow, users, features, integrations, volume, and other requirements.",
      },
      {
        title: "Quotation",
        description:
          "A quotation is prepared based on the reviewed project scope.",
      },
      {
        title: "Acceptance",
        description:
          "The approved scope, pricing, and payment option are confirmed before development begins.",
      },
      {
        title: "Development & Review",
        description:
          "The project is developed, tested, and prepared for client review according to the approved scope.",
      },
      {
        title: "Completion & Handover",
        description:
          "After the agreed completion process, the project is prepared for final delivery or launch and the applicable maintenance period begins.",
      },
    ],

    faqs: [
      {
        question: "Is requesting a quotation a commitment to purchase?",
        answer:
          "No. The quotation request allows TCL to understand and review your requirements before preparing the appropriate scope and pricing.",
      },
      {
        question: "How much does a custom project cost?",
        answer:
          "There is no single fixed price. Pricing depends on the project's pages, workflows, features, integrations, complexity, and other requirements.",
      },
      {
        question: "Can my custom project include an admin dashboard?",
        answer:
          "Yes. Admin and management functionality can be included when required and listed in the approved project scope.",
      },
      {
        question: "Can I request something that is not listed?",
        answer:
          "Yes. Describe the workflow, problem, or feature in the quotation form. TCL will review whether it can be included and how it affects the scope.",
      },
      {
        question: "What happens if I request another feature after accepting?",
        answer:
          "The accepted quotation defines the agreed scope. New or changed requirements may require additional pricing and an updated project scope.",
      },
      {
        question: "Does the project stop working after 6 months?",
        answer:
          "No. Six months refers to the included maintenance support period. It is not an expiration date for the delivered website or system.",
      },
    ],
  },
};

export function getProductPageDetails(
  slug: string,
): ProductPageDetails | null {
  return productPageDetails[slug] ?? null;
}