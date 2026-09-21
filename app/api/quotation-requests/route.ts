import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

type QuotePayload = {
  productSlug?: unknown;
  productName?: unknown;
  category?: unknown;
  fullName?: unknown;
  businessName?: unknown;
  email?: unknown;
  contactNumber?: unknown;
  preferredContact?: unknown;

  projectContext?: unknown;
  businessType?: unknown;
  businessLocation?: unknown;
  businessAge?: unknown;
  staffCount?: unknown;
  locationCount?: unknown;
  currentLink?: unknown;
  existingWebsite?: unknown;

  userTypes?: unknown;
  accessModel?: unknown;
  adminRequirements?: unknown;
  deviceRequirements?: unknown;

  visitorActions?: unknown;
  selfManage?: unknown;
  userAccounts?: unknown;
  sellOnline?: unknown;
  onlinePayments?: unknown;
  integrationNeeded?: unknown;
  uncertaintyNotes?: unknown;

  offerings?: unknown;
  currentProcess?: unknown;
  mainProblems?: unknown;
  selectedFeatures?: unknown;
  mainGoal?: unknown;
  expectedVolume?: unknown;
  paymentMethods?: unknown;
  deliveryNeeds?: unknown;
  adminAccess?: unknown;
  integrations?: unknown;

  dataManagement?: unknown;
  recurringChanges?: unknown;
  usageRules?: unknown;
  resultsReporting?: unknown;

  logoReady?: unknown;
  brandingReady?: unknown;
  contentReady?: unknown;
  domainStatus?: unknown;
  budget?: unknown;
  timeline?: unknown;
  notes?: unknown;
};

type TelegramSection = {
  title: string;
  fields: Array<{
    label: string;
    value: string;
  }>;
};

function cleanString(value: unknown, maxLength = 4000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function requiredString(
  value: unknown,
  fieldName: string,
  maxLength = 4000,
) {
  const cleaned = cleanString(value, maxLength);

  if (!cleaned) {
    throw new Error(`${fieldName} is required.`);
  }

  return cleaned;
}

function cleanFeatures(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 150)
    .map((item) => item.slice(0, 220));
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function telegramValue(value: string) {
  const cleaned = value.trim();

  if (!cleaned) {
    return "";
  }

  return cleaned;
}

function createTelegramSections(
  requestId: string,
  productName: string,
  category: string,
  values: {
    fullName: string;
    projectName: string;
    email: string;
    contactNumber: string;
    preferredContact: string;

    projectContext: string;
    projectType: string;
    businessLocation: string;
    businessAge: string;
    staffCount: string;
    locationCount: string;
    currentLink: string;
    existingWebsite: string;
    offerings: string;

    userTypes: string;
    userAccounts: string;
    selfManage: string;
    accessModel: string;
    adminRequirements: string;
    deviceRequirements: string;

    userActions: string;
    currentProcess: string;
    mainProblems: string;
    mainGoal: string;

    selectedFeatures: string[];

    dataManagement: string;
    recurringChanges: string;
    usageRules: string;
    resultsReporting: string;

    expectedVolume: string;
    adminAccess: string;
    sellOnline: string;
    onlinePayments: string;
    paymentMethods: string;
    deliveryNeeds: string;
    integrationNeeded: string;
    integrations: string;
    uncertaintyNotes: string;

    logoReady: string;
    brandingReady: string;
    contentReady: string;
    domainStatus: string;

    budget: string;
    timeline: string;
    notes: string;
  },
): TelegramSection[] {
  const features =
    values.selectedFeatures.length > 0
      ? values.selectedFeatures.map((feature) => `✓ ${feature}`).join("\n")
      : "";

  return [
    {
      title: "REQUEST",
      fields: [
        { label: "Request ID", value: requestId },
        { label: "Service", value: productName },
        { label: "Category", value: category },
      ],
    },

    {
      title: "CONTACT DETAILS",
      fields: [
        { label: "Name", value: values.fullName },
        {
          label: "Project / Business / Organization",
          value: values.projectName,
        },
        { label: "Email", value: values.email },
        { label: "Contact", value: values.contactNumber },
        {
          label: "Preferred Contact",
          value: values.preferredContact,
        },
      ],
    },

    {
      title: "PROJECT TYPE & PURPOSE",
      fields: [
        {
          label: "Project Context",
          value: values.projectContext,
        },
        {
          label: "Project Type",
          value: values.projectType,
        },
        {
          label: "Location / Audience",
          value: values.businessLocation,
        },
        {
          label: "Project Stage",
          value: values.businessAge,
        },
        {
          label: "People Managing Project",
          value: values.staffCount,
        },
        {
          label: "Locations / Groups / Branches",
          value: values.locationCount,
        },
        {
          label: "Existing Link",
          value: values.currentLink,
        },
        {
          label: "Existing Website / System",
          value: values.existingWebsite,
        },
        {
          label: "Project Description / Purpose",
          value: values.offerings,
        },
      ],
    },

    {
      title: "USERS & ACCESS",
      fields: [
        {
          label: "Who Will Use It",
          value: values.userTypes,
        },
        {
          label: "User Accounts",
          value: values.userAccounts,
        },
        {
          label: "Self Management",
          value: values.selfManage,
        },
        {
          label: "Account / Access Setup",
          value: values.accessModel,
        },
        {
          label: "Admin Requirements",
          value: values.adminRequirements,
        },
        {
          label: "Device Requirements",
          value: values.deviceRequirements,
        },
      ],
    },

    {
      title: "WORKFLOW & MAIN FUNCTIONS",
      fields: [
        {
          label: "What Users Should Be Able To Do",
          value: values.userActions,
        },
        {
          label: "Current Process",
          value: values.currentProcess,
        },
        {
          label: "Problems / Needs",
          value: values.mainProblems,
        },
        {
          label: "Main Goal",
          value: values.mainGoal,
        },
      ],
    },

    {
      title: "SELECTED FEATURES",
      fields: [
        {
          label: "Features",
          value: features,
        },
      ],
    },

    {
      title: "DATA, CONTENT & RULES",
      fields: [
        {
          label: "Data / Content Management",
          value: values.dataManagement,
        },
        {
          label: "Recurring Changes",
          value: values.recurringChanges,
        },
        {
          label: "Rules / Permissions / Limits",
          value: values.usageRules,
        },
        {
          label: "Results / Reports / Tracking",
          value: values.resultsReporting,
        },
      ],
    },

    {
      title: "VOLUME, MANAGEMENT & INTEGRATIONS",
      fields: [
        {
          label: "Expected Users / Activity",
          value: values.expectedVolume,
        },
        {
          label: "Admin / Editor Access",
          value: values.adminAccess,
        },
        {
          label: "Selling Online",
          value: values.sellOnline,
        },
        {
          label: "Online Payments",
          value: values.onlinePayments,
        },
        {
          label: "Payment Methods",
          value: values.paymentMethods,
        },
        {
          label: "Delivery / Fulfillment",
          value: values.deliveryNeeds,
        },
        {
          label: "Integration Needed",
          value: values.integrationNeeded,
        },
        {
          label: "Integrations / Tools",
          value: values.integrations,
        },
        {
          label: "Technical Uncertainties",
          value: values.uncertaintyNotes,
        },
      ],
    },

    {
      title: "BRANDING & DESIGN",
      fields: [
        {
          label: "Logo",
          value: values.logoReady,
        },
        {
          label: "Colors / Visual Style",
          value: values.brandingReady,
        },
        {
          label: "Content / Materials",
          value: values.contentReady,
        },
        {
          label: "Domain",
          value: values.domainStatus,
        },
      ],
    },

    {
      title: "BUDGET & TIMELINE",
      fields: [
        {
          label: "Budget",
          value: values.budget,
        },
        {
          label: "Timeline",
          value: values.timeline,
        },
      ],
    },

    {
      title: "ADDITIONAL NOTES",
      fields: [
        {
          label: "Notes",
          value: values.notes,
        },
      ],
    },
  ];
}

function buildTelegramText(
  requestId: string,
  sections: TelegramSection[],
) {
  const lines: string[] = [
    "♡ NEW TCL QUOTATION REQUEST",
    `Request ID: ${requestId}`,
    "",
  ];

  for (const section of sections) {
    const completedFields = section.fields
      .map((field) => ({
        label: field.label,
        value: telegramValue(field.value),
      }))
      .filter((field) => field.value);

    if (completedFields.length === 0) {
      continue;
    }

    lines.push(`━━ ${section.title} ━━`);

    for (const field of completedFields) {
      lines.push(`${field.label}:`);
      lines.push(field.value);
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}

function splitTelegramMessage(
  message: string,
  maxLength = 3500,
) {
  if (message.length <= maxLength) {
    return [message];
  }

  const lines = message.split("\n");
  const chunks: string[] = [];

  let current = "";

  for (const originalLine of lines) {
    let line = originalLine;

    while (line.length > maxLength) {
      if (current.trim()) {
        chunks.push(current.trim());
        current = "";
      }

      chunks.push(line.slice(0, maxLength));
      line = line.slice(maxLength);
    }

    const candidate = current
      ? `${current}\n${line}`
      : line;

    if (candidate.length > maxLength) {
      if (current.trim()) {
        chunks.push(current.trim());
      }

      current = line;
    } else {
      current = candidate;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

async function sendTelegramQuotation(
  requestId: string,
  message: string,
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn(
      "Telegram quotation notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.",
    );

    return false;
  }

  const chunks = splitTelegramMessage(message);

  for (let index = 0; index < chunks.length; index += 1) {
    const prefix =
      chunks.length > 1
        ? `TCL QUOTATION — ${index + 1}/${chunks.length}\nRequest: ${requestId}\n\n`
        : "";

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: `${prefix}${chunks[index]}`,
          disable_web_page_preview: true,
        }),
      },
    );

    if (!response.ok) {
      const responseText = await response.text();

      console.error(
        "Telegram quotation notification failed:",
        response.status,
        responseText,
      );

      return false;
    }
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuotePayload;

    const productSlug = requiredString(
      body.productSlug,
      "Product",
      200,
    );

    const supabase = getAdminClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        "slug,name,category,price,sale_price,product_type,is_active",
      )
      .eq("slug", productSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (productError) {
      console.error(
        "Quotation product lookup failed:",
        productError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify this service right now.",
        },
        { status: 500 },
      );
    }

    if (!product) {
      return NextResponse.json(
        {
          error: "This service could not be found.",
        },
        { status: 404 },
      );
    }

    const effectivePrice = Number(
      product.sale_price ?? product.price ?? 0,
    );

    const isQuotationOnly =
      product.product_type === "SERVICE" &&
      Number.isFinite(effectivePrice) &&
      effectivePrice === 0;

    if (!isQuotationOnly) {
      return NextResponse.json(
        {
          error:
            "This product does not use quotation requests.",
        },
        { status: 400 },
      );
    }

    const fullName = requiredString(
      body.fullName,
      "Full name",
      200,
    );

    const projectName = requiredString(
      body.businessName,
      "Project / business / organization name",
      200,
    );

    const email = requiredString(
      body.email,
      "Email",
      320,
    );

    const contactNumber = requiredString(
      body.contactNumber,
      "Contact number",
      200,
    );

    const projectType = requiredString(
      body.businessType,
      "Project type",
      300,
    );

    const offerings = requiredString(
      body.offerings,
      "Project purpose / content",
    );

    const userActions = requiredString(
      body.visitorActions,
      "What users should be able to do",
    );

    const mainProblems = requiredString(
      body.mainProblems,
      "Project needs",
    );

    const mainGoal = requiredString(
      body.mainGoal,
      "Project goal",
    );

    const budget = requiredString(
      body.budget,
      "Budget",
      200,
    );

    const timeline = requiredString(
      body.timeline,
      "Timeline",
      200,
    );

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        { status: 400 },
      );
    }

    const selectedFeatures = cleanFeatures(
      body.selectedFeatures,
    );

    // Each quotation request gets a private, persistent client link.
    // This lets the customer return later and see the quotation after TCL
    // updates its status, scope, pricing, or payment terms.
    const secureToken = randomUUID();

    const preferredContact = cleanString(
      body.preferredContact,
      100,
    );

    const projectContext = cleanString(
      body.projectContext,
      200,
    );

    const businessLocation = cleanString(
      body.businessLocation,
      300,
    );

    const businessAge = cleanString(
      body.businessAge,
      150,
    );

    const staffCount = cleanString(
      body.staffCount,
      150,
    );

    const locationCount = cleanString(
      body.locationCount,
      150,
    );

    const currentLink = cleanString(
      body.currentLink,
      1000,
    );

    const existingWebsite = cleanString(
      body.existingWebsite,
      200,
    );

    const userTypes = cleanString(
      body.userTypes,
      1200,
    );

    const accessModel = cleanString(
      body.accessModel,
      1200,
    );

    const adminRequirements = cleanString(
      body.adminRequirements,
    );

    const deviceRequirements = cleanString(
      body.deviceRequirements,
      1000,
    );

    const selfManage = cleanString(
      body.selfManage,
      300,
    );

    const userAccounts = cleanString(
      body.userAccounts,
      300,
    );

    const sellOnline = cleanString(
      body.sellOnline,
      300,
    );

    const onlinePayments = cleanString(
      body.onlinePayments,
      200,
    );

    const integrationNeeded = cleanString(
      body.integrationNeeded,
      200,
    );

    const uncertaintyNotes = cleanString(
      body.uncertaintyNotes,
    );

    const currentProcess = cleanString(
      body.currentProcess,
    );

    const expectedVolume = cleanString(
      body.expectedVolume,
      500,
    );

    const paymentMethods = cleanString(
      body.paymentMethods,
      500,
    );

    const deliveryNeeds = cleanString(
      body.deliveryNeeds,
      1000,
    );

    const adminAccess = cleanString(
      body.adminAccess,
      1200,
    );

    const integrations = cleanString(
      body.integrations,
    );

    const dataManagement = cleanString(
      body.dataManagement,
    );

    const recurringChanges = cleanString(
      body.recurringChanges,
    );

    const usageRules = cleanString(
      body.usageRules,
    );

    const resultsReporting = cleanString(
      body.resultsReporting,
    );

    const logoReady = cleanString(
      body.logoReady,
      100,
    );

    const brandingReady = cleanString(
      body.brandingReady,
      100,
    );

    const contentReady = cleanString(
      body.contentReady,
      100,
    );

    const domainStatus = cleanString(
      body.domainStatus,
      200,
    );

    const notes = cleanString(body.notes);

    const { data: savedRequest, error: insertError } =
      await supabase
        .from("quotation_requests")
        .insert({
          product_slug: product.slug,
          product_name: product.name,
          category: product.category,
          secure_token: secureToken,

          full_name: fullName,
          business_name: projectName,
          email,
          contact_number: contactNumber,
          preferred_contact: preferredContact,

          project_context: projectContext,
          business_type: projectType,
          business_location: businessLocation,
          business_age: businessAge,
          staff_count: staffCount,
          location_count: locationCount,
          current_link: currentLink,
          existing_website: existingWebsite,

          user_types: userTypes,
          access_model: accessModel,
          admin_requirements: adminRequirements,
          device_requirements: deviceRequirements,

          visitor_actions: userActions,
          self_manage: selfManage,
          user_accounts: userAccounts,
          sell_online: sellOnline,
          online_payments: onlinePayments,
          integration_needed: integrationNeeded,
          uncertainty_notes: uncertaintyNotes,

          offerings,
          current_process: currentProcess,
          main_problems: mainProblems,
          selected_features: selectedFeatures,
          main_goal: mainGoal,
          expected_volume: expectedVolume,
          payment_methods: paymentMethods,
          delivery_needs: deliveryNeeds,
          admin_access: adminAccess,
          integrations,

          data_management: dataManagement,
          recurring_changes: recurringChanges,
          usage_rules: usageRules,
          results_reporting: resultsReporting,

          logo_ready: logoReady,
          branding_ready: brandingReady,
          content_ready: contentReady,
          domain_status: domainStatus,

          budget,
          timeline,
          notes,
          status: "NEW",
        })
        .select("id,secure_token")
        .single();

    if (insertError) {
      console.error(
        "Quotation request insert failed:",
        insertError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to save your quotation request.",
        },
        { status: 500 },
      );
    }

    const requestId = String(savedRequest.id);

    const telegramSections = createTelegramSections(
      requestId,
      product.name,
      product.category,
      {
        fullName,
        projectName,
        email,
        contactNumber,
        preferredContact,

        projectContext,
        projectType,
        businessLocation,
        businessAge,
        staffCount,
        locationCount,
        currentLink,
        existingWebsite,
        offerings,

        userTypes,
        userAccounts,
        selfManage,
        accessModel,
        adminRequirements,
        deviceRequirements,

        userActions,
        currentProcess,
        mainProblems,
        mainGoal,

        selectedFeatures,

        dataManagement,
        recurringChanges,
        usageRules,
        resultsReporting,

        expectedVolume,
        adminAccess,
        sellOnline,
        onlinePayments,
        paymentMethods,
        deliveryNeeds,
        integrationNeeded,
        integrations,
        uncertaintyNotes,

        logoReady,
        brandingReady,
        contentReady,
        domainStatus,

        budget,
        timeline,
        notes,
      },
    );

    const telegramMessage = buildTelegramText(
      requestId,
      telegramSections,
    );

    try {
      await sendTelegramQuotation(
        requestId,
        telegramMessage,
      );
    } catch (telegramError) {
      console.error(
        "Telegram quotation notification error:",
        telegramError,
      );
    }

    return NextResponse.json({
      success: true,
      requestId,
      secureToken: savedRequest.secure_token,
    });
  } catch (error) {
    console.error(
      "Quotation request error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit your quotation request.",
      },
      { status: 400 },
    );
  }
}