"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./quote.module.css";

type Props = {
  productName: string;
  productSlug: string;
  category: string;
  backHref: string;
};

type AnswerValue = string | string[];

type FormState = {
  started: boolean;
  industry: string;
  projectTypes: string[];
  answers: Record<string, AnswerValue>;
  otherRequirements: string;
  businessName: string;
  fullName: string;
  email: string;
  emailConfirmed: boolean;
  contactNumber: string;
  preferredContact: string;
  businessLocation: string;
  currentLink: string;
  logoReady: string;
  brandingReady: string;
  contentReady: string;
  domainStatus: string;
  budget: string;
  timeline: string;
  notes: string;
  finalConfirmed: boolean;
};

type Option = {
  value: string;
  label: string;
  hint?: string;
};

type Question = {
  id: string;
  section: string;
  title: string;
  help?: string;
  type: "single" | "multi";
  options: Option[];
  showWhen?: (form: FormState) => boolean;
  required?: boolean;
};

const initialState: FormState = {
  started: false,
  industry: "",
  projectTypes: [],
  answers: {},
  otherRequirements: "",
  businessName: "",
  fullName: "",
  email: "",
  emailConfirmed: false,
  contactNumber: "",
  preferredContact: "",
  businessLocation: "",
  currentLink: "",
  logoReady: "",
  brandingReady: "",
  contentReady: "",
  domainStatus: "",
  budget: "",
  timeline: "",
  notes: "",
  finalConfirmed: false,
};

const industries = [
  "Retail / Online Selling",
  "Beauty / Salon / Wellness",
  "Food / Restaurant / Catering",
  "Travel / Tours / Tourism",
  "Hotel / Resort / Accommodation / Rental",
  "School / Education / Review Center",
  "Professional Services / Agency",
  "Healthcare / Clinic",
  "Real Estate / Property Management",
  "Construction / Engineering / Contractor",
  "HR / Recruitment / Staffing",
  "Logistics / Delivery / Transport",
  "Events / Registration",
  "Membership / Association / Organization",
  "Freelancer / Personal Brand / Portfolio",
  "Nonprofit / Church / Community",
  "Government / Barangay / Community Service",
  "Technology / SaaS / Online Platform",
  "Other / Not sure",
];

const projectOptions: Option[] = [
  { value: "website", label: "Business / information website" },
  { value: "shop", label: "Online shop / e-commerce" },
  { value: "booking", label: "Booking / appointment / reservation" },
  { value: "portal", label: "Customer / client / member portal" },
  { value: "education", label: "School / LMS / reviewer / quiz system" },
  { value: "hr", label: "HR / employee / recruitment system" },
  { value: "travel", label: "Travel / tour management" },
  { value: "rental", label: "Hotel / resort / property / rental system" },
  { value: "inventory", label: "Inventory / records / business management" },
  { value: "custom", label: "Custom web-based system / dashboard" },
  { value: "unsure", label: "Not sure — recommend what I need" },
];

const industryProjectMap: Record<string, string[]> = {
  "Retail / Online Selling": ["website", "shop", "portal", "inventory", "custom", "unsure"],
  "Beauty / Salon / Wellness": ["website", "booking", "shop", "portal", "inventory", "custom", "unsure"],
  "Food / Restaurant / Catering": ["website", "shop", "booking", "inventory", "custom", "unsure"],
  "Travel / Tours / Tourism": ["website", "travel", "booking", "portal", "custom", "unsure"],
  "Hotel / Resort / Accommodation / Rental": ["website", "rental", "booking", "portal", "inventory", "custom", "unsure"],
  "School / Education / Review Center": ["website", "education", "portal", "booking", "shop", "custom", "unsure"],
  "Professional Services / Agency": ["website", "booking", "portal", "shop", "custom", "unsure"],
  "Healthcare / Clinic": ["website", "booking", "portal", "inventory", "custom", "unsure"],
  "Real Estate / Property Management": ["website", "rental", "booking", "portal", "custom", "unsure"],
  "Construction / Engineering / Contractor": ["website", "portal", "inventory", "hr", "custom", "unsure"],
  "HR / Recruitment / Staffing": ["website", "hr", "portal", "booking", "custom", "unsure"],
  "Logistics / Delivery / Transport": ["website", "booking", "portal", "inventory", "custom", "unsure"],
  "Events / Registration": ["website", "booking", "shop", "portal", "custom", "unsure"],
  "Membership / Association / Organization": ["website", "portal", "booking", "shop", "custom", "unsure"],
  "Freelancer / Personal Brand / Portfolio": ["website", "booking", "shop", "portal", "custom", "unsure"],
  "Nonprofit / Church / Community": ["website", "booking", "portal", "custom", "unsure"],
  "Government / Barangay / Community Service": ["website", "booking", "portal", "inventory", "custom", "unsure"],
  "Technology / SaaS / Online Platform": ["website", "portal", "shop", "booking", "inventory", "education", "hr", "custom", "unsure"],
};

const broadIndustry = (industry: string) =>
  industry === "Other / Not sure" || !industryProjectMap[industry];

const relevantProjectsForIndustry = (industry: string) => {
  if (broadIndustry(industry)) return projectOptions;
  const allowed = new Set(industryProjectMap[industry]);
  return projectOptions.filter((option) => allowed.has(option.value));
};

const hasProject = (form: FormState, ...ids: string[]) =>
  ids.some((id) => form.projectTypes.includes(id));

const has = (form: FormState, id: string, value?: string) => {
  const answer = form.answers[id];
  if (Array.isArray(answer)) return value ? answer.includes(value) : answer.length > 0;
  return value ? answer === value : Boolean(answer);
};

const YES_NO_UNSURE: Option[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure — recommend for me" },
];

function optionIsRelevant(form: FormState, questionId: string, value: string) {
  const beauty = form.industry === "Beauty / Salon / Wellness";
  const shop = hasProject(form, "shop");
  const booking = hasProject(form, "booking");
  const portal = hasProject(form, "portal");
  const education = hasProject(form, "education");
  const hr = hasProject(form, "hr");
  const travel = hasProject(form, "travel");
  const rental = hasProject(form, "rental");
  const inventory = hasProject(form, "inventory");
  const custom = hasProject(form, "custom");
  const payments = has(form, "paymentsNeeded", "yes");
  const staffBooking = has(form, "bookingFor", "staff");
  const classBooking = has(form, "bookingFor", "class");

  /*
   * INDUSTRY-SPECIFIC OPTION FILTERING
   * Beauty / Salon / Wellness is intentionally narrow:
   * services, appointments, staff/providers, clients, content, locations,
   * and optional retail only when Shop was actually selected.
   */
  if (beauty) {
    const beautyAllowed: Record<string, string[]> = {
      publicPurpose: [
        "info", "services", "portfolio", "testimonials", "contact",
        "blog", "location", "other",
        ...(shop ? ["products"] : []),
      ],
      websitePages: [
        "home", "about", "services", "gallery", "testimonials", "blog",
        "faq", "contact", "policies", "other",
        ...(shop ? ["shop"] : []),
      ],
      adminManage: [
        "content", "customers", "services", "reports", "settings", "unsure",
        ...(booking ? ["bookings", "schedule"] : []),
        ...(shop ? ["products", "stock", "orders"] : []),
        ...(payments ? ["payments"] : []),
        ...(staffBooking ? ["employees"] : []),
        ...(portal ? ["users", "documents", "memberships"] : []),
      ],
      userRoles: [
        "customer", "admin", "other",
        ...(portal ? ["member"] : []),
        ...(staffBooking ? ["employee"] : []),
        ...(staffBooking && custom ? ["manager"] : []),
      ],
      accountFeatures: [
        "profile", "notifications", "other",
        ...(booking ? ["bookings", "cancel"] : []),
        ...(shop ? ["orders"] : []),
        ...(payments ? ["payments"] : []),
        ...(portal ? ["private", "documents"] : []),
      ],
      bookingFor: ["service", "staff", "class", "other"],
      scheduleChoice: [
        "datetime", "date", "request", "admin", "unsure",
        ...(classBooking ? ["package"] : []),
      ],
      bookingDuration: [
        "same", "service", "admin", "unsure",
        ...(classBooking ? ["customer"] : []),
      ],
      slotBehavior: [
        "fullDuration", "buffer", "capacity", "manual", "unsure",
        ...(staffBooking ? ["staff"] : []),
      ],
      bookingApproval: [
        "auto", "admin", "contact", "depends", "unsure",
        ...(payments ? ["payment"] : []),
      ],
      bookingRules: [
        "lead", "future", "capacity", "blackout", "closed", "cancel",
        "reschedule", "cutoff", "addons", "unsure",
        ...(classBooking ? ["guestCount"] : []),
      ],
      fileTypes: [
        "images", "pdf", "other",
        ...(payments ? ["receipts"] : []),
        ...(portal ? ["contracts"] : []),
      ],
      notifications: [
        "emailCustomer", "emailAdmin", "none", "unsure",
        ...(booking ? ["reminders", "status"] : []),
        ...(portal ? ["onsite"] : []),
      ],
      reports: [
        "dashboard", "users", "csv", "pdf", "none", "unsure",
        ...(booking ? ["orders"] : []),
        ...(shop || payments ? ["sales"] : []),
      ],
      integrations: [
        "maps", "email", "social", "analytics", "other", "none", "unsure",
        ...(booking ? ["calendar"] : []),
        ...(booking && staffBooking ? ["meet"] : []),
        ...(payments ? ["payment"] : []),
        ...(shop ? ["courier"] : []),
      ],
    };

    const allowed = beautyAllowed[questionId];
    if (allowed && !allowed.includes(value)) return false;
  }

  /*
   * UNIVERSAL DEPENDENCIES
   * These prevent unrelated choices from appearing for every industry.
   */
  if (questionId === "publicPurpose") {
    if (value === "products" && !shop) return false;
    if (value === "download" && !portal && !education && !custom) return false;
  }

  if (questionId === "websitePages" && value === "shop" && !shop) return false;

  if (questionId === "adminManage") {
    if (["products", "stock", "orders"].includes(value) && !shop && !inventory) return false;
    if (["bookings", "schedule"].includes(value) && !booking && !travel && !rental) return false;
    if (value === "payments" && !payments) return false;
    if (["students", "courses"].includes(value) && !education) return false;
    if (value === "employees" && !hr && !staffBooking) return false;
    if (value === "applications" && !hr && !custom) return false;
    if (value === "memberships" && !portal && !education && !shop && !custom) return false;
    if (value === "documents" && !portal && !education && !hr && !custom) return false;
  }

  if (questionId === "userRoles") {
    if (value === "member" && !portal && !education && !shop && !custom) return false;
    if (["student", "teacher"].includes(value) && !education) return false;
    if (["employee", "manager"].includes(value) && !hr && !staffBooking && !custom) return false;
    if (value === "applicant" && !hr && !custom) return false;
    if (value === "vendor" && !shop && !inventory && !custom) return false;
  }

  if (questionId === "accountFeatures") {
    if (value === "orders" && !shop) return false;
    if (["bookings", "cancel"].includes(value) && !booking && !travel && !rental) return false;
    if (value === "payments" && !payments) return false;
    if (value === "status" && !hr && !custom && !portal) return false;
    if (value === "documents" && !portal && !education && !hr && !custom) return false;
    if (value === "private" && !portal && !education && !custom) return false;
  }

  if (questionId === "bookingFor") {
    if (value === "room" && !rental) return false;
    if (value === "rental" && !rental) return false;
    if (value === "tour" && !travel) return false;
  }

  if (questionId === "scheduleChoice" && value === "package")
    return travel || classBooking;

  if (questionId === "bookingDuration") {
    if (value === "range" && !rental && !travel) return false;
  }

  if (questionId === "slotBehavior" && value === "staff" && !staffBooking)
    return false;

  if (questionId === "bookingApproval" && value === "payment" && !payments)
    return false;

  if (questionId === "fileTypes") {
    if (value === "cv" && !hr) return false;
    if (value === "school" && !education) return false;
    if (value === "receipts" && !payments) return false;
  }

  if (questionId === "membershipFeatures") {
    if (value === "pricing" && !shop) return false;
    if (value === "payment" && !payments) return false;
  }

  if (questionId === "notifications") {
    if (value === "reminders" && !booking && !travel && !rental && !education && !hr) return false;
    if (value === "status" && !shop && !booking && !portal && !hr && !custom) return false;
    if (value === "onsite" && !portal && !education && !hr && !custom) return false;
  }

  if (questionId === "reports") {
    if (value === "sales" && !shop && !payments) return false;
    if (value === "orders" && !shop && !booking && !travel && !rental) return false;
    if (value === "school" && !education) return false;
    if (value === "hr" && !hr) return false;
  }

  if (questionId === "integrations") {
    if (value === "calendar" && !booking && !travel && !rental && !hr) return false;
    if (value === "meet" && !booking && !education && !hr) return false;
    if (value === "payment" && !payments) return false;
    if (value === "courier" && !shop) return false;
  }

  return true;
}

function questionIsRelevant(form: FormState, question: Question) {
  const beauty = form.industry === "Beauty / Salon / Wellness";

  if (beauty) {
    // Beauty/salon/wellness should not be asked about memberships unless a portal
    // or shop was deliberately selected.
    if (question.section === "Membership" && !hasProject(form, "portal", "shop")) return false;

    // System/records questions are for an actual custom/portal/inventory workflow,
    // not a normal salon website or appointment flow.
    if (question.section === "System" && !hasProject(form, "custom", "portal", "inventory")) return false;
  }

  return !question.showWhen || question.showWhen(form);
}

function relevantOptions(form: FormState, question: Question) {
  return question.options.filter((option) =>
    optionIsRelevant(form, question.id, option.value),
  );
}

const questions: Question[] = [
  // PUBLIC WEBSITE
  {
    id: "publicPurpose",
    section: "Website",
    title: "What should visitors be able to do on the public website?",
    type: "multi",
    showWhen: (f) => hasProject(f, "website", "shop", "booking", "portal", "travel", "rental", "education", "hr", "custom"),
    options: [
      { value: "info", label: "Learn about the business / organization" },
      { value: "services", label: "View services or packages" },
      { value: "products", label: "View products" },
      { value: "portfolio", label: "View gallery / portfolio / projects" },
      { value: "testimonials", label: "Read testimonials / reviews" },
      { value: "contact", label: "Send an inquiry / contact form" },
      { value: "quote", label: "Request a quote" },
      { value: "blog", label: "Read articles / news / updates" },
      { value: "location", label: "View location, hours, map or branches" },
      { value: "download", label: "Download public files / brochures" },
      { value: "other", label: "Other / not sure" },
    ],
  },
  {
    id: "websitePages",
    section: "Website",
    title: "Which pages or sections do you expect?",
    type: "multi",
    showWhen: (f) => hasProject(f, "website", "shop", "booking", "portal", "travel", "rental", "education", "hr", "custom"),
    options: [
      { value: "home", label: "Home" },
      { value: "about", label: "About" },
      { value: "services", label: "Services / Packages" },
      { value: "shop", label: "Shop / Products" },
      { value: "gallery", label: "Gallery / Portfolio" },
      { value: "testimonials", label: "Testimonials / Reviews" },
      { value: "blog", label: "Blog / Articles / News" },
      { value: "faq", label: "FAQ" },
      { value: "contact", label: "Contact / Get Started" },
      { value: "policies", label: "Policies / Terms / Privacy" },
      { value: "other", label: "Other / not sure" },
    ],
  },
  {
    id: "selfManage",
    section: "Website",
    title: "After launch, do you want to make changes yourself?",
    type: "single",
    showWhen: (f) => hasProject(f, "website", "shop", "booking", "portal", "travel", "rental", "education", "hr", "inventory", "custom"),
    options: [
      { value: "no", label: "No — TCL can handle future edits when needed" },
      { value: "yes", label: "Yes — I need admin access" },
      { value: "some", label: "Only certain parts" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "adminManage",
    section: "Admin",
    title: "What do you want to manage yourself?",
    type: "multi",
    showWhen: (f) => has(f, "selfManage", "yes") || has(f, "selfManage", "some") || hasProject(f, "custom", "inventory", "hr", "education"),
    options: [
      { value: "content", label: "Website text / images / pages" },
      { value: "products", label: "Products / categories / prices" },
      { value: "stock", label: "Inventory / stock" },
      { value: "orders", label: "Orders / fulfillment" },
      { value: "payments", label: "Payments / payment verification" },
      { value: "customers", label: "Customers / clients / members" },
      { value: "bookings", label: "Bookings / reservations" },
      { value: "services", label: "Services / packages" },
      { value: "schedule", label: "Schedules / availability" },
      { value: "employees", label: "Employees / staff" },
      { value: "students", label: "Students / learners" },
      { value: "courses", label: "Courses / subjects / classes" },
      { value: "applications", label: "Applications / submissions" },
      { value: "documents", label: "Documents / uploads" },
      { value: "memberships", label: "Memberships / subscriptions" },
      { value: "reports", label: "Reports / exports" },
      { value: "users", label: "Users / roles / permissions" },
      { value: "settings", label: "System settings" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },

  // ACCOUNTS / ROLES
  {
    id: "accountsNeeded",
    section: "Users",
    title: "Will anyone need to log in?",
    type: "single",
    showWhen: (f) => hasProject(f, "shop", "booking", "portal", "education", "hr", "travel", "rental", "inventory", "custom"),
    options: YES_NO_UNSURE,
  },
  {
    id: "userRoles",
    section: "Users",
    title: "Who needs their own access?",
    type: "multi",
    showWhen: (f) => has(f, "accountsNeeded", "yes"),
    options: [
      { value: "customer", label: "Customers / clients" },
      { value: "member", label: "Members / subscribers" },
      { value: "student", label: "Students / learners" },
      { value: "teacher", label: "Teachers / instructors" },
      { value: "employee", label: "Employees / staff" },
      { value: "manager", label: "Managers / supervisors" },
      { value: "applicant", label: "Applicants / candidates" },
      { value: "vendor", label: "Vendors / sellers / partners" },
      { value: "admin", label: "Admin / owner" },
      { value: "other", label: "Other / not sure" },
    ],
  },
  {
    id: "accountCreation",
    section: "Users",
    title: "How should accounts be created?",
    type: "single",
    showWhen: (f) => has(f, "accountsNeeded", "yes"),
    options: [
      { value: "self", label: "Users register themselves" },
      { value: "admin", label: "Admin creates accounts" },
      { value: "approval", label: "Users register, then admin approves" },
      { value: "invite", label: "Invitation only" },
      { value: "mixed", label: "Different method depending on user type" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "loginMethod",
    section: "Users",
    title: "How should users sign in?",
    type: "multi",
    showWhen: (f) => has(f, "accountsNeeded", "yes"),
    options: [
      { value: "email", label: "Email + password" },
      { value: "username", label: "Username + password" },
      { value: "google", label: "Google sign-in" },
      { value: "magic", label: "Email link / passwordless" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "accountFeatures",
    section: "Users",
    title: "What should logged-in users be able to do?",
    type: "multi",
    showWhen: (f) => has(f, "accountsNeeded", "yes"),
    options: [
      { value: "profile", label: "View / update profile" },
      { value: "orders", label: "View orders" },
      { value: "bookings", label: "View bookings / reservations" },
      { value: "status", label: "Track request / application status" },
      { value: "payments", label: "View payment history" },
      { value: "documents", label: "Upload / download documents" },
      { value: "private", label: "Access private content / resources" },
      { value: "notifications", label: "View notifications" },
      { value: "cancel", label: "Cancel / reschedule requests" },
      { value: "other", label: "Other / not sure" },
    ],
  },

  // SHOP
  {
    id: "productType",
    section: "Shop",
    title: "What will you sell?",
    type: "multi",
    showWhen: (f) => hasProject(f, "shop"),
    options: [
      { value: "physical", label: "Physical products" },
      { value: "digital", label: "Digital products / downloads" },
      { value: "services", label: "Services" },
      { value: "mixed", label: "A mix of products and services" },
      { value: "wholesale", label: "Wholesale / reseller products" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
  {
    id: "productCount",
    section: "Shop",
    title: "About how many products will you start with?",
    type: "single",
    showWhen: (f) => hasProject(f, "shop"),
    options: [
      { value: "1-10", label: "1–10" },
      { value: "11-30", label: "11–30" },
      { value: "31-100", label: "31–100" },
      { value: "101-500", label: "101–500" },
      { value: "500+", label: "More than 500" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
  {
    id: "productOptions",
    section: "Shop",
    title: "Do products need any of these?",
    type: "multi",
    showWhen: (f) => hasProject(f, "shop"),
    options: [
      { value: "variants", label: "Variants such as size / color / type" },
      { value: "addons", label: "Add-ons / customizations" },
      { value: "categories", label: "Categories / collections" },
      { value: "sale", label: "Sale / promo pricing" },
      { value: "memberPrice", label: "Member / special pricing" },
      { value: "quantityRules", label: "Minimum / maximum / quantity increments" },
      { value: "digitalDelivery", label: "Secure digital delivery" },
      { value: "none", label: "None of these" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "cartCheckout",
    section: "Shop",
    title: "How should customers place an order?",
    type: "single",
    showWhen: (f) => hasProject(f, "shop"),
    options: [
      { value: "cart", label: "Add to cart, then checkout" },
      { value: "buyNow", label: "Buy / order one item directly" },
      { value: "inquiry", label: "No checkout — inquiry / catalog only" },
      { value: "quote", label: "Request a quote before ordering" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "inventory",
    section: "Shop",
    title: "Should the website track stock?",
    type: "single",
    showWhen: (f) => hasProject(f, "shop", "inventory"),
    options: [
      { value: "none", label: "No stock tracking" },
      { value: "basic", label: "Yes — basic stock count" },
      { value: "variant", label: "Yes — stock per variant" },
      { value: "location", label: "Yes — stock per branch / location" },
      { value: "advanced", label: "Advanced inventory / special rules" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "orderStatus",
    section: "Shop",
    title: "Which order statuses do you need?",
    type: "multi",
    showWhen: (f) => hasProject(f, "shop"),
    options: [
      { value: "pending", label: "Pending" },
      { value: "payment", label: "Awaiting payment / verification" },
      { value: "confirmed", label: "Confirmed" },
      { value: "processing", label: "Processing / preparing" },
      { value: "shipped", label: "Shipped / out for delivery" },
      { value: "ready", label: "Ready for pickup" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled / rejected" },
      { value: "refund", label: "Refunded" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },

  // PAYMENTS
  {
    id: "paymentsNeeded",
    section: "Payments",
    title: "Will customers make payments related to this website/system?",
    type: "single",
    showWhen: (f) => hasProject(f, "shop", "booking", "travel", "rental", "portal", "education", "custom"),
    options: YES_NO_UNSURE,
  },
  {
    id: "paymentType",
    section: "Payments",
    title: "How should payment work?",
    type: "multi",
    showWhen: (f) => has(f, "paymentsNeeded", "yes"),
    options: [
      { value: "manual", label: "Manual payment (GCash / bank / Maya details)" },
      { value: "gateway", label: "Online payment gateway" },
      { value: "cash", label: "Cash / pay on site / COD" },
      { value: "deposit", label: "Down payment / deposit" },
      { value: "full", label: "Full payment" },
      { value: "installment", label: "Installment / payment schedule" },
      { value: "mixed", label: "Different payment options" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "manualProof",
    section: "Payments",
    title: "For manual payments, should customers upload proof of payment?",
    type: "single",
    showWhen: (f) => has(f, "paymentType", "manual"),
    options: YES_NO_UNSURE,
  },
  {
    id: "paymentReview",
    section: "Payments",
    title: "What should happen after proof is submitted?",
    type: "single",
    showWhen: (f) => has(f, "manualProof", "yes"),
    options: [
      { value: "admin", label: "Admin reviews and approves / rejects it" },
      { value: "staff", label: "Assigned staff reviews it" },
      { value: "record", label: "Save it only — no approval workflow" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "afterPaymentApproval",
    section: "Payments",
    title: "After payment is approved, what should happen?",
    type: "multi",
    showWhen: (f) => has(f, "paymentReview", "admin") || has(f, "paymentReview", "staff"),
    options: [
      { value: "confirm", label: "Confirm the order / booking / request" },
      { value: "status", label: "Update its status" },
      { value: "notify", label: "Notify the customer" },
      { value: "stock", label: "Update / deduct stock" },
      { value: "access", label: "Activate access / membership" },
      { value: "receipt", label: "Generate / send receipt or confirmation" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },

  // DELIVERY
  {
    id: "fulfillment",
    section: "Delivery",
    title: "How will customers receive their order?",
    type: "multi",
    showWhen: (f) => hasProject(f, "shop"),
    options: [
      { value: "shipping", label: "Courier / nationwide shipping" },
      { value: "local", label: "Local delivery" },
      { value: "pickup", label: "Store / branch pickup" },
      { value: "digital", label: "Digital delivery / download" },
      { value: "service", label: "Service — no physical delivery" },
      { value: "multiple", label: "Multiple fulfillment options" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
  {
    id: "shippingRules",
    section: "Delivery",
    title: "How should shipping or delivery fees work?",
    type: "single",
    showWhen: (f) => has(f, "fulfillment", "shipping") || has(f, "fulfillment", "local") || has(f, "fulfillment", "multiple"),
    options: [
      { value: "flat", label: "Flat fee" },
      { value: "location", label: "Based on location / area" },
      { value: "order", label: "Based on order amount / weight" },
      { value: "free", label: "Free shipping rules / threshold" },
      { value: "manual", label: "Admin confirms delivery fee manually" },
      { value: "integration", label: "Courier / delivery integration" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },

  // BOOKING
  {
    id: "bookingFor",
    section: "Booking",
    title: "What can customers book or reserve?",
    type: "multi",
    showWhen: (f) => hasProject(f, "booking", "travel", "rental"),
    options: [
      { value: "service", label: "Services / appointments" },
      { value: "staff", label: "Specific staff / provider" },
      { value: "room", label: "Room / accommodation" },
      { value: "rental", label: "Equipment / vehicle / property rental" },
      { value: "tour", label: "Tour / travel package" },
      { value: "class", label: "Class / event / session" },
      { value: "other", label: "Other / not sure" },
    ],
  },
  {
    id: "scheduleChoice",
    section: "Booking",
    title: "How should customers choose a schedule?",
    type: "single",
    showWhen: (f) => hasProject(f, "booking", "travel", "rental"),
    options: [
      { value: "datetime", label: "Choose an available date and time" },
      { value: "date", label: "Choose a date only" },
      { value: "request", label: "Request a preferred schedule" },
      { value: "admin", label: "Admin assigns the schedule" },
      { value: "package", label: "Choose from fixed event / travel dates" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "bookingDuration",
    section: "Booking",
    title: "How should booking duration work?",
    type: "single",
    showWhen: (f) => hasProject(f, "booking", "rental"),
    options: [
      { value: "same", label: "Same duration for all bookings" },
      { value: "service", label: "Different duration per service / item" },
      { value: "customer", label: "Customer chooses duration" },
      { value: "range", label: "Multi-day / date-range booking" },
      { value: "admin", label: "Admin sets duration" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "slotBehavior",
    section: "Booking",
    title: "How should availability be blocked?",
    type: "multi",
    showWhen: (f) => hasProject(f, "booking", "rental"),
    options: [
      { value: "fullDuration", label: "Block the full service / rental duration" },
      { value: "buffer", label: "Add preparation / buffer time" },
      { value: "capacity", label: "Allow multiple bookings up to a capacity" },
      { value: "staff", label: "Availability depends on staff / resource" },
      { value: "manual", label: "Admin manually opens / closes slots" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "bookingApproval",
    section: "Booking",
    title: "What happens after a customer submits a booking?",
    type: "single",
    showWhen: (f) => hasProject(f, "booking", "travel", "rental"),
    options: [
      { value: "auto", label: "Automatically confirmed" },
      { value: "admin", label: "Admin approves / rejects first" },
      { value: "payment", label: "Confirmed after payment" },
      { value: "contact", label: "Admin contacts customer first" },
      { value: "depends", label: "Depends on service / package" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "bookingRules",
    section: "Booking",
    title: "Which booking rules do you need?",
    type: "multi",
    showWhen: (f) => hasProject(f, "booking", "travel", "rental"),
    options: [
      { value: "lead", label: "Minimum advance notice" },
      { value: "future", label: "Maximum days/months bookable ahead" },
      { value: "capacity", label: "Daily / slot capacity" },
      { value: "blackout", label: "Blocked / unavailable dates" },
      { value: "closed", label: "Regular closed days" },
      { value: "cancel", label: "Customer cancellation" },
      { value: "reschedule", label: "Customer rescheduling" },
      { value: "cutoff", label: "Cancellation / reschedule cutoff" },
      { value: "addons", label: "Add-ons / extras" },
      { value: "guestCount", label: "Guest / participant count" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },

  // TRAVEL
  {
    id: "travelFeatures",
    section: "Travel",
    title: "What should the travel section manage?",
    type: "multi",
    showWhen: (f) => hasProject(f, "travel"),
    options: [
      { value: "packages", label: "Travel / tour packages" },
      { value: "destinations", label: "Destinations" },
      { value: "dates", label: "Travel dates / departures" },
      { value: "slots", label: "Available slots / capacity" },
      { value: "itinerary", label: "Itinerary" },
      { value: "inclusions", label: "Inclusions / exclusions" },
      { value: "traveler", label: "Traveler information" },
      { value: "documents", label: "Traveler document uploads" },
      { value: "room", label: "Room / accommodation choices" },
      { value: "transport", label: "Transport choices" },
      { value: "promo", label: "Promos / seasonal pricing" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },

  // RENTAL / ACCOMMODATION
  {
    id: "rentalFeatures",
    section: "Rental",
    title: "What should be managed for accommodations or rentals?",
    type: "multi",
    showWhen: (f) => hasProject(f, "rental"),
    options: [
      { value: "units", label: "Rooms / units / properties / rental items" },
      { value: "availability", label: "Availability calendar" },
      { value: "rates", label: "Rates / seasonal pricing" },
      { value: "capacity", label: "Guest / occupancy limits" },
      { value: "amenities", label: "Amenities / inclusions" },
      { value: "deposit", label: "Security deposit" },
      { value: "checkin", label: "Check-in / check-out information" },
      { value: "rules", label: "House / rental rules" },
      { value: "documents", label: "Guest documents / agreements" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },

  // EDUCATION
  {
    id: "educationUsers",
    section: "Education",
    title: "Who will use the education platform?",
    type: "multi",
    showWhen: (f) => hasProject(f, "education"),
    options: [
      { value: "students", label: "Students / reviewees" },
      { value: "teachers", label: "Teachers / instructors" },
      { value: "admin", label: "School / center admin" },
      { value: "parents", label: "Parents / guardians" },
      { value: "staff", label: "Staff" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "learningFeatures",
    section: "Education",
    title: "What should students be able to access?",
    type: "multi",
    showWhen: (f) => hasProject(f, "education"),
    options: [
      { value: "courses", label: "Subjects / courses" },
      { value: "lessons", label: "Lessons / modules" },
      { value: "files", label: "Files / learning materials" },
      { value: "video", label: "Videos / links" },
      { value: "assignments", label: "Assignments / activities" },
      { value: "quizzes", label: "Quizzes / exams / reviewers" },
      { value: "grades", label: "Grades / scores" },
      { value: "progress", label: "Progress tracking" },
      { value: "announcements", label: "Announcements" },
      { value: "attendance", label: "Attendance" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "quizTypes",
    section: "Education",
    title: "Which question types do you need?",
    type: "multi",
    showWhen: (f) => has(f, "learningFeatures", "quizzes"),
    options: [
      { value: "mcq", label: "Multiple choice" },
      { value: "multi", label: "Choose all that apply" },
      { value: "truefalse", label: "True / false" },
      { value: "identification", label: "Identification / fill in the blank" },
      { value: "essay", label: "Written / essay answer" },
      { value: "image", label: "Image-based questions / answers" },
      { value: "upload", label: "File upload answer" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "quizSettings",
    section: "Education",
    title: "Which quiz / exam settings do you need?",
    type: "multi",
    showWhen: (f) => has(f, "learningFeatures", "quizzes"),
    options: [
      { value: "attempts", label: "Attempt limits" },
      { value: "timer", label: "Time limit" },
      { value: "random", label: "Randomize questions / choices" },
      { value: "instant", label: "Instant score" },
      { value: "review", label: "Review answers after submission" },
      { value: "reveal", label: "Control when correct answers are shown" },
      { value: "pass", label: "Passing score" },
      { value: "availability", label: "Open / close dates" },
      { value: "bank", label: "Question bank" },
      { value: "bulk", label: "Bulk import questions" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "schoolStructure",
    section: "Education",
    title: "How should learning access be organized?",
    type: "multi",
    showWhen: (f) => hasProject(f, "education"),
    options: [
      { value: "subjects", label: "Subjects / courses" },
      { value: "sections", label: "Classes / sections" },
      { value: "levels", label: "Grade / year levels" },
      { value: "terms", label: "Terms / semesters / school years" },
      { value: "enrollment", label: "Enrollment / assigned access" },
      { value: "paid", label: "Paid course / membership access" },
      { value: "expiry", label: "Access expiry / license period" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "gradingAttendance",
    section: "Education",
    title: "Do you need grading or attendance tools?",
    type: "multi",
    showWhen: (f) => hasProject(f, "education"),
    options: [
      { value: "grades", label: "Grade / score management" },
      { value: "weighted", label: "Weighted grading" },
      { value: "periods", label: "Grading periods" },
      { value: "attendance", label: "Attendance tracking" },
      { value: "teacherAttendance", label: "Teacher records attendance" },
      { value: "studentCheckin", label: "Student check-in" },
      { value: "reports", label: "Grade / attendance reports" },
      { value: "none", label: "No grading / attendance needed" },
      { value: "unsure", label: "Not sure" },
    ],
  },

  // HR
  {
    id: "hrFeatures",
    section: "HR",
    title: "What should the HR / employee system manage?",
    type: "multi",
    showWhen: (f) => hasProject(f, "hr"),
    options: [
      { value: "profiles", label: "Employee profiles / records" },
      { value: "attendance", label: "Attendance / time in-out" },
      { value: "schedule", label: "Schedules / shifts" },
      { value: "leave", label: "Leave requests" },
      { value: "overtime", label: "Overtime requests / records" },
      { value: "documents", label: "Employee documents" },
      { value: "payslip", label: "Payslip / payroll-related records" },
      { value: "performance", label: "Performance records" },
      { value: "announcements", label: "Announcements" },
      { value: "recruitment", label: "Recruitment / applicants" },
      { value: "reports", label: "Reports / exports" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "leaveApproval",
    section: "HR",
    title: "How should leave / employee requests be approved?",
    type: "single",
    showWhen: (f) => has(f, "hrFeatures", "leave") || has(f, "hrFeatures", "overtime"),
    options: [
      { value: "hr", label: "HR approves" },
      { value: "supervisor", label: "Supervisor / manager approves" },
      { value: "twoStep", label: "Supervisor first, then HR" },
      { value: "role", label: "Depends on employee / department" },
      { value: "none", label: "No approval workflow" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "recruitment",
    section: "HR",
    title: "What should applicants be able to do?",
    type: "multi",
    showWhen: (f) => has(f, "hrFeatures", "recruitment") || hasProject(f, "hr"),
    options: [
      { value: "jobs", label: "View job openings" },
      { value: "apply", label: "Submit application form" },
      { value: "cv", label: "Upload CV / resume / documents" },
      { value: "status", label: "Track application status" },
      { value: "account", label: "Create applicant account" },
      { value: "interview", label: "Interview scheduling" },
      { value: "notes", label: "Admin notes / evaluation" },
      { value: "unsure", label: "Not sure" },
    ],
  },

  // CUSTOM / RECORDS / WORKFLOW
  {
    id: "records",
    section: "System",
    title: "What kinds of information should the system manage?",
    type: "multi",
    showWhen: (f) => hasProject(f, "custom", "inventory", "portal"),
    options: [
      { value: "customers", label: "Customers / clients" },
      { value: "transactions", label: "Transactions / payments" },
      { value: "requests", label: "Requests / cases / tickets" },
      { value: "applications", label: "Applications / submissions" },
      { value: "documents", label: "Documents / files" },
      { value: "inventory", label: "Products / inventory" },
      { value: "projects", label: "Projects / jobs / tasks" },
      { value: "members", label: "Members / subscriptions" },
      { value: "employees", label: "Employees / staff" },
      { value: "other", label: "Other / not sure" },
    ],
  },
  {
    id: "workflow",
    section: "System",
    title: "Which workflow features are needed?",
    type: "multi",
    showWhen: (f) => hasProject(f, "custom", "inventory", "portal", "hr"),
    options: [
      { value: "statuses", label: "Statuses / progress stages" },
      { value: "approval", label: "Approval / rejection" },
      { value: "assign", label: "Assign records to staff" },
      { value: "notes", label: "Internal notes" },
      { value: "history", label: "Activity / transaction history" },
      { value: "search", label: "Search / filters" },
      { value: "bulk", label: "Bulk actions / import" },
      { value: "export", label: "Export CSV / Excel" },
      { value: "archive", label: "Archive / restore records" },
      { value: "automation", label: "Automatic actions / rules" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "fileUploads",
    section: "System",
    title: "Will users or staff upload files?",
    type: "single",
    showWhen: (f) => hasProject(f, "portal", "custom", "hr", "education", "travel"),
    options: YES_NO_UNSURE,
  },
  {
    id: "fileTypes",
    section: "System",
    title: "What kinds of files?",
    type: "multi",
    showWhen: (f) => has(f, "fileUploads", "yes"),
    options: [
      { value: "images", label: "Images / photos" },
      { value: "pdf", label: "PDF / documents" },
      { value: "cv", label: "CV / resume" },
      { value: "receipts", label: "Receipts / payment proof" },
      { value: "school", label: "Assignments / school files" },
      { value: "contracts", label: "Contracts / agreements" },
      { value: "other", label: "Other file types" },
    ],
  },

  // MEMBERSHIP / SUBSCRIPTION
  {
    id: "membership",
    section: "Membership",
    title: "Do you need memberships, subscriptions, or access levels?",
    type: "single",
    showWhen: (f) => hasProject(f, "portal", "education", "shop", "custom"),
    options: YES_NO_UNSURE,
  },
  {
    id: "membershipFeatures",
    section: "Membership",
    title: "How should membership / subscription work?",
    type: "multi",
    showWhen: (f) => has(f, "membership", "yes"),
    options: [
      { value: "levels", label: "Different plans / membership levels" },
      { value: "approval", label: "Admin approval" },
      { value: "payment", label: "Paid membership" },
      { value: "expiry", label: "Expiry / renewal date" },
      { value: "private", label: "Private member-only content" },
      { value: "pricing", label: "Special member pricing" },
      { value: "points", label: "Points / rewards" },
      { value: "referral", label: "Referral tracking" },
      { value: "renewal", label: "Renewal reminders" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },

  // NOTIFICATIONS / REPORTS / INTEGRATIONS
  {
    id: "notifications",
    section: "Communication",
    title: "Which notifications do you need?",
    type: "multi",
    showWhen: (f) => f.projectTypes.length > 0,
    options: [
      { value: "emailCustomer", label: "Email customers / users" },
      { value: "emailAdmin", label: "Email admin / staff" },
      { value: "onsite", label: "Notifications inside the system" },
      { value: "reminders", label: "Reminders" },
      { value: "status", label: "Status update notifications" },
      { value: "none", label: "No automatic notifications" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "reports",
    section: "Reports",
    title: "Do you need reports or downloadable data?",
    type: "multi",
    showWhen: (f) => hasProject(f, "shop", "booking", "portal", "education", "hr", "travel", "rental", "inventory", "custom"),
    options: [
      { value: "dashboard", label: "Dashboard totals / summaries" },
      { value: "sales", label: "Sales / payment reports" },
      { value: "orders", label: "Order / booking reports" },
      { value: "users", label: "User / customer reports" },
      { value: "school", label: "Student / grade / attendance reports" },
      { value: "hr", label: "Employee / attendance / leave reports" },
      { value: "csv", label: "CSV / Excel export" },
      { value: "pdf", label: "PDF / printable report" },
      { value: "none", label: "No reports needed" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "integrations",
    section: "Integrations",
    title: "Do you need to connect with another service?",
    type: "multi",
    showWhen: (f) => f.projectTypes.length > 0,
    options: [
      { value: "calendar", label: "Google Calendar" },
      { value: "meet", label: "Google Meet" },
      { value: "maps", label: "Google Maps" },
      { value: "email", label: "Email service" },
      { value: "payment", label: "Payment gateway" },
      { value: "courier", label: "Courier / delivery service" },
      { value: "social", label: "Social media links / feeds" },
      { value: "analytics", label: "Analytics / tracking" },
      { value: "other", label: "Another service" },
      { value: "none", label: "None" },
      { value: "unsure", label: "Not sure — recommend for me" },
    ],
  },
  {
    id: "language",
    section: "Settings",
    title: "Does the website/system need more than one language?",
    type: "single",
    showWhen: (f) => f.projectTypes.length > 0,
    options: [
      { value: "one", label: "No — one language only" },
      { value: "two", label: "Yes — two languages" },
      { value: "three", label: "Yes — three or more languages" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
  {
    id: "locations",
    section: "Settings",
    title: "Will this cover more than one branch, location, or business unit?",
    type: "single",
    showWhen: (f) => f.projectTypes.length > 0,
    options: [
      { value: "one", label: "No — one location / business" },
      { value: "few", label: "Yes — 2–5" },
      { value: "many", label: "Yes — more than 5" },
      { value: "online", label: "Online only / not location-based" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "expectedUsers",
    section: "Settings",
    title: "About how many people may use the system?",
    type: "single",
    showWhen: (f) => has(f, "accountsNeeded", "yes") || hasProject(f, "education", "hr", "portal", "custom"),
    options: [
      { value: "under50", label: "Under 50" },
      { value: "50-300", label: "50–300" },
      { value: "301-1000", label: "301–1,000" },
      { value: "1000+", label: "More than 1,000" },
      { value: "public", label: "Open to the public / unknown" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
];

const budgetOptions = [
  "Below ₱5,000",
  "₱5,000 – ₱10,000",
  "₱10,000 – ₱20,000",
  "₱20,000 – ₱40,000",
  "₱40,000 – ₱75,000",
  "₱75,000+",
  "Not sure yet",
];

const timelineOptions = [
  "As soon as possible",
  "Within 1–2 weeks",
  "Within 2–4 weeks",
  "Within 1–2 months",
  "Within 2–3 months",
  "Flexible / no fixed deadline",
];

const money = (n: number) => `₱${Math.round(n / 500) * 500}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function calculateEstimate(form: FormState) {
  if (!form.started || form.projectTypes.length === 0) return null;

  const baseByProject: Record<string, number> = {
    website: 6500,
    shop: 12000,
    booking: 12000,
    portal: 15000,
    education: 20000,
    hr: 20000,
    travel: 14000,
    rental: 15000,
    inventory: 16000,
    custom: 20000,
    unsure: 10000,
  };

  let base = Math.max(...form.projectTypes.map((p) => baseByProject[p] || 10000));
  if (form.projectTypes.length > 1) base += (form.projectTypes.length - 1) * 3500;

  const add = (condition: boolean, amount: number) => {
    if (condition) base += amount;
  };

  add(has(form, "selfManage", "yes") || has(form, "selfManage", "some"), 3000);
  add(has(form, "accountsNeeded", "yes"), 3500);
  add(has(form, "accountCreation", "approval") || has(form, "accountCreation", "mixed"), 2000);
  add(((form.answers.userRoles as string[] | undefined)?.length ?? 0) > 3, 3000);
  add(has(form, "inventory", "variant"), 2500);
  add(has(form, "inventory", "location") || has(form, "inventory", "advanced"), 5000);
  add(has(form, "paymentsNeeded", "yes"), 2500);
  add(has(form, "paymentType", "gateway"), 4000);
  add(has(form, "paymentType", "installment"), 3500);
  add(has(form, "manualProof", "yes"), 2000);
  add(has(form, "paymentReview", "admin") || has(form, "paymentReview", "staff"), 2000);
  add(has(form, "shippingRules", "integration"), 4500);
  add(has(form, "bookingDuration", "service") || has(form, "bookingDuration", "range"), 2500);
  add(has(form, "slotBehavior", "buffer"), 1500);
  add(has(form, "slotBehavior", "capacity"), 2500);
  add(has(form, "slotBehavior", "staff"), 3000);
  add(has(form, "bookingApproval", "admin") || has(form, "bookingApproval", "depends"), 2000);
  add(has(form, "learningFeatures", "quizzes"), 5000);
  add(has(form, "quizSettings", "bank"), 2500);
  add(has(form, "quizSettings", "bulk"), 2500);
  add(has(form, "gradingAttendance", "grades") || has(form, "gradingAttendance", "attendance"), 4000);
  add(has(form, "hrFeatures", "attendance"), 3500);
  add(has(form, "hrFeatures", "leave") || has(form, "hrFeatures", "overtime"), 3000);
  add(has(form, "hrFeatures", "recruitment"), 4000);
  add(has(form, "workflow", "approval"), 2500);
  add(has(form, "workflow", "automation"), 4000);
  add(has(form, "workflow", "bulk"), 2000);
  add(has(form, "workflow", "export"), 1500);
  add(has(form, "fileUploads", "yes"), 2000);
  add(has(form, "membership", "yes"), 4000);
  add(has(form, "membershipFeatures", "points"), 3500);
  add(has(form, "membershipFeatures", "referral"), 3500);
  add(has(form, "membershipFeatures", "expiry"), 2500);
  add(has(form, "integrations", "calendar"), 1500);
  add(has(form, "integrations", "meet"), 1500);
  add(has(form, "integrations", "payment"), 3000);
  add(has(form, "integrations", "courier"), 4000);
  add(has(form, "language", "two"), 3000);
  add(has(form, "language", "three"), 6000);
  add(has(form, "locations", "few"), 2500);
  add(has(form, "locations", "many"), 5000);
  add(has(form, "expectedUsers", "301-1000"), 3000);
  add(has(form, "expectedUsers", "1000+") || has(form, "expectedUsers", "public"), 6000);

  const multiComplexity = Object.values(form.answers).reduce(
    (sum, value) => sum + (Array.isArray(value) ? Math.max(0, value.length - 3) * 350 : 0),
    0,
  );
  base += Math.min(multiComplexity, 9000);

  const floor = hasProject(form, "education", "hr", "custom") ? 20000 : hasProject(form, "shop", "booking", "travel", "rental", "portal", "inventory") ? 12000 : 6500;
  const low = Math.max(floor, Math.round(base / 1000) * 1000);
  const spread = low < 15000 ? 5000 : low < 30000 ? 8000 : Math.max(10000, Math.round(low * 0.3 / 1000) * 1000);
  return { low, high: low + spread };
}

function answerLabels(question: Question, value: AnswerValue | undefined) {
  if (!value) return "—";
  const values = Array.isArray(value) ? value : [value];
  return values
    .map((v) => question.options.find((o) => o.value === v)?.label || v)
    .join(", ");
}

export default function QuoteForm({ productName, productSlug, category, backHref }: Props) {
  const [form, setForm] = useState<FormState>(initialState);
  const [showWelcome, setShowWelcome] = useState(true);
  const [stage, setStage] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const draftKey = useMemo(() => `tcl-quotation-wizard-v2:${productSlug}`, [productSlug]);
  const relevantProjectOptions = useMemo(
    () => relevantProjectsForIndustry(form.industry),
    [form.industry],
  );

  const visibleQuestions = useMemo(() => {
    const relevant = questions.filter((q) => questionIsRelevant(form, q));

    /*
     * Put the questions for the client's chosen system first.
     * The original order inside each section is preserved, so dependent
     * follow-up questions still appear in the correct sequence.
     */
    const sectionOrderByProject: Record<string, string[]> = {
      website: [
        "Website", "Admin", "Users", "Communication", "Integrations",
        "Settings", "Reports", "System",
      ],
      shop: [
        "Shop", "Payments", "Delivery", "Users", "Membership", "Admin",
        "Website", "Communication", "Reports", "Integrations", "Settings", "System",
      ],
      booking: [
        "Booking", "Payments", "Users", "Admin", "Website",
        "Communication", "Reports", "Integrations", "Settings", "System",
      ],
      portal: [
        "Users", "System", "Admin", "Payments", "Membership", "Website",
        "Communication", "Reports", "Integrations", "Settings",
      ],
      education: [
        "Education", "Users", "Admin", "Payments", "System", "Website",
        "Communication", "Reports", "Integrations", "Settings",
      ],
      hr: [
        "HR", "Users", "Admin", "System", "Website",
        "Communication", "Reports", "Integrations", "Settings",
      ],
      travel: [
        "Travel", "Booking", "Payments", "Users", "Admin", "Website",
        "Communication", "Reports", "Integrations", "Settings", "System",
      ],
      rental: [
        "Rental", "Booking", "Payments", "Users", "Admin", "Website",
        "Communication", "Reports", "Integrations", "Settings", "System",
      ],
      inventory: [
        "System", "Shop", "Admin", "Users", "Reports",
        "Integrations", "Settings", "Website", "Communication",
      ],
      custom: [
        "System", "Users", "Admin", "Payments", "Membership", "Website",
        "Communication", "Reports", "Integrations", "Settings",
      ],
      unsure: [
        "Website", "Users", "Admin", "System", "Payments", "Communication",
        "Reports", "Integrations", "Settings",
      ],
    };

    // For multiple selected project types, respect the order the client selected them.
    const preferredSections: string[] = [];
    form.projectTypes.forEach((project) => {
      (sectionOrderByProject[project] || []).forEach((section) => {
        if (!preferredSections.includes(section)) preferredSections.push(section);
      });
    });

    const originalIndex = new Map(questions.map((q, index) => [q.id, index]));

    return [...relevant].sort((a, b) => {
      const aRank = preferredSections.indexOf(a.section);
      const bRank = preferredSections.indexOf(b.section);
      const normalizedA = aRank === -1 ? 999 : aRank;
      const normalizedB = bRank === -1 ? 999 : bRank;

      if (normalizedA !== normalizedB) return normalizedA - normalizedB;
      return (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0);
    });
  }, [form]);
  const currentQuestion = visibleQuestions[Math.min(questionIndex, Math.max(0, visibleQuestions.length - 1))];
  const estimate = useMemo(() => calculateEstimate(form), [form]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw) as { form?: Partial<FormState>; stage?: number; questionIndex?: number };
        if (saved.form) setForm((current) => ({ ...current, ...saved.form }));
        if (saved.stage && saved.stage >= 1 && saved.stage <= 5) setStage(saved.stage);
        if (typeof saved.questionIndex === "number") setQuestionIndex(saved.questionIndex);
      }
    } catch (e) {
      console.warn("Unable to restore quotation draft:", e);
    } finally {
      setDraftReady(true);
    }
  }, [draftKey]);

  useEffect(() => {
    if (!draftReady) return;
    try {
      window.localStorage.setItem(
        draftKey,
        JSON.stringify({ form, stage, questionIndex, savedAt: new Date().toISOString() }),
      );
    } catch (e) {
      console.warn("Unable to save quotation draft:", e);
    }
  }, [draftKey, draftReady, form, stage, questionIndex]);

  const scrollTop = () =>
    window.requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );

  function patch(patchValue: Partial<FormState>) {
    setForm((current) => ({ ...current, ...patchValue }));
    setError("");
  }

  function cancelRequest() {
    setShowWelcome(true);
    setError("");
    window.requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function startOverRequest() {
    const confirmed = window.confirm(
      "Start this request over? This will permanently clear all of your answers and return you to the beginning.",
    );
    if (!confirmed) return;

    try {
      window.localStorage.removeItem(draftKey);
    } catch (e) {
      console.warn("Unable to remove quotation draft:", e);
    }

    setForm({ ...initialState, started: false });
    setShowWelcome(true);
    setStage(1);
    setQuestionIndex(0);
    setError("");
    window.requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function setAnswer(id: string, value: AnswerValue) {
    setForm((current) => ({
      ...current,
      answers: { ...current.answers, [id]: value },
    }));
    setError("");
  }

  function toggleAnswer(id: string, value: string) {
    const current = form.answers[id];
    const list = Array.isArray(current) ? current : [];
    setAnswer(id, list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  function toggleProject(value: string) {
    const next = form.projectTypes.includes(value)
      ? form.projectTypes.filter((x) => x !== value)
      : [...form.projectTypes.filter((x) => x !== "unsure"), value];
    patch({ projectTypes: value === "unsure" ? ["unsure"] : next });
  }

  function questionAnswered(q: Question | undefined) {
    if (!q) return true;
    if (!q.required) return true;
    const value = form.answers[q.id];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }

  function nextQuestion() {
    if (!questionAnswered(currentQuestion)) {
      setError("Choose an option to continue.");
      return;
    }
    if (questionIndex < visibleQuestions.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      setStage(4);
    }
    scrollTop();
  }

  function previousQuestion() {
    if (questionIndex > 0) setQuestionIndex((i) => i - 1);
    else setStage(2);
    scrollTop();
  }

  function validateDetails() {
    if (!form.businessName.trim()) return "Enter the project, business, or organization name.";
    if (!form.fullName.trim()) return "Enter your full name.";
    if (!form.email.trim()) return "Enter your active email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Enter a valid email address.";
    if (!form.emailConfirmed) return "Confirm that the email address is active and can receive messages.";
    if (!form.contactNumber.trim()) return "Enter a contact number, Messenger, or Telegram contact.";
    if (!form.budget) return "Select a budget range.";
    if (!form.timeline) return "Select a preferred timeline.";
    return "";
  }

  const summaryGroups = useMemo(() => {
    const groups = new Map<string, Array<[string, string]>>();
    visibleQuestions.forEach((q) => {
      const value = form.answers[q.id];
      if (!value || (Array.isArray(value) && value.length === 0)) return;
      const row: [string, string] = [q.title, answerLabels(q, value)];
      groups.set(q.section, [...(groups.get(q.section) || []), row]);
    });
    return [...groups.entries()];
  }, [form.answers, visibleQuestions]);

  async function submitQuoteRequest() {
    const detailsError = validateDetails();
    if (detailsError) {
      setError(detailsError);
      setStage(4);
      scrollTop();
      return;
    }
    if (!form.finalConfirmed) {
      setError("Please confirm that you reviewed your request before submitting.");
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setError("");

    const requirementsText = summaryGroups
      .map(([section, rows]) => `${section}\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}`)
      .join("\n\n");

    const selectedFeatures = summaryGroups.flatMap(([section, rows]) =>
      rows.map(([k, v]) => `${section} — ${k}: ${v}`),
    );

    const payload = {
      productSlug,
      productName,
      category,
      fullName: form.fullName.trim(),
      businessName: form.businessName.trim(),
      email: form.email.trim(),
      contactNumber: form.contactNumber.trim(),
      preferredContact: form.preferredContact,
      projectContext: form.industry,
      businessType: form.projectTypes
        .map((p) => projectOptions.find((o) => o.value === p)?.label || p)
        .join(", "),
      businessLocation: form.businessLocation,
      businessAge: "",
      staffCount: "",
      locationCount: answerLabels(questions.find((q) => q.id === "locations")!, form.answers.locations),
      currentLink: form.currentLink,
      existingWebsite: form.currentLink ? "Existing link provided" : "",
      userTypes: answerLabels(questions.find((q) => q.id === "userRoles")!, form.answers.userRoles),
      accessModel: answerLabels(questions.find((q) => q.id === "accountCreation")!, form.answers.accountCreation),
      adminRequirements: answerLabels(questions.find((q) => q.id === "adminManage")!, form.answers.adminManage),
      deviceRequirements: "Responsive website/system for desktop, tablet, and mobile",
      visitorActions:
        answerLabels(questions.find((q) => q.id === "publicPurpose")!, form.answers.publicPurpose) ||
        requirementsText ||
        "User actions captured through the guided quotation questionnaire.",
      selfManage: answerLabels(questions.find((q) => q.id === "selfManage")!, form.answers.selfManage),
      userAccounts: answerLabels(questions.find((q) => q.id === "accountsNeeded")!, form.answers.accountsNeeded),
      sellOnline: hasProject(form, "shop") ? "Yes — online shop selected" : "",
      onlinePayments: answerLabels(questions.find((q) => q.id === "paymentType")!, form.answers.paymentType),
      integrationNeeded: answerLabels(questions.find((q) => q.id === "integrations")!, form.answers.integrations),
      uncertaintyNotes: selectedFeatures.some((x) => x.includes("Not sure")) ? "Client selected one or more Not sure / recommend options." : "",
      offerings:
        form.projectTypes.map((p) => projectOptions.find((o) => o.value === p)?.label || p).join(", ") ||
        requirementsText ||
        "Custom website/system quotation request",
      currentProcess: requirementsText,
      mainProblems:
        requirementsText ||
        selectedFeatures.join("\n") ||
        "Requirements captured through the guided quotation questionnaire.",
      selectedFeatures,
      mainGoal: "Build the selected website/system functions and workflow described in the guided requirements.",
      expectedVolume: answerLabels(questions.find((q) => q.id === "expectedUsers")!, form.answers.expectedUsers),
      paymentMethods: answerLabels(questions.find((q) => q.id === "paymentType")!, form.answers.paymentType),
      deliveryNeeds: answerLabels(questions.find((q) => q.id === "fulfillment")!, form.answers.fulfillment),
      adminAccess: answerLabels(questions.find((q) => q.id === "adminManage")!, form.answers.adminManage),
      integrations: answerLabels(questions.find((q) => q.id === "integrations")!, form.answers.integrations),
      dataManagement: answerLabels(questions.find((q) => q.id === "records")!, form.answers.records),
      recurringChanges: answerLabels(questions.find((q) => q.id === "selfManage")!, form.answers.selfManage),
      usageRules: requirementsText,
      resultsReporting: answerLabels(questions.find((q) => q.id === "reports")!, form.answers.reports),
      logoReady: form.logoReady,
      brandingReady: form.brandingReady,
      contentReady: form.contentReady,
      domainStatus: form.domainStatus,
      budget: form.budget,
      timeline: form.timeline,
      notes: [
        form.otherRequirements.trim() ? `Other requirements: ${form.otherRequirements.trim()}` : "",
        form.notes.trim(),
        estimate ? `Preliminary automated estimate shown at submission: ${money(estimate.low)} – ${money(estimate.high)}` : "",
      ].filter(Boolean).join("\n\n"),
    };

    try {
      const response = await fetch("/api/quotation-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        success?: boolean;
        requestId?: string;
        secureToken?: string;
        error?: string;
      };
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to submit your quotation request.");
      window.localStorage.removeItem(draftKey);
      if (!result.secureToken) throw new Error("Your request was saved, but the secure quotation link could not be created. Please contact TCL.");
      window.location.assign(`/quotation/${encodeURIComponent(result.secureToken)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit your quotation request.");
    } finally {
      setSubmitting(false);
    }
  }

  const stages = ["Business", "Needs", "Setup", "Details", "Review"];
  const progress = stage === 3 && visibleQuestions.length
    ? 40 + ((questionIndex + 1) / visibleQuestions.length) * 20
    : ((stage - 1) / (stages.length - 1)) * 100;

  if (showWelcome) {
    return (
      <form ref={formRef} className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.welcomeActions}>
          <a href={backHref} className={styles.backProductPill}>
            ← Back to Product
          </a>
        </div>

        <section className={styles.welcome}>
          <span className={styles.eyebrow}>REQUEST A CUSTOM QUOTE</span>
          <h2>Let&apos;s understand what you need.</h2>
          <p>
            You don&apos;t need technical terms or a complete feature list. We&apos;ll guide you through
            simple choices and only show follow-up questions that match your project.
          </p>
          <div className={styles.welcomePoints}>
            <span>✓ Mostly choose from options — minimal typing</span>
            <span>✓ Your progress saves automatically</span>
            <span>✓ Preliminary estimate shown at the end</span>
          </div>
          <div className={styles.emailNotice}>
            <strong>Please use an active email address.</strong>
            <span>
              TCL will email your official quotation or contact you if we need to confirm any requirement.
              Please make sure your email can receive messages and check Spam/Junk if needed.
            </span>
          </div>
          <p className={styles.disclaimer}>
            Your preliminary estimate is shown only after you complete the guided questions. It is an
            initial guide only. Final scope, price, and timeline are confirmed after TCL reviews your
            complete request. Submitting does not commit you to purchase.
          </p>
          <button
            type="button"
            className={styles.startButton}
            onClick={() => {
              patch({ started: true });
              setShowWelcome(false);
              scrollTop();
            }}
          >
            {form.started ? "Continue My Request →" : "Start My Request →"}
          </button>
        </section>
      </form>
    );
  }

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault();
      }}
    >
      <div className={`${styles.requestActions} ${styles.requestActionsStarted}`}>
        <button type="button" className={styles.exitRequest} onClick={cancelRequest}>
          Cancel / Exit Request
        </button>
        <button type="button" className={styles.startOverRequest} onClick={startOverRequest}>
          ↻ Start Over Request
        </button>
      </div>

      <header className={styles.wizardTop}>
        <div className={styles.topLine}>
          <div>
            <span className={styles.eyebrow}>CUSTOM PROJECT REQUEST</span>
            <strong>{stages[stage - 1]}</strong>
          </div>
          <span className={styles.autosave}>● Draft autosaves</span>
        </div>
        <div className={styles.progressTrack}><span style={{ width: `${Math.min(100, progress)}%` }} /></div>
        <div className={styles.stepLabels}>
          {stages.map((label, i) => (
            <span key={label} className={i + 1 === stage ? styles.activeStep : ""}>
              {i + 1}. {label}
            </span>
          ))}
        </div>
      </header>



      {error && <div className={styles.errorMessage}>{error}</div>}

      {stage === 1 && (
        <section className={styles.stepCard}>
          <div className={styles.stepHeading}>
            <span>01 / BUSINESS</span>
            <h2>Tell us what kind of business this is.</h2>
          </div>
          <label>
            <span>Business / industry</span>
            <select
              value={form.industry}
              onChange={(e) => {
                const industry = e.target.value;
                const allowed = new Set(relevantProjectsForIndustry(industry).map((option) => option.value));
                setForm((current) => ({
                  ...current,
                  industry,
                  projectTypes: broadIndustry(industry)
                    ? current.projectTypes
                    : current.projectTypes.filter((project) => allowed.has(project)),
                  answers: {},
                }));
                setQuestionIndex(0);
                setError("");
              }}
            >
              <option value="">Choose the closest match</option>
              {industries.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
        </section>
      )}

      {stage === 2 && (
        <section className={styles.stepCard}>
          <div className={styles.stepHeading}>
            <span>02 / NEEDS</span>
            <h2>What do you need for your business?</h2>
            <p>
              We&apos;re only showing options that normally apply to your selected business.
              Choose everything you need.
            </p>
          </div>
          <div className={styles.optionList}>
            {relevantProjectOptions.map((o) => {
              const active = form.projectTypes.includes(o.value);
              return (
                <button
                  type="button"
                  key={o.value}
                  className={active ? styles.optionActive : ""}
                  onClick={() => toggleProject(o.value)}
                >
                  <span className={styles.check}>{active ? "✓" : ""}</span>
                  <span>{o.label}</span>
                </button>
              );
            })}
          </div>
          {!broadIndustry(form.industry) && (
            <p className={styles.relevanceNote}>
              Need something outside these options? Choose <strong>Custom web-based system / dashboard</strong>
              or go back and select <strong>Other / Not sure</strong> to see every project type.
            </p>
          )}
        </section>
      )}

      {stage === 3 && currentQuestion && (
        <section className={styles.questionPanel}>
          <div className={styles.questionMeta}>
            <span>{currentQuestion.section}</span>
            <small>{questionIndex + 1} of {visibleQuestions.length}</small>
          </div>
          <h2>{currentQuestion.title}</h2>
          {currentQuestion.help && <p>{currentQuestion.help}</p>}
          <div className={styles.optionList}>
            {relevantOptions(form, currentQuestion).map((o) => {
              const value = form.answers[currentQuestion.id];
              const active = Array.isArray(value) ? value.includes(o.value) : value === o.value;
              return (
                <button
                  type="button"
                  key={o.value}
                  className={active ? styles.optionActive : ""}
                  onClick={() =>
                    currentQuestion.type === "multi"
                      ? toggleAnswer(currentQuestion.id, o.value)
                      : setAnswer(currentQuestion.id, o.value)
                  }
                >
                  <span className={styles.check}>{active ? "✓" : ""}</span>
                  <span>
                    {o.label}
                    {o.hint ? <small>{o.hint}</small> : null}
                  </span>
                </button>
              );
            })}
          </div>
          {questionIndex === visibleQuestions.length - 1 && (
            <label className={styles.optionalText}>
              <span>Anything important that wasn&apos;t covered? <small>Optional</small></span>
              <textarea
                value={form.otherRequirements}
                onChange={(e) => patch({ otherRequirements: e.target.value })}
                placeholder="Only add something here if the choices above did not cover it."
              />
            </label>
          )}
        </section>
      )}

      {stage === 4 && (
        <section className={styles.stepCard}>
          <div className={styles.stepHeading}>
            <span>04 / DETAILS</span>
            <h2>Where should we send your quotation?</h2>
            <p>Please use an active email. TCL may also email you if a requirement needs confirmation.</p>
          </div>
          <div className={styles.twoColumns}>
            <label><span>Business / project name *</span><input value={form.businessName} onChange={(e) => patch({ businessName: e.target.value })} /></label>
            <label><span>Full name *</span><input value={form.fullName} onChange={(e) => patch({ fullName: e.target.value })} autoComplete="name" /></label>
            <label><span>Active email address *</span><input type="email" value={form.email} onChange={(e) => patch({ email: e.target.value, emailConfirmed: false })} autoComplete="email" placeholder="you@example.com" /></label>
            <label><span>Contact number / Messenger / Telegram *</span><input value={form.contactNumber} onChange={(e) => patch({ contactNumber: e.target.value })} /></label>
            <label><span>Preferred written contact</span><select value={form.preferredContact} onChange={(e) => patch({ preferredContact: e.target.value })}><option value="">Select</option><option>Email</option><option>Messenger</option><option>Telegram</option><option>Mobile / SMS</option></select></label>
            <label><span>Location / audience</span><input value={form.businessLocation} onChange={(e) => patch({ businessLocation: e.target.value })} placeholder="Philippines, worldwide, online only..." /></label>
            <label><span>Budget range *</span><select value={form.budget} onChange={(e) => patch({ budget: e.target.value })}><option value="">Select budget</option>{budgetOptions.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label><span>Preferred timeline *</span><select value={form.timeline} onChange={(e) => patch({ timeline: e.target.value })}><option value="">Select timeline</option>{timelineOptions.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label><span>Existing website / page / system</span><input value={form.currentLink} onChange={(e) => patch({ currentLink: e.target.value })} placeholder="Link if available" /></label>
          </div>

          <label className={styles.confirmRow}>
            <input type="checkbox" checked={form.emailConfirmed} onChange={(e) => patch({ emailConfirmed: e.target.checked })} />
            <span>I confirm this email address is correct, active, and can receive messages from TCL.</span>
          </label>

          <div className={styles.readiness}>
            <label><span>Logo</span><select value={form.logoReady} onChange={(e) => patch({ logoReady: e.target.value })}><option value="">Select</option><option>Ready</option><option>Needs improvement</option><option>Not yet available</option></select></label>
            <label><span>Brand colors / style</span><select value={form.brandingReady} onChange={(e) => patch({ brandingReady: e.target.value })}><option value="">Select</option><option>Ready</option><option>Partially ready</option><option>Need guidance</option></select></label>
            <label><span>Content</span><select value={form.contentReady} onChange={(e) => patch({ contentReady: e.target.value })}><option value="">Select</option><option>Ready</option><option>Partially ready</option><option>Not ready yet</option></select></label>
            <label><span>Domain</span><select value={form.domainStatus} onChange={(e) => patch({ domainStatus: e.target.value })}><option value="">Select</option><option>I already own a domain</option><option>I need a custom domain</option><option>Free subdomain is okay</option><option>Not sure yet</option></select></label>
          </div>

          <label className={styles.optionalText}><span>Additional note <small>Optional</small></span><textarea value={form.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Only if there is anything else TCL should know." /></label>
        </section>
      )}

      {stage === 5 && (
        <section className={styles.stepCard}>
          <div className={styles.stepHeading}>
            <span>05 / REVIEW</span>
            <h2>Review your request.</h2>
            <p>This is the requirement summary TCL will use for assessment.</p>
          </div>

          <div className={styles.summaryTop}>
            <div><span>Industry</span><strong>{form.industry || "—"}</strong></div>
            <div><span>Project</span><strong>{form.projectTypes.map((p) => projectOptions.find((o) => o.value === p)?.label || p).join(", ")}</strong></div>
          </div>

          {estimate && (
            <div className={styles.finalEstimate}>
              <span>Preliminary estimated range</span>
              <strong>{money(estimate.low)} – {money(estimate.high)}</strong>
              <p>
                Automatically estimated from your selections. This is not a final quotation or confirmed
                project price. Final pricing may be lower or higher after TCL reviews the complete scope,
                complexity, integrations, and any needed clarification.
              </p>
            </div>
          )}

          <div className={styles.reviewSections}>
            {summaryGroups.map(([section, rows]) => (
              <details key={section}>
                <summary>{section}<span>{rows.length}</span></summary>
                <dl>
                  {rows.map(([label, value]) => (
                    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                  ))}
                </dl>
              </details>
            ))}
          </div>

          <div className={styles.contactReview}>
            <strong>{form.businessName}</strong>
            <span>{form.fullName} · {form.email}</span>
            <span>{form.budget} · {form.timeline}</span>
          </div>

          <div className={styles.emailNotice}>
            <strong>What happens next?</strong>
            <span>
              After submission, your secure request page will contain your request summary. TCL will review it
              and email <b>{form.email || "your active email"}</b> with your official quotation or if more
              confirmation is needed. Please check your Inbox and Spam/Junk folder.
            </span>
          </div>

          <label className={styles.confirmRow}>
            <input type="checkbox" checked={form.finalConfirmed} onChange={(e) => patch({ finalConfirmed: e.target.checked })} />
            <span>I reviewed my requirements and confirm the information above is correct.</span>
          </label>

          <p className={styles.disclaimer}>
            No commitment to purchase. Final inclusions, pricing, and timeline are confirmed only in TCL&apos;s official quotation.
          </p>
        </section>
      )}

      <div className={styles.wizardActions}>
        <button
          type="button"
          className={styles.backButton}
          disabled={stage === 1 || submitting}
          onClick={() => {
            if (stage === 3) previousQuestion();
            else setStage((s) => Math.max(1, s - 1));
            scrollTop();
          }}
        >
          ← Back
        </button>

        <span>{stage === 3 ? `${questionIndex + 1} / ${visibleQuestions.length}` : "Progress saved automatically"}</span>

        {stage < 5 ? (
          <button
            type="button"
            className={styles.nextButton}
            onClick={() => {
              if (stage === 1) {
                if (!form.industry) return setError("Choose the closest business / industry.");
                setStage(2);
              } else if (stage === 2) {
                if (!form.projectTypes.length) return setError("Choose at least one project type.");
                setQuestionIndex(0);
                setStage(3);
              } else if (stage === 3) {
                nextQuestion();
                return;
              } else if (stage === 4) {
                const e = validateDetails();
                if (e) return setError(e);
                setStage(5);
              }
              setError("");
              scrollTop();
            }}
          >
            Continue →
          </button>
        ) : (
          <button type="button" className={styles.nextButton} disabled={submitting} onClick={submitQuoteRequest}>
            {submitting ? "Submitting..." : "Submit Request →"}
          </button>
        )}
      </div>
    </form>
  );
}
