"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./project-requirements.module.css";

type Props = {
  token: string;
  productSlug: string;
  productName: string;
  productCategory: string | null;
  productTier: string | null;
  customerName: string | null;
  customerEmail: string;
  existingRequirements: Record<string, unknown>;
  existingNotes: string;
  existingStatus: string;
};

type Question = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "checkboxes";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

type Feature = {
  key: string;
  label: string;
  helper: string;
  prompts?: string[];
};

type ScopeCopy = {
  included: string[];
  excluded: string[];
};

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function arrayValue(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function inferTier(
  productTier: string | null,
  productSlug: string,
  productName: string,
) {
  const explicit = (productTier ?? "").trim().toLowerCase();
  const source = `${productSlug} ${productName}`.toLowerCase();

  const tiers = [
    "enterprise",
    "starter",
    "basic",
    "solo",
    "pro",
    "business",
  ];

  for (const tier of tiers) {
    if (
      explicit === tier ||
      explicit === `${tier} package` ||
      explicit === `${tier} tier` ||
      explicit.startsWith(`${tier} `)
    ) {
      return tier;
    }
  }

  for (const tier of tiers) {
    if (
      source.includes(`-${tier}`) ||
      source.includes(`${tier}-`) ||
      new RegExp(`\\b${tier}\\b`, "i").test(source)
    ) {
      return tier;
    }
  }

  return explicit;
}

function tierIs(tier: string, allowed: string[]) {
  return allowed.some((item) => tier === item);
}

function inferFamily(productCategory: string | null, productName: string) {
  const source = `${productCategory ?? ""} ${productName}`.toLowerCase();

  if (source.includes("booking")) return "booking";
  if (source.includes("digital") && source.includes("shop")) return "digital_shop";
  if (source.includes("physical") && source.includes("shop")) return "physical_shop";
  if (source.includes("starter kit")) return "starter_kit";
  return "custom_website";
}

type CurrentProduct =
  | "starter"
  | "simple"
  | "shop"
  | "booking"
  | "custom";

function currentProduct(productSlug: string): CurrentProduct {
  const slug = productSlug.trim().toLowerCase();
  if (slug === "starter-website") return "starter";
  if (slug === "simple-business-website") return "simple";
  if (slug === "basic-online-shop") return "shop";
  if (slug === "standard-booking-system") return "booking";
  return "custom";
}

function isSimpleBusinessWebsite(productSlug: string) {
  return currentProduct(productSlug) === "simple";
}

function displayTier(tier: string) {
  if (!tier) return "your selected package";
  return `${tier.charAt(0).toUpperCase()}${tier.slice(1)} package`;
}

function ScopeNotice({
  scope,
  tier,
}: {
  scope: ScopeCopy;
  tier: string;
}) {
  return (
    <div className={styles.promptBox}>
      <span>✓ INCLUDED IN {displayTier(tier).toUpperCase()}</span>
      <ul>
        {scope.included.map((item) => (
          <li key={`in-${item}`}>{item}</li>
        ))}
      </ul>

      <span style={{ marginTop: "10px", color: "#7a6870" }}>
        NOT INCLUDED / OUTSIDE THIS FIELD
      </span>
      <ul>
        {scope.excluded.map((item) => (
          <li key={`out-${item}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function questionScope(
  key: string,
  family: string,
  tier: string,
): ScopeCopy {
  const common: Record<string, ScopeCopy> = {
    business_name: {
      included: ["Your official business, brand, or professional name."],
      excluded: ["Business-name registration, trademark work, or legal naming services."],
    },
    business_type: {
      included: ["Your business type, industry, and the kind of service or product you offer."],
      excluded: ["Requests to add a separate business, branch, or unrelated business model unless your package includes it."],
    },
    business_location: {
      included: ["Your city, country, service area, or normal customer coverage."],
      excluded: ["Multi-branch or multi-location functionality unless it is specifically included in your tier."],
    },
    main_goal: {
      included: ["The main problem this purchased system or website should solve using the features included in your tier."],
      excluded: ["New modules, apps, integrations, automations, or functions that are not part of your purchased package."],
    },
    target_customers: {
      included: ["Your typical customers, audience, and who the website/system should be designed for."],
      excluded: ["Separate portals, membership levels, wholesale systems, or role-based customer access unless included in your tier."],
    },
    logo_status: {
      included: ["Tell us whether you already have a logo so we know what branding assets are available."],
      excluded: ["Logo design or full branding work unless separately purchased or specifically included."],
    },
    brand_colors: {
      included: ["Your preferred website/system colors and existing brand palette."],
      excluded: ["Full brand identity development, brand guidelines, or logo redesign unless separately included."],
    },
    brand_style: {
      included: ["Visual preferences such as minimal, feminine, luxury, clean, playful, bold, or corporate."],
      excluded: ["Unlimited design concepts or complete brand strategy outside the purchased project scope."],
    },
    social_links: {
      included: ["Links you want displayed or connected as normal social/contact links."],
      excluded: ["Custom social-media automation, social login, message syncing, or API integrations unless included in your tier."],
    },
  }

  if (key in common) return common[key];

  if (family === "booking") {
    const map: Record<string, ScopeCopy> = {
      services: {
        included: ["Service name, description, standard price, duration, and basic service information for services supported by your package."],
        excluded: tier === "basic"
          ? ["Variants, add-ons, packages, bundles, staff-specific services, advanced pricing rules, or promo pricing."]
          : ["Anything beyond the service options and pricing tools included in your selected tier."],
      },
      working_schedule: {
        included: ["Your normal working days, opening hours, breaks, and standard availability rules."],
        excluded: tier === "enterprise"
          ? ["External workforce scheduling systems that are not part of the agreed integration scope."]
          : ["Separate schedules for multiple staff or branches unless your tier includes multi-staff/multi-location scheduling."],
      },
      booking_rules: {
        included: ["Booking lead time, advance-booking window, basic customer rules, and instructions supported by your package."],
        excluded: ["Custom approval engines, complex conditional booking logic, memberships, queues, or automation outside your tier."],
      },
      cancellation_policy: {
        included: ["Your cancellation, rescheduling, no-show, and lateness wording/rules shown to customers."],
        excluded: ["Automatic penalties, refunds, wallet credits, or complex payment automation unless those functions are included."],
      },
    };
    if (map[key]) return map[key];
  }

  if (family === "digital_shop") {
    const map: Record<string, ScopeCopy> = {
      digital_products: {
        included: ["Product names, prices, descriptions, and the digital products you will sell through the included catalog."],
        excluded: tier === "solo"
          ? ["Advanced bundles, memberships, subscriptions, licensing systems, customer accounts, or complex access rules."]
          : ["Functionality not listed in your purchased digital-shop tier."],
      },
      file_types: {
        included: ["The file or access formats used by the products supported by your tier."],
        excluded: ["Custom streaming platforms, DRM systems, external course portals, or special licensing technology unless included."],
      },
      product_categories: {
        included: ["Basic categories or collections used to organize products in your included catalog."],
        excluded: tier === "solo"
          ? ["Advanced dynamic collections, complex filters, bundles, or recommendation engines."]
          : ["Advanced merchandising logic beyond your selected tier."],
      },
      shop_policies: {
        included: ["Your refund, download, access, and customer-policy wording."],
        excluded: ["Legal drafting, compliance certification, or custom dispute/refund automation outside the package."],
      },
    };
    if (map[key]) return map[key];
  }

  if (family === "physical_shop") {
    const map: Record<string, ScopeCopy> = {
      physical_products: {
        included: ["Product names, standard prices, descriptions, and variants supported by your tier."],
        excluded: tier === "solo"
          ? ["Advanced inventory, warehouse logic, supplier workflows, complex bundles, or branch-specific stock."]
          : ["Product/inventory functionality beyond your selected tier."],
      },
      shipping_regions: {
        included: ["Delivery areas, pickup details, and shipping rules supported by your package."],
        excluded: ["Custom courier APIs, live carrier rates, fulfillment-center integrations, or advanced routing unless included."],
      },
      order_policies: {
        included: ["Your return, exchange, cancellation, fulfillment, and customer-policy wording."],
        excluded: ["Legal drafting or automated refund/returns systems outside your purchased tier."],
      },
    };
    if (map[key]) return map[key];
  }

  if (family === "starter_kit") {
    const map: Record<string, ScopeCopy> = {
      services_or_products: {
        included: ["The services or products that need to be presented using the sections/features included in your package."],
        excluded: tier === "solo"
          ? ["Full ecommerce, advanced booking, payment processing, reports, staff roles, or branch management."]
          : ["Functions not listed in your selected Business Starter Kit tier."],
      },
      pages_needed: {
        included: ["Choose the standard informational pages/sections you need within the purchased website scope."],
        excluded: ["Large custom portals, dashboards, complex web-app pages, or unlimited extra pages outside the agreed scope."],
      },
      preferred_contact: {
        included: ["Choose normal contact channels or links customers can use."],
        excluded: ["Custom CRM syncing, omnichannel inboxes, chatbot systems, or messaging automation unless included."],
      },
    };
    if (map[key]) return map[key];
  }

  const customMap: Record<string, ScopeCopy> = {
    pages_needed: {
      included: ["Pages and sections covered by the quotation or agreed customized website scope."],
      excluded: ["Additional pages, portals, dashboards, or systems not included in the accepted quotation."],
    },
    website_functions: {
      included: ["Functions specifically covered by the accepted quotation or purchased custom scope."],
      excluded: ["Any new feature, integration, automation, booking/shop module, or backend system not included in the accepted scope."],
    },
    domain_status: {
      included: ["Tell us whether you already have a domain or need normal domain setup guidance."],
      excluded: ["Domain purchase fees, premium domains, trademark issues, or ongoing third-party subscription costs unless quoted."],
    },
  };
  if (customMap[key]) return customMap[key];

  return {
    included: ["Information needed to configure the features already included in your purchased package."],
    excluded: ["New functionality, integrations, or custom development outside your package scope."],
  };
}

function shouldShowQuestionScope(key: string) {
  return ![
    "business_name",
    "business_type",
    "business_location",
    "target_customers",
    "logo_status",
    "brand_colors",
    "brand_style",
    "social_links",
  ].includes(key);
}

function featureScope(
  feature: Feature,
  family: string,
  tier: string,
): ScopeCopy {
  const key = feature.key;

  if (family === "booking") {
    const map: Record<string, ScopeCopy> = {
      booking_site: {
        included: ["Layout/content for the booking experience, basic sections, instructions, notices, and the customer path into booking."],
        excluded: ["Unrelated website modules, customer portals, memberships, custom apps, or features that belong to a higher tier."],
      },
      booking_form: {
        included: ["Standard booking fields, required/optional customer details, notes, and reference information supported by the form."],
        excluded: ["Complex conditional forms, multi-step approval logic, custom document workflows, or external form integrations not in the package."],
      },
      service_management: {
        included: ["Manage service name, description, price, duration, visibility, and basic availability for included services."],
        excluded: tier === "basic"
          ? ["Service variants, add-ons, bundles, memberships, advanced pricing, staff-specific services, or branch-specific services."]
          : ["Service functionality that belongs to a higher package or was not included in the purchased tier."],
      },
      availability_schedule: {
        included: ["Working days/hours, breaks, blocked dates, time intervals, and basic advance-booking rules."],
        excluded: tier === "enterprise"
          ? ["External workforce systems or calendar integrations not included in the agreed Enterprise integration scope."]
          : ["Multiple staff schedules, multiple branches, resource scheduling, or advanced calendar integrations unless your tier includes them."],
      },
      admin_dashboard: {
        included: ["The dashboard summaries, included records, counters, and management actions available in your tier."],
        excluded: ["New analytics modules, accounting dashboards, staff permission systems, or custom admin tools outside your package."],
      },
      booking_statuses: {
        included: ["Standard booking stages such as Pending, Confirmed, Cancelled, and Completed, plus normal status handling supported by your system."],
        excluded: ["Complex workflow engines, automatic task assignment, multi-department approvals, or external CRM pipelines unless included."],
      },
      customer_details: {
        included: ["Customer contact details, booking notes, and information stored with bookings according to your included system."],
        excluded: tier === "basic"
          ? ["Full searchable customer CRM/database, loyalty profiles, memberships, or advanced customer analytics."]
          : ["Customer-management functions beyond those included in your selected tier."],
      },
      service_variants: {
        included: ["Included service options/add-ons, their prices, durations, labels, and how customers select them."],
        excluded: ["Complex product configurators, inventory-linked add-ons, subscriptions, memberships, or pricing engines not included."],
      },
      email_notifications: {
        included: ["The booking/admin email events provided by your tier and the wording/details those emails should contain."],
        excluded: ["SMS, WhatsApp, marketing campaigns, drip sequences, CRM automation, or paid email platforms unless separately included."],
      },
      payment_downpayment: {
        included: ["The supported deposit/payment method, fixed/percentage amount, verification, and booking-payment status flow included in your tier."],
        excluded: ["Installment financing, wallets, subscriptions, automatic refunds, accounting integrations, or unsupported payment gateways."],
      },
      promotions: {
        included: ["Promo/discount rules supported by your Pro or Enterprise package, such as codes, limits, validity, and basic discount values."],
        excluded: ["Complex loyalty systems, referral programs, dynamic pricing engines, or third-party promo platforms unless included."],
      },
      customer_database: {
        included: ["Searchable customer records and the booking/history information included in this tier."],
        excluded: ["Full CRM, sales pipelines, marketing automation, loyalty/membership systems, or external CRM sync unless included."],
      },
      reports: {
        included: ["Reports/filters/exports available from booking, customer, and included system data."],
        excluded: ["Custom BI dashboards, predictive analytics, accounting reports, or external data warehouse integrations unless included."],
      },
      payment_history: {
        included: ["View/log/verify payment records and the payment-history actions available in this tier."],
        excluded: ["Full bookkeeping, invoicing suite, bank reconciliation, accounting software sync, or unsupported gateway automation."],
      },
      staff_roles: {
        included: ["Staff/admin roles and the permissions supported by the Enterprise system."],
        excluded: ["HR, payroll, attendance, commissions, workforce management, or enterprise identity systems unless separately scoped."],
      },
      staff_scheduling: {
        included: ["Multiple staff calendars, customer staff selection, and staff availability rules included in Enterprise."],
        excluded: ["Payroll scheduling, shift bidding, attendance tracking, or external workforce tools unless separately scoped."],
      },
      multiple_locations: {
        included: ["Branches/locations and the services, schedules, and booking choices supported by Enterprise."],
        excluded: ["Franchise accounting, warehouse operations, ERP functionality, or location systems not included in the project scope."],
      },
      integrations: {
        included: ["Only the third-party integrations/automations specifically supported and agreed for this Enterprise project."],
        excluded: ["Any unsupported API, paid third-party service, custom integration, or automation not listed in the agreed scope."],
      },
    };
    if (map[key]) return map[key];
  }

  if (family === "digital_shop") {
    const map: Record<string, ScopeCopy> = {
      catalog: {
        included: ["Product listing, basic categories/organization, featured items, and catalog presentation included in your tier."],
        excluded: ["Marketplace functionality, recommendation engines, complex faceted search, or advanced merchandising not included."],
      },
      product_pages: {
        included: ["Product title, description, price, preview/details, included file/access information, and normal purchase information."],
        excluded: ["Interactive product builders, course platforms, memberships, subscriptions, or custom previews outside your tier."],
      },
      checkout: {
        included: ["Customer/order fields and checkout steps supported by the purchased shop package."],
        excluded: ["Unsupported payment gateways, financing, subscriptions, tax engines, multi-currency systems, or complex checkout logic unless included."],
      },
      secure_delivery: {
        included: ["Secure file/access delivery behavior supported by your tier after successful purchase."],
        excluded: tier === "solo"
          ? ["Advanced licensing, subscriptions, memberships, DRM, customer accounts, or complex access-control rules."]
          : ["Delivery/access features not included in your selected tier."],
      },
      orders_admin: {
        included: ["Order records, customer/order details, and the standard admin actions included with your shop."],
        excluded: ["Full CRM, accounting, advanced fulfillment, ERP, or custom back-office modules not included."],
      },
      multiple_files: {
        included: ["Multiple downloadable files attached to one product and how those included files should be organized."],
        excluded: ["Streaming platforms, course lesson systems, memberships, or advanced access-control logic unless included."],
      },
      promos: {
        included: ["Discount/promo tools available in the selected tier, such as codes, sale prices, limits, and dates."],
        excluded: ["Advanced affiliate, referral, loyalty, or dynamic pricing systems unless included."],
      },
      customer_records: {
        included: ["Customer details and purchase history stored by the shop according to your tier."],
        excluded: ["Full CRM, marketing automation, loyalty systems, or external customer-data integrations unless included."],
      },
      emails: {
        included: ["Automated order/customer/admin emails included in your tier."],
        excluded: ["Marketing campaigns, newsletters, drip sequences, SMS, or external CRM automations unless included."],
      },
      customer_accounts: {
        included: ["Login/account access, purchase history, and download access supported by Business/Enterprise."],
        excluded: ["Communities, memberships, social profiles, subscription portals, or custom account modules unless included."],
      },
      reports_exports: {
        included: ["Sales, order, customer, and download reports/exports supported by your tier."],
        excluded: ["Custom BI, accounting dashboards, predictive analytics, or external data-warehouse integrations."],
      },
      bundles_collections: {
        included: ["Bundles/collections supported by your Business/Enterprise package."],
        excluded: ["Complex subscription boxes, dynamic bundle builders, recommendation engines, or marketplace logic unless included."],
      },
      licensing_access: {
        included: ["Enterprise licensing/access rules specifically agreed for the project."],
        excluded: ["Custom DRM, device fingerprinting, enterprise SSO, or external licensing platforms not included in scope."],
      },
      admin_roles: {
        included: ["Enterprise admin/team roles and included permissions."],
        excluded: ["HR/payroll systems, enterprise identity management, or permissions unrelated to the shop admin scope."],
      },
      integrations: {
        included: ["Only third-party tools and automations specifically agreed within the Enterprise scope."],
        excluded: ["Unsupported APIs, paid services, or custom integrations not included in the accepted scope."],
      },
    };
    if (map[key]) return map[key];
  }

  if (family === "physical_shop") {
    const map: Record<string, ScopeCopy> = {
      catalog: {
        included: ["Product listing, categories/collections, featured products, and catalog organization included in your tier."],
        excluded: ["Marketplace/multi-vendor systems, recommendation engines, or advanced merchandising not included."],
      },
      variants: {
        included: ["Normal product options such as size, color, type, and supported price differences."],
        excluded: ["Complex made-to-order configurators, custom manufacturing logic, or variant rules beyond your package."],
      },
      cart_checkout: {
        included: ["Cart flow, checkout fields, customer details, and supported order steps included in your tier."],
        excluded: ["Unsupported gateways, financing, subscriptions, advanced tax engines, or complex checkout logic unless included."],
      },
      orders: {
        included: ["Standard order statuses, order details, and admin actions provided by your shop."],
        excluded: ["ERP, accounting, procurement, warehouse-management, or complex fulfillment systems unless included."],
      },
      shipping_pickup: {
        included: ["Shipping/delivery/pickup options and rules supported by your shop package."],
        excluded: ["Live carrier APIs, route optimization, fulfillment-center connections, or custom logistics integrations unless included."],
      },
      inventory: {
        included: ["Basic stock quantities and low-stock behavior provided by Pro/Business/Enterprise."],
        excluded: ["Warehouse transfers, supplier purchasing, forecasting, or advanced multi-location inventory unless your tier includes it."],
      },
      payments: {
        included: ["Supported payment methods and payment-status/verification flow in your tier."],
        excluded: ["Unsupported gateways, financing, subscriptions, accounting reconciliation, or complex refund systems unless included."],
      },
      promos: {
        included: ["Discount/voucher tools included in your tier, such as codes, sale prices, minimum spend, limits, and expiry."],
        excluded: ["Advanced loyalty, affiliate, referral, or dynamic pricing systems unless included."],
      },
      emails: {
        included: ["Order/customer/admin notification events included in your tier."],
        excluded: ["Marketing automation, newsletters, SMS, WhatsApp, or external CRM campaigns unless included."],
      },
      advanced_inventory: {
        included: ["Business/Enterprise inventory controls included for variants, restocking, and supported stock reporting."],
        excluded: ["Full ERP/WMS, demand forecasting, procurement automation, or unsupported warehouse workflows."],
      },
      reports: {
        included: ["Sales, order, inventory, and customer reports/exports provided by your tier."],
        excluded: ["Custom BI, accounting dashboards, predictive analytics, or external data-warehouse integrations."],
      },
      customer_database: {
        included: ["Customer purchase history and customer information available in your tier."],
        excluded: ["Full CRM, marketing automation, loyalty programs, or external CRM sync unless included."],
      },
      branches_warehouses: {
        included: ["Enterprise branches/warehouses and the stock/fulfillment rules specifically supported by the project."],
        excluded: ["Full ERP/WMS, franchise accounting, fleet management, or systems not included in the agreed Enterprise scope."],
      },
      roles: {
        included: ["Enterprise staff/admin roles and permissions for the shop system."],
        excluded: ["HR, payroll, attendance, enterprise identity management, or unrelated staff systems."],
      },
      supplier_workflows: {
        included: ["Supplier/restock workflows specifically included in the Enterprise package/project scope."],
        excluded: ["Full procurement/ERP, supplier portals, EDI, accounting automation, or unsupported purchasing workflows."],
      },
      integrations: {
        included: ["Shipping/accounting integrations specifically agreed for the Enterprise project."],
        excluded: ["Unsupported APIs, paid third-party services, or integrations not included in the accepted scope."],
      },
    };
    if (map[key]) return map[key];
  }

  if (family === "starter_kit") {
    const map: Record<string, ScopeCopy> = {
      business_website: {
        included: ["Standard website pages/sections, content, calls-to-action, and design setup included in your Starter Kit tier."],
        excluded: ["Large portals, complex web apps, custom dashboards, ecommerce/booking functions not included in your tier."],
      },
      services_products: {
        included: ["Presentation of your services/products using the display options included in your package."],
        excluded: tier === "solo"
          ? ["Full shopping cart, checkout, advanced booking, inventory, or payment systems."]
          : ["Commerce/booking functions that are not part of your selected tier."],
      },
      inquiry: {
        included: ["Included customer inquiry fields, contact details, and where normal inquiries should go."],
        excluded: ["CRM pipelines, ticketing systems, chatbot flows, complex conditional forms, or unsupported integrations."],
      },
      admin: {
        included: ["The content/settings your selected Starter Kit allows you to manage."],
        excluded: ["New admin modules, role systems, analytics, accounting, or management tools not included in the tier."],
      },
      booking_inquiry_tracking: {
        included: ["Pro/Business/Enterprise booking or inquiry tracking stages included in the package."],
        excluded: ["Complex CRM pipelines, staff scheduling, multi-location workflow, or external task-management automation unless included."],
      },
      customer_records: {
        included: ["Customer/contact history and notes supported by your tier."],
        excluded: ["Full CRM, loyalty, memberships, marketing automation, or external CRM sync unless included."],
      },
      emails: {
        included: ["Customer/admin email notifications provided by your tier."],
        excluded: ["Marketing campaigns, newsletters, SMS, WhatsApp, or advanced automation unless included."],
      },
      promotions: {
        included: ["Basic featured offers/promotions supported by your tier."],
        excluded: ["Advanced promo-code engines, loyalty, referral, affiliate, or dynamic pricing systems unless included."],
      },
      payments: {
        included: ["Payment methods and payment workflow included in Business/Enterprise Starter Kit."],
        excluded: ["Unsupported gateways, subscriptions, financing, accounting systems, or complex refund automation."],
      },
      shop_or_booking: {
        included: ["The shop or advanced booking functionality specifically included in your Business/Enterprise tier."],
        excluded: ["Features beyond that included module, such as marketplace, ERP, multi-vendor, or unsupported booking/ecommerce workflows."],
      },
      reports: {
        included: ["Reports included for the sales/bookings/customer data available in your tier."],
        excluded: ["Custom BI, accounting dashboards, predictive analytics, or external warehouse/reporting systems."],
      },
      staff: {
        included: ["Enterprise staff roles and permissions specifically included in the system."],
        excluded: ["HR, payroll, attendance, workforce-management, or enterprise identity tools not included."],
      },
      branches: {
        included: ["Enterprise branches/locations and supported location-specific content/workflows."],
        excluded: ["Franchise ERP, warehouse management, complex inter-branch accounting, or systems not included in scope."],
      },
      automation: {
        included: ["Only automations/integrations specifically agreed within the Enterprise project scope."],
        excluded: ["Unsupported APIs, paid services, custom integrations, or automations not included in the accepted scope."],
      },
    };
    if (map[key]) return map[key];
  }

  const customMap: Record<string, ScopeCopy> = {
    custom_design: {
      included: ["Design direction, references, layouts, and visual choices covered by the accepted quotation."],
      excluded: ["Additional brand identity work, unlimited concepts, or design work not included in the accepted scope."],
    },
    pages_sections: {
      included: ["Pages/sections specifically included in the accepted quotation."],
      excluded: ["Additional pages, portals, dashboards, or modules not included in the accepted scope."],
    },
    forms: {
      included: ["Forms, fields, validation, destinations, and notifications specifically included in the agreed project."],
      excluded: ["Complex workflow engines, external CRM/ticketing integration, or forms not included in the quotation."],
    },
    booking: {
      included: ["Booking functionality specifically listed in the accepted customized website scope."],
      excluded: ["Booking modules, staff scheduling, payments, or advanced booking functions not included in the quotation."],
    },
    shop: {
      included: ["Ecommerce functionality specifically listed in the accepted customized website scope."],
      excluded: ["Marketplace, subscriptions, inventory, advanced checkout, or integrations not included in the quotation."],
    },
    admin: {
      included: ["Admin controls specifically included in the accepted customized website scope."],
      excluded: ["Additional dashboards, reporting, staff permissions, CRM, or back-office modules not included in the quotation."],
    },
    integrations: {
      included: ["Only integrations specifically listed and accepted in the quotation."],
      excluded: ["Any new API, third-party service, automation, or paid integration not included in the accepted scope."],
    },
  };

  return customMap[key] ?? {
    included: ["Configuration and behavior specifically included in your purchased package."],
    excluded: ["Any feature or custom development not included in your selected package."],
  };
}

function buildQuestions(
  productCategory: string | null,
  productName: string,
  productSlug: string,
): Question[] {
  const source = `${productCategory ?? ""} ${productName}`.toLowerCase();

  if (currentProduct(productSlug) === "starter") {
    return [
      { key: "business_name", label: "Business / brand name", required: true },
      { key: "business_type", label: "Business type / industry", required: true },
      { key: "about_business", label: "Short About / business description", type: "textarea", required: true },
      { key: "business_location", label: "Business location / service area" },
      { key: "logo_status", label: "Do you already have a logo?", type: "select", options: ["Yes", "No", "Still working on it"] },
      { key: "brand_colors", label: "Preferred colors" },
      { key: "brand_style", label: "Preferred design style" },
      { key: "services", label: "Services / products to display", type: "textarea", required: true, placeholder: "List the names, short descriptions, and prices if you want prices shown." },
      { key: "contact_details", label: "Contact details to display", type: "textarea", required: true, placeholder: "Phone, email, address, Messenger, Instagram, or other contact details." },
      { key: "social_links", label: "Social media / contact links", type: "textarea" },
      { key: "content_status", label: "Logo / photos / content status", type: "select", options: ["Everything is ready", "I have some files ready", "I still need to prepare my files"] },
    ];
  }

  if (isSimpleBusinessWebsite(productSlug)) {
    return [
      {
        key: "business_name",
        label: "Business / brand name",
        required: true,
      },
      {
        key: "business_type",
        label: "Business type",
        placeholder: "e.g. salon, freelancer, studio, local service business",
        required: true,
      },
      {
        key: "about_business",
        label: "Short About / business description",
        type: "textarea",
        placeholder: "Tell us what your business does, who you serve, and what makes it different.",
        required: true,
      },
      {
        key: "business_location",
        label: "Business location / service area",
        placeholder: "City, country, service area, or leave blank if fully online",
      },
      {
        key: "logo_status",
        label: "Do you already have a logo?",
        type: "select",
        options: ["Yes", "No", "Still working on it"],
      },
      {
        key: "brand_colors",
        label: "Preferred colors",
        placeholder: "e.g. blush pink, white, black",
      },
      {
        key: "brand_style",
        label: "Preferred design style",
        placeholder: "e.g. minimal, feminine, luxury, clean, bold",
      },
      {
        key: "home_headline",
        label: "Home page headline / tagline",
        placeholder: "What should visitors see first?",
      },
      {
        key: "home_intro",
        label: "Home page short introduction",
        type: "textarea",
        placeholder: "A short welcome or summary of your business. If you are unsure, give us the key points and TCL can arrange the wording.",
      },
      {
        key: "primary_cta",
        label: "Main call-to-action",
        type: "select",
        options: [
          "Contact Us",
          "Send an Inquiry",
          "Message Us",
          "View Services",
          "Call Us",
          "Other",
        ],
      },
      {
        key: "services",
        label: "Services / offers to display",
        type: "textarea",
        placeholder: "List each service or offer with a short description and price if you want the price shown.",
        required: true,
      },
      {
        key: "contact_phone",
        label: "Business phone / messaging number",
        placeholder: "Optional",
      },
      {
        key: "contact_email",
        label: "Business contact email",
        placeholder: "Email you want displayed on the website",
      },
      {
        key: "inquiry_destination",
        label: "Where should website inquiries go?",
        type: "select",
        options: [
          "Business email",
          "Facebook Messenger",
          "Instagram",
          "Telegram",
          "WhatsApp",
          "Phone / SMS",
          "Other",
        ],
        required: true,
      },
      {
        key: "social_links",
        label: "Social media / contact links",
        type: "textarea",
        placeholder: "Paste your Facebook, Instagram, TikTok, Telegram, WhatsApp, or other links.",
      },
      {
        key: "domain_status",
        label: "Domain status",
        type: "select",
        options: [
          "I already own a domain",
          "I need help getting a domain",
          "I do not need a custom domain yet",
        ],
      },
      {
        key: "content_status",
        label: "Website photos / content status",
        type: "select",
        options: [
          "I have my logo, photos, and content ready",
          "I have some files ready",
          "I still need to prepare my files",
        ],
      },
    ];
  }

  if (currentProduct(productSlug) === "shop") {
    return [
      { key: "business_name", label: "Business / brand name", required: true },
      { key: "business_type", label: "Business type / industry", required: true },
      { key: "about_business", label: "Short About / shop description", type: "textarea", required: true },
      { key: "business_location", label: "Business location / service area" },
      { key: "logo_status", label: "Do you already have a logo?", type: "select", options: ["Yes", "No", "Still working on it"] },
      { key: "brand_colors", label: "Preferred colors" },
      { key: "brand_style", label: "Preferred design style" },
      { key: "products", label: "Initial products — up to 10", type: "textarea", required: true, placeholder: "For each product: name, price, description, and variants/options if applicable. Put product images in your Google Drive folder." },
      { key: "product_categories", label: "Basic product categories / collections", type: "textarea" },
      { key: "manual_payment", label: "Manual payment instructions", type: "textarea", required: true, placeholder: "GCash, QR Ph, bank transfer, account details, and customer instructions." },
      { key: "order_details", label: "Customer details needed when ordering", type: "checkboxes", options: ["Full name", "Email", "Mobile number", "Complete address", "Order notes", "Other"], required: true },
      { key: "delivery_details", label: "Delivery / pickup information", type: "textarea" },
      { key: "shop_policies", label: "Shop / order policies", type: "textarea", required: true },
      { key: "contact_details", label: "Business contact details", type: "textarea", required: true },
      { key: "social_links", label: "Social media / contact links", type: "textarea" },
      { key: "domain_status", label: "Domain status", type: "select", options: ["I already own a domain", "I need help getting a domain", "I will use the included vercel.app address for now"] },
    ];
  }

  if (currentProduct(productSlug) === "booking") {
    return [
      { key: "business_name", label: "Business / brand name", required: true },
      { key: "business_type", label: "Business type / industry", required: true },
      { key: "about_business", label: "Short About / business description", type: "textarea", required: true },
      { key: "business_location", label: "Business location / service area", required: true },
      { key: "logo_status", label: "Do you already have a logo?", type: "select", options: ["Yes", "No", "Still working on it"] },
      { key: "brand_colors", label: "Preferred colors" },
      { key: "brand_style", label: "Preferred design style" },
      { key: "services", label: "Services, prices, durations, variations & add-ons", type: "textarea", required: true, placeholder: "Example: Gel manicure — ₱500 — 60 mins. Nail art add-on — ₱150 — +20 mins." },
      { key: "working_schedule", label: "Working days, hours, breaks & availability", type: "textarea", required: true },
      { key: "booking_rules", label: "Booking rules", type: "textarea", placeholder: "Lead time, advance-booking window, blocked dates, intervals, and customer instructions." },
      { key: "booking_customer_fields", label: "Customer information to collect", type: "checkboxes", options: ["Full name", "Email", "Mobile number", "Address/location", "Customer notes", "Reference photo", "Other"], required: true },
      { key: "cancellation_policy", label: "Cancellation / rescheduling / no-show policy", type: "textarea", required: true },
      { key: "contact_details", label: "Business contact / location details", type: "textarea", required: true },
      { key: "social_links", label: "Social media / contact links", type: "textarea" },
      { key: "domain_status", label: "Domain status", type: "select", options: ["I already own a domain", "I need help getting a domain", "I will use the included vercel.app address for now"] },
    ];
  }

  const common: Question[] = [
    {
      key: "business_name",
      label: "Business / brand name",
      required: true,
    },
    {
      key: "business_type",
      label: "Business type",
      placeholder: "e.g. Nail studio, salon, freelancer, online shop",
      required: true,
    },
    {
      key: "business_location",
      label: "Business location / service area",
      placeholder: "City, country, or areas you serve",
    },
    {
      key: "main_goal",
      label: "Main goal for this project",
      type: "textarea",
      required: true,
      placeholder:
        "Tell us what you want this system or website to improve for your business.",
    },
    {
      key: "target_customers",
      label: "Who are your main customers?",
      type: "textarea",
    },
    {
      key: "logo_status",
      label: "Do you already have a logo?",
      type: "select",
      options: ["Yes", "No", "Still working on it"],
    },
    {
      key: "brand_colors",
      label: "Preferred colors",
      placeholder: "e.g. Blush pink, white, black",
    },
    {
      key: "brand_style",
      label: "Preferred design style",
      placeholder: "e.g. Minimal, feminine, luxury, bold, clean",
    },
    {
      key: "social_links",
      label: "Social media / existing website links",
      type: "textarea",
    },
  ];

  if (source.includes("booking")) {
    return [
      ...common,
      {
        key: "services",
        label: "Services, prices, and durations",
        type: "textarea",
        required: true,
        placeholder:
          "Example: Gel manicure — ₱500 — 60 mins. Nail art add-on — ₱150 — 20 mins.",
      },
      {
        key: "working_schedule",
        label: "Working days and hours",
        type: "textarea",
        required: true,
      },
      {
        key: "booking_rules",
        label: "General booking rules",
        type: "textarea",
      },
      {
        key: "cancellation_policy",
        label: "Cancellation / rescheduling policy",
        type: "textarea",
      },
    ];
  }

  if (source.includes("digital") && source.includes("shop")) {
    return [
      ...common,
      {
        key: "digital_products",
        label: "Digital products you plan to sell",
        type: "textarea",
        required: true,
      },
      {
        key: "file_types",
        label: "Digital file / access types",
        type: "checkboxes",
        options: [
          "PDF",
          "ZIP",
          "Images",
          "Templates",
          "Spreadsheet",
          "Document",
          "Private link",
          "Video link",
          "Other",
        ],
      },
      {
        key: "product_categories",
        label: "Product categories / collections",
        type: "textarea",
      },
      {
        key: "shop_policies",
        label: "Refund / download / customer policies",
        type: "textarea",
      },
    ];
  }

  if (source.includes("physical") && source.includes("shop")) {
    return [
      ...common,
      {
        key: "physical_products",
        label: "Products, prices, and variants",
        type: "textarea",
        required: true,
      },
      {
        key: "shipping_regions",
        label: "Shipping / delivery areas",
        type: "textarea",
      },
      {
        key: "order_policies",
        label: "Return, exchange, cancellation, and order policies",
        type: "textarea",
      },
    ];
  }

  if (source.includes("starter kit")) {
    return [
      ...common,
      {
        key: "services_or_products",
        label: "Services / products you want presented",
        type: "textarea",
        required: true,
      },
      {
        key: "pages_needed",
        label: "Pages you want",
        type: "checkboxes",
        options: [
          "Home",
          "About",
          "Services",
          "Products",
          "Gallery",
          "FAQ",
          "Policies",
          "Contact",
          "Other",
        ],
      },
      {
        key: "preferred_contact",
        label: "Preferred customer contact channels",
        type: "checkboxes",
        options: [
          "Inquiry form",
          "Telegram",
          "Facebook Messenger",
          "Instagram",
          "Email",
          "Phone",
          "WhatsApp",
        ],
      },
    ];
  }

  return [
    ...common,
    {
      key: "pages_needed",
      label: "Pages / sections needed",
      type: "checkboxes",
      options: [
        "Home",
        "About",
        "Services",
        "Products",
        "Portfolio",
        "Gallery",
        "FAQ",
        "Policies",
        "Contact",
        "Other",
      ],
    },
    {
      key: "website_functions",
      label: "Main website functions needed",
      type: "textarea",
      placeholder:
        "Inquiry forms, booking, shop, payments, galleries, maps, downloads, etc.",
    },
    {
      key: "domain_status",
      label: "Domain status",
      type: "select",
      options: [
        "I already own a domain",
        "I need help getting a domain",
        "I do not need a custom domain yet",
      ],
    },
  ];
}

function buildFeatures(
  productCategory: string | null,
  productName: string,
  productTier: string | null,
  productSlug: string,
): Feature[] {
  const source = `${productCategory ?? ""} ${productName}`.toLowerCase();
  const tier =
    currentProduct(productSlug) === "booking"
      ? "basic"
      : inferTier(productTier, productSlug, productName);

  if (
    currentProduct(productSlug) === "starter" ||
    currentProduct(productSlug) === "simple" ||
    currentProduct(productSlug) === "shop"
  ) {
    return [];
  }

  if (isSimpleBusinessWebsite(productSlug)) {
    return [];
  }

  if (source.includes("booking")) {
    const features: Feature[] = [
      {
        key: "booking_site",
        label: "Booking website",
        helper: "Tell us how you want the booking experience to look and flow.",
        prompts: [
          "What should customers see first?",
          "Any important notices before they book?",
          "Any preferred wording or sections?",
        ],
      },
      {
        key: "booking_form",
        label: "Booking form",
        helper: "Describe exactly what information customers should submit.",
        prompts: [
          "Required fields",
          "Optional fields",
          "Reference photo or notes",
          "Address or location fields",
        ],
      },
      {
        key: "service_management",
        label: "Services management",
        helper: "Explain how services should be organized and managed.",
        prompts: [
          "Categories",
          "Prices",
          "Durations",
          "Service descriptions",
          "Availability rules",
        ],
      },
      {
        key: "availability_schedule",
        label: "Schedule & availability",
        helper: "Tell us how available dates and times should work.",
        prompts: [
          "Working days",
          "Breaks",
          "Blocked dates",
          "Time intervals",
          "Advance booking rules",
        ],
      },
      {
        key: "admin_dashboard",
        label: "Admin dashboard",
        helper: "Tell us what you want to see or manage most often.",
        prompts: [
          "Dashboard summary",
          "Quick actions",
          "Important counters",
          "What should be editable?",
        ],
      },
      {
        key: "booking_statuses",
        label: "Booking statuses",
        helper: "Describe how a booking should move from start to finish.",
        prompts: [
          "Pending",
          "Confirmed",
          "Cancelled",
          "Completed",
          "Any other custom status",
        ],
      },
      {
        key: "customer_details",
        label: "Customer details & notes",
        helper: "Tell us what customer information should be saved and visible in admin.",
      },
    ];

    if (tierIs(tier, ["starter", "pro", "enterprise"])) {
      features.push(
        {
          key: "service_variants",
          label: "Service variants & add-ons",
          helper: "Explain which add-ons or variants customers can choose and how pricing changes.",
        },
        {
          key: "email_notifications",
          label: "Email notifications",
          helper: "Describe exactly which emails should send and when.",
          prompts: [
            "New booking",
            "Booking confirmed",
            "Cancelled",
            "Rescheduled",
            "Reminder",
            "Admin notification",
          ],
        },
        {
          key: "payment_downpayment",
          label: "Payment / down-payment",
          helper: "Tell us the exact payment workflow.",
          prompts: [
            "Fixed amount or percentage",
            "When payment is required",
            "Accepted methods",
            "What happens if unpaid",
            "Verification workflow",
          ],
        },
      );
    }

    if (tierIs(tier, ["pro", "enterprise"])) {
      features.push(
        {
          key: "promotions",
          label: "Promos & discounts",
          helper: "Explain promo codes, discounts, limits, expiry, or special pricing.",
        },
        {
          key: "customer_database",
          label: "Customer database",
          helper: "Tell us what customer history and information you want searchable.",
        },
        {
          key: "reports",
          label: "Reports & exports",
          helper: "Tell us which reports, filters, totals, or exports are useful to you.",
        },
        {
          key: "payment_history",
          label: "Payment management & history",
          helper: "Describe how payments should be logged, viewed, verified, edited, or removed.",
        },
      );
    }

    if (tier === "enterprise") {
      features.push(
        {
          key: "staff_roles",
          label: "Staff accounts & roles",
          helper: "List staff roles and what each role can view or change.",
        },
        {
          key: "staff_scheduling",
          label: "Multi-staff scheduling",
          helper: "Explain how customers choose staff and how each staff schedule works.",
        },
        {
          key: "multiple_locations",
          label: "Multiple locations",
          helper: "Tell us how branches, locations, services, and schedules differ.",
        },
        {
          key: "integrations",
          label: "Integrations & automation",
          helper: "Describe external apps, calendars, messaging, CRM, or other automation needed.",
        },
      );
    }

    return features;
  }

  if (source.includes("digital") && source.includes("shop")) {
    const features: Feature[] = [
      {
        key: "catalog",
        label: "Product catalog",
        helper: "Tell us how products should be grouped, sorted, filtered, or featured.",
      },
      {
        key: "product_pages",
        label: "Product pages",
        helper: "Describe what customers need to see before buying.",
        prompts: ["Preview images", "Description", "File details", "Requirements", "FAQ"],
      },
      {
        key: "checkout",
        label: "Checkout",
        helper: "Explain your preferred checkout flow and customer fields.",
      },
      {
        key: "secure_delivery",
        label: "Secure digital delivery",
        helper: "Tell us how files or access should be delivered after payment.",
        prompts: ["Download limits", "Expiry", "Email delivery", "Private links"],
      },
      {
        key: "orders_admin",
        label: "Orders admin",
        helper: "Tell us what order information and actions you want in admin.",
      },
    ];

    if (tierIs(tier, ["pro", "business", "enterprise"])) {
      features.push(
        {
          key: "multiple_files",
          label: "Multiple files per product",
          helper: "Explain how files should be grouped or delivered.",
        },
        {
          key: "promos",
          label: "Discounts & promos",
          helper: "Describe promo codes, sale prices, bundles, limits, and expiry.",
        },
        {
          key: "customer_records",
          label: "Customer records",
          helper: "Tell us what purchase/customer history should be saved.",
        },
        {
          key: "emails",
          label: "Automated emails",
          helper: "Describe which customer/admin emails should send and when.",
        },
      );
    }

    if (tierIs(tier, ["business", "enterprise"])) {
      features.push(
        {
          key: "customer_accounts",
          label: "Customer accounts",
          helper: "Explain login, purchase history, downloads, and account access needs.",
        },
        {
          key: "reports_exports",
          label: "Reports & exports",
          helper: "Tell us which sales, order, customer, or download reports you need.",
        },
        {
          key: "bundles_collections",
          label: "Bundles & collections",
          helper: "Explain how bundled products or advanced collections should work.",
        },
      );
    }

    if (tier === "enterprise") {
      features.push(
        {
          key: "licensing_access",
          label: "Licensing / access control",
          helper: "Describe memberships, licenses, subscriptions, or special access rules.",
        },
        {
          key: "admin_roles",
          label: "Admin roles",
          helper: "List team roles and permissions.",
        },
        {
          key: "integrations",
          label: "Integrations & automation",
          helper: "Describe third-party tools or workflows that need to connect.",
        },
      );
    }

    return features;
  }

  if (source.includes("physical") && source.includes("shop")) {
    const features: Feature[] = [
      {
        key: "catalog",
        label: "Product catalog",
        helper: "Describe categories, collections, featured items, and product organization.",
      },
      {
        key: "variants",
        label: "Variants",
        helper: "Explain sizes, colors, options, combinations, and price differences.",
      },
      {
        key: "cart_checkout",
        label: "Cart & checkout",
        helper: "Tell us what information customers should provide and how checkout should flow.",
      },
      {
        key: "orders",
        label: "Order management",
        helper: "Describe order statuses and actions admin needs.",
      },
      {
        key: "shipping_pickup",
        label: "Shipping / delivery / pickup",
        helper: "Explain shipping areas, fees, pickup rules, and fulfillment workflow.",
      },
    ];

    if (tierIs(tier, ["pro", "business", "enterprise"])) {
      features.push(
        {
          key: "inventory",
          label: "Inventory tracking",
          helper: "Tell us how stock should be tracked and when low-stock warnings should happen.",
        },
        {
          key: "payments",
          label: "Payments",
          helper: "Explain payment methods, verification, COD, and payment status workflow.",
        },
        {
          key: "promos",
          label: "Discounts & promos",
          helper: "Describe vouchers, sale prices, minimum spend, limits, or expiry.",
        },
        {
          key: "emails",
          label: "Order notifications",
          helper: "Tell us which customer/admin emails should send at each order stage.",
        },
      );
    }

    if (tierIs(tier, ["business", "enterprise"])) {
      features.push(
        {
          key: "advanced_inventory",
          label: "Advanced inventory",
          helper: "Describe stock by variant, locations, restocking, or inventory reports.",
        },
        {
          key: "reports",
          label: "Reports & exports",
          helper: "Tell us which sales, order, inventory, or customer reports you need.",
        },
        {
          key: "customer_database",
          label: "Customer database",
          helper: "Explain what purchase history and customer details should be stored.",
        },
      );
    }

    if (tier === "enterprise") {
      features.push(
        {
          key: "branches_warehouses",
          label: "Branches / warehouses",
          helper: "Describe locations, inventory ownership, and fulfillment rules.",
        },
        {
          key: "roles",
          label: "Staff roles & permissions",
          helper: "Tell us what each admin/staff role can access.",
        },
        {
          key: "supplier_workflows",
          label: "Supplier workflows",
          helper: "Explain supplier, purchase, restock, or fulfillment processes.",
        },
        {
          key: "integrations",
          label: "Shipping / accounting integrations",
          helper: "List external services or automation needed.",
        },
      );
    }

    return features;
  }

  if (source.includes("starter kit")) {
    const features: Feature[] = [
      {
        key: "business_website",
        label: "Business website",
        helper: "Tell us what pages, sections, and calls-to-action you want.",
      },
      {
        key: "services_products",
        label: "Services / products presentation",
        helper: "Explain how you want your services or products displayed.",
      },
      {
        key: "inquiry",
        label: "Inquiry form",
        helper: "Tell us which customer fields should be collected and where inquiries should go.",
      },
      {
        key: "admin",
        label: "Admin management",
        helper: "Tell us what you want to edit or manage yourself.",
      },
    ];

    if (tierIs(tier, ["pro", "business", "enterprise"])) {
      features.push(
        {
          key: "booking_inquiry_tracking",
          label: "Booking / inquiry tracking",
          helper: "Explain the exact workflow from customer request to completion.",
        },
        {
          key: "customer_records",
          label: "Customer records",
          helper: "Tell us what customer history or notes should be stored.",
        },
        {
          key: "emails",
          label: "Email notifications",
          helper: "Describe which customer/admin emails should send and when.",
        },
        {
          key: "promotions",
          label: "Promotions",
          helper: "Explain featured offers, discounts, or seasonal promos.",
        },
      );
    }

    if (tierIs(tier, ["business", "enterprise"])) {
      features.push(
        {
          key: "payments",
          label: "Payments",
          helper: "Explain payment methods and payment workflow.",
        },
        {
          key: "shop_or_booking",
          label: "Shop / advanced booking",
          helper: "Describe the full customer journey and admin workflow.",
        },
        {
          key: "reports",
          label: "Reports",
          helper: "Tell us what sales, bookings, or customer reports you need.",
        },
      );
    }

    if (tier === "enterprise") {
      features.push(
        {
          key: "staff",
          label: "Staff & roles",
          helper: "List staff types and permissions.",
        },
        {
          key: "branches",
          label: "Branches / locations",
          helper: "Explain how each branch differs.",
        },
        {
          key: "automation",
          label: "Automation & integrations",
          helper: "Describe external systems and automated workflows.",
        },
      );
    }

    return features;
  }

  return [
    {
      key: "custom_design",
      label: "Custom design",
      helper: "Describe the visual direction, references, layouts, and overall feel you want.",
    },
    {
      key: "pages_sections",
      label: "Pages & sections",
      helper: "Tell us exactly what each page should contain and what customers should do there.",
    },
    {
      key: "forms",
      label: "Forms",
      helper: "Describe fields, validation, destination, notifications, and workflow.",
    },
    {
      key: "booking",
      label: "Booking integration",
      helper: "If needed, describe the booking workflow in detail.",
    },
    {
      key: "shop",
      label: "Shop / ecommerce",
      helper: "If needed, describe product, checkout, order, payment, and delivery workflow.",
    },
    {
      key: "admin",
      label: "Admin features",
      helper: "Tell us what you need to edit, manage, approve, track, or export.",
    },
    {
      key: "integrations",
      label: "Integrations",
      helper: "List social, maps, payments, email, CRM, automation, or other services.",
    },
  ];
}

export default function RequirementsForm({
  token,
  productSlug,
  productName,
  productCategory,
  productTier,
  customerName,
  customerEmail,
  existingRequirements,
  existingNotes,
  existingStatus,
}: Props) {
  const questions = useMemo(
    () => buildQuestions(productCategory, productName, productSlug),
    [productCategory, productName, productSlug],
  );

  const features = useMemo(
    () => buildFeatures(productCategory, productName, productTier, productSlug),
    [productCategory, productName, productTier, productSlug],
  );

  const simpleBusinessWebsite = useMemo(
    () => isSimpleBusinessWebsite(productSlug),
    [productSlug],
  );

  const family = useMemo(
    () =>
      simpleBusinessWebsite
        ? "simple_business_website"
        : inferFamily(productCategory, productName),
    [productCategory, productName, simpleBusinessWebsite],
  );

  const tier = useMemo(
    () =>
      simpleBusinessWebsite
        ? "starter"
        : inferTier(productTier, productSlug, productName),
    [productName, productSlug, productTier, simpleBusinessWebsite],
  );

  const [values, setValues] = useState<Record<string, unknown>>(
    existingRequirements ?? {},
  );
  const [customerNotes, setCustomerNotes] = useState(existingNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(existingStatus);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const draftStorageKey = useMemo(
    () => `tcl:project-requirements:draft:${token}`,
    [token],
  );

  useEffect(() => {
    try {
      const savedDraft = window.localStorage.getItem(draftStorageKey);

      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as {
          values?: Record<string, unknown>;
          customerNotes?: string;
        };

        if (
          parsed.values &&
          typeof parsed.values === "object" &&
          !Array.isArray(parsed.values)
        ) {
          setValues(parsed.values);
        }

        if (typeof parsed.customerNotes === "string") {
          setCustomerNotes(parsed.customerNotes);
        }
      }
    } catch (error) {
      console.warn("Unable to restore project requirements draft:", error);
    } finally {
      setDraftLoaded(true);
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (!draftLoaded) return;

    try {
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          values,
          customerNotes,
          savedAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.warn("Unable to save project requirements draft:", error);
    }
  }, [customerNotes, draftLoaded, draftStorageKey, values]);

  function setValue(key: string, value: unknown) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleCheckbox(key: string, option: string) {
    const current = arrayValue(values[key]);
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];

    setValue(key, next);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/project-requirements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          productSlug,
          requirements: values,
          customerNotes,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const rawBody = await response.text();

      let result: {
        ok?: boolean;
        status?: string;
        error?: string;
      } = {};

      if (contentType.includes("application/json")) {
        try {
          result = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          throw new Error(
            `The requirements API returned invalid JSON (HTTP ${response.status}).`,
          );
        }
      } else {
        const looksLikeHtml =
          rawBody.trim().startsWith("<!DOCTYPE") ||
          rawBody.trim().startsWith("<html");

        if (looksLikeHtml) {
          throw new Error(
            `The requirements API returned an HTML page instead of JSON (HTTP ${response.status}). Check the terminal running Next.js for the actual server error.`,
          );
        }

        throw new Error(
          rawBody.trim() ||
            `Unable to save requirements (HTTP ${response.status}).`,
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            `Unable to save requirements (HTTP ${response.status}).`,
        );
      }

      try {
        window.localStorage.removeItem(draftStorageKey);
      } catch (error) {
        console.warn("Unable to clear project requirements draft:", error);
      }

      setStatus(result.status ?? "SUBMITTED");
      setMessage(
        "Your project requirements have been saved successfully.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save requirements.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <section className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <span>YOUR PROJECT</span>
          <h2>Business & project details</h2>
          <p>
            Start with the basics so we understand your brand and what you
            want this project to achieve.
          </p>
        </div>

        <div className={styles.readOnlyGrid}>
          <div>
            <span>Customer</span>
            <strong>{customerName || "Customer"}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{customerEmail}</strong>
          </div>

          <div>
            <span>Purchased package</span>
            <strong>{productName}</strong>
          </div>

          <div>
            <span>Tier</span>
            <strong>
              {simpleBusinessWebsite ? "Starter Website" : productTier || "Custom"}
            </strong>
          </div>
        </div>

        <div className={styles.promptBox} style={{ marginBottom: "18px" }}>
          <span>PACKAGE SCOPE — PLEASE READ BEFORE ANSWERING</span>
          {simpleBusinessWebsite ? (
            <ul>
              <li>
                Included: <strong>4 separate pages</strong> — Home, About, Services,
                and Contact.
              </li>
              <li>
                Also included: responsive design, your logo/branding, services
                showcase, contact/inquiry form, social/contact links, basic SEO,
                initial content placement, and deployment.
              </li>
              <li>
                Not included: booking systems, ecommerce, admin dashboards, customer
                portals, extra pages, or advanced integrations/automation. These can
                be quoted separately if needed.
              </li>
            </ul>
          ) : (
            <ul>
              <li>
                Use this form to customize only the questions and features already
                included in your {displayTier(tier)}.
              </li>
              <li>
                The notes under every field explain what you may request there and
                what is outside the current package.
              </li>
              <li>
                Extra features, integrations, automations, modules, or workflows
                outside the package may require an upgrade or separate quotation.
              </li>
            </ul>
          )}
        </div>

        <div className={styles.fieldsGrid}>
          {questions.map((question) => {
            const scope = questionScope(question.key, family, tier);
            if (question.type === "textarea") {
              return (
                <label
                  key={question.key}
                  className={styles.fullField}
                >
                  <span>
                    {question.label}
                    {question.required ? " *" : ""}
                  </span>

                  {!simpleBusinessWebsite &&
                  shouldShowQuestionScope(question.key) ? (
                    <ScopeNotice scope={scope} tier={tier} />
                  ) : null}

                  <textarea
                    rows={5}
                    required={question.required}
                    value={textValue(values[question.key])}
                    placeholder={question.placeholder}
                    onChange={(event) =>
                      setValue(question.key, event.target.value)
                    }
                  />
                </label>
              );
            }

            if (question.type === "select") {
              return (
                <label key={question.key}>
                  <span>
                    {question.label}
                    {question.required ? " *" : ""}
                  </span>

                  {!simpleBusinessWebsite &&
                  shouldShowQuestionScope(question.key) ? (
                    <ScopeNotice scope={scope} tier={tier} />
                  ) : null}

                  <select
                    required={question.required}
                    value={textValue(values[question.key])}
                    onChange={(event) =>
                      setValue(question.key, event.target.value)
                    }
                  >
                    <option value="">Select an option</option>
                    {question.options?.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            if (question.type === "checkboxes") {
              const selected = arrayValue(values[question.key]);

              return (
                <fieldset
                  key={question.key}
                  className={`${styles.checkboxField} ${styles.fullField}`}
                >
                  <legend>{question.label}</legend>

                  {!simpleBusinessWebsite &&
                  shouldShowQuestionScope(question.key) ? (
                    <ScopeNotice scope={scope} tier={tier} />
                  ) : null}

                  <div className={styles.checkboxGrid}>
                    {question.options?.map((option) => (
                      <label key={option}>
                        <input
                          type="checkbox"
                          checked={selected.includes(option)}
                          onChange={() =>
                            toggleCheckbox(question.key, option)
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            }

            return (
              <label key={question.key}>
                <span>
                  {question.label}
                  {question.required ? " *" : ""}
                </span>

                {!simpleBusinessWebsite &&
                shouldShowQuestionScope(question.key) ? (
                  <ScopeNotice scope={scope} tier={tier} />
                ) : null}

                <input
                  type="text"
                  required={question.required}
                  value={textValue(values[question.key])}
                  placeholder={question.placeholder}
                  onChange={(event) =>
                    setValue(question.key, event.target.value)
                  }
                />
              </label>
            );
          })}
        </div>
      </section>

      {features.length > 0 ? (
      <section className={styles.formSection}>
          <div className={styles.sectionHeading}>
          <span>FEATURE WORKFLOW</span>
          <h2>Customize only what is included in each feature</h2>
          <p>
            Open each feature below. We&apos;ll show exactly what you can
            customize in your package and examples of requests that are outside
            its scope before you enter your instructions.
          </p>
        </div>

        <div className={styles.featureList}>
          {features.map((feature) => {
            const key = `feature_${feature.key}`;
            const scope = featureScope(feature, family, tier);

            return (
              <details className={styles.featureItem} key={feature.key}>
                <summary>
                  <div>
                    <strong>{feature.label}</strong>
                    <span>{feature.helper}</span>
                  </div>
                  <b>＋</b>
                </summary>

                <div className={styles.featureBody}>
                  <ScopeNotice scope={scope} tier={tier} />

                  {feature.prompts && feature.prompts.length > 0 ? (
                    <div className={styles.promptBox}>
                      <span>DETAILS YOU MAY SPECIFY FOR THIS INCLUDED FEATURE</span>
                      <ul>
                        {feature.prompts.map((prompt) => (
                          <li key={prompt}>{prompt}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <label>
                    <span>
                      Your instructions for this included feature only
                    </span>
                    <textarea
                      rows={6}
                      value={textValue(values[key])}
                      placeholder={`Tell us how you want the included ${feature.label.toLowerCase()} feature configured. Please stay within the inclusions listed above.`}
                      onChange={(event) =>
                        setValue(key, event.target.value)
                      }
                    />
                  </label>
                </div>
              </details>
            );
          })}
        </div>
      </section>
      ) : null}

      <section className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <span>PROJECT FILES & ASSETS</span>
          <h2>Share your Google Drive folder</h2>
          <p>
            Place all logos, photos, documents, references, menus, product images,
            policies, and other project files in one Google Drive folder.
          </p>
        </div>

        <div className={styles.promptBox} style={{ marginBottom: "18px" }}>
          <span>BEFORE YOU PASTE YOUR LINK</span>
          {simpleBusinessWebsite ? (
            <ul>
              <li>Set the folder to <strong>Anyone with the link — Viewer</strong>.</li>
              <li>Include your logo, Home/About photos, service or product images, and any content documents that apply to your purchased package.</li>
              <li>Use clear names such as <strong>LOGO.png</strong>, <strong>HOME - Hero.jpg</strong>, <strong>ABOUT - Owner.jpg</strong>, and <strong>SERVICE - Name.jpg</strong>.</li>
            </ul>
          ) : (
          <ul>
            <li>
              Set the Google Drive folder access to <strong>Anyone with the link — Viewer</strong> so TCL can open the files.
            </li>
            <li>
              Name every file clearly based on what it is and where it should be used.
            </li>
            <li>
              Good examples: <strong>LOGO - Main Logo.png</strong>,{" "}
              <strong>HOME - Hero Photo.jpg</strong>,{" "}
              <strong>ABOUT - Owner Photo.jpg</strong>,{" "}
              <strong>SERVICE - Gel Manicure.jpg</strong>,{" "}
              <strong>PRODUCT - Cuticle Oil.jpg</strong>,{" "}
              <strong>POLICIES - Booking Policy.pdf</strong>.
            </li>
            <li>
              Avoid unclear names such as <strong>IMG_8273.jpg</strong>,{" "}
              <strong>Screenshot123.png</strong>, or <strong>final-final2.png</strong>.
            </li>
            <li>
              If a file is missing or we cannot identify where it should be used,
              TCL may ask for clarification before continuing that part of the project.
            </li>
          </ul>
          )}
        </div>

        <div className={styles.fieldsGrid}>
          <label className={styles.fullField}>
            <span>Google Drive folder link</span>
            <input
              type="url"
              value={textValue(values.project_assets_drive_link)}
              placeholder="https://drive.google.com/..."
              onChange={(event) =>
                setValue("project_assets_drive_link", event.target.value)
              }
            />
          </label>

          <fieldset className={`${styles.checkboxField} ${styles.fullField}`}>
            <legend>File access confirmation</legend>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <input
                type="checkbox"
                checked={values.project_assets_confirmed === true}
                onChange={(event) =>
                  setValue("project_assets_confirmed", event.target.checked)
                }
                style={{
                  flex: "0 0 auto",
                  width: "16px",
                  height: "16px",
                  marginTop: "2px",
                }}
              />
              <span style={{ flex: "1 1 auto" }}>
                I confirmed that my Google Drive folder is accessible to anyone
                with the link and that all files are clearly named based on what
                they are for.
              </span>
            </label>
          </fieldset>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <span>FINAL NOTES</span>
          <h2>Anything else we should know?</h2>
          <p>
            Add special requests, references, concerns, or anything that
            doesn&apos;t fit in the fields above.
          </p>
        </div>

        <div className={styles.promptBox} style={{ marginBottom: "14px" }}>
          <span>FINAL NOTES ARE STILL SUBJECT TO YOUR PACKAGE SCOPE</span>
          <ul>
            <li>
              You may add references, wording, preferences, or clarifications
              related to the features already included in your package.
            </li>
            <li>
              Listing a new feature here does not add it to your package.
              Out-of-scope requests may require an upgrade or separate quotation.
            </li>
          </ul>
        </div>

        <label className={styles.notesField}>
          <span>Additional project notes</span>
          <textarea
            rows={6}
            value={customerNotes}
            onChange={(event) => setCustomerNotes(event.target.value)}
            placeholder="Extra instructions, links, references, preferences, or questions..."
          />
        </label>
      </section>

      <div className={styles.submitBar}>
        <div>
          <span>Current status</span>
          <strong>{status.replaceAll("_", " ")}</strong>
        </div>

        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : status === "SUBMITTED" ||
                status === "RESUBMITTED" ||
                status === "NEED_MORE_INFO"
              ? "Update Requirements"
              : "Submit Requirements"}
        </button>
      </div>

      {message ? (
        <p className={styles.formMessage}>{message}</p>
      ) : null}
    </form>
  );
}
