/* ---------------------------------------------------------------------------
   The industry catalogue.

   Everything the console can be tailored with lives here: the industries we
   serve, the systems each of them actually runs on, the decisions each of them
   actually makes, and the regulatory ground each of them stands on.

   This module is the single source of truth for both halves of the feature —
   the configurator the visitor fills in, and the /admin page that reads back
   what they chose. It is deliberately data only: no React, no WebGL, no
   database. That is what lets a server component summarise a saved lead with
   the same table the browser used to build the simulation.
--------------------------------------------------------------------------- */

/// One connected system a visitor can put on the board.
export type SourceOption = {
  id: string;
  label: string;
  /// The second line under the node caption — what the system contributes.
  sub: string;
  /// Pre-ticked when the industry is chosen.
  preselected?: boolean;
};

/// One decision the substrate can be shown working. The four narrative fields
/// are what the case board and the decision ledger render verbatim.
export type UseCaseOption = {
  id: string;
  /// Short name, for the picker.
  label: string;
  /// Full name, for the case board.
  title: string;
  trigger: string;
  decision: string;
  impact: string;
  /// Skills the agent council checks out. Must exist on an agent in
  /// `substrate/cases.ts`, or the case will never light anything up.
  skills: string[];
  preselected?: boolean;
};

export type Industry = {
  id: string;
  label: string;
  /// One line, shown under the industry picker.
  blurb: string;
  segments: { id: string; label: string }[];
  sources: SourceOption[];
  useCases: UseCaseOption[];
  /// Renames the four council agents, keyed by agent id, so the council speaks
  /// the visitor's language rather than ours.
  agents: Record<string, string>;
  /// What "Inject disruption" throws at the board when the visitor has not
  /// named a pain of their own.
  disruption: Omit<UseCaseOption, "id" | "label" | "preselected">;
};

/* -------------------------------------------------------------------------- */
/* Insurance                                                                  */
/* -------------------------------------------------------------------------- */

const INSURANCE: Industry = {
  id: "insurance",
  label: "Insurance",
  blurb: "Underwriting, claims and reserving across a book you cannot see whole.",
  segments: [
    { id: "pc", label: "P&C / general insurance" },
    { id: "life", label: "Life & annuities" },
    { id: "health", label: "Health & medical" },
    { id: "commercial", label: "Commercial & specialty" },
    { id: "reinsurance", label: "Reinsurance" },
    { id: "broking", label: "Broking & MGA" },
  ],
  sources: [
    { id: "pas", label: "Policy administration", sub: "policies · endorsements", preselected: true },
    { id: "claims", label: "Claims & FNOL", sub: "notices · reserves", preselected: true },
    { id: "docs", label: "Adjuster documents", sub: "photos · reports · email", preselected: true },
    { id: "telematics", label: "Telematics & IoT", sub: "driving · property sensors", preselected: true },
    { id: "bureau", label: "Bureau & rating data", sub: "ISO · circulars", preselected: true },
    { id: "ledger", label: "Finance & general ledger", sub: "premium · reserves", preselected: true },
    { id: "broker", label: "Broker & bordereaux feeds", sub: "slips · schedules" },
    { id: "medical", label: "Medical & clinical records", sub: "bills · codes" },
    { id: "fraud", label: "Fraud consortium lists", sub: "watchlists · SIU" },
    { id: "treaty", label: "Reinsurance treaties", sub: "cessions · recoveries" },
  ],
  useCases: [
    {
      id: "fnol-severity",
      label: "Claim severity mis-scored",
      title: "FNOL severity mis-scored — motor",
      trigger: "First-notice photos contradict the adjuster's opening reserve",
      decision: "Re-reserve to $84K and route to a total-loss adjuster",
      impact: "$310K reserve leakage prevented · 9 days off cycle time",
      skills: ["detect", "retrieve", "simulate", "explain"],
      preselected: true,
    },
    {
      id: "fraud-ring",
      label: "Organised claim rings",
      title: "Organised claim ring — three postcodes",
      trigger: "Nine claims share a repair shop, a clinic and two phone numbers",
      decision: "Refer the cluster to SIU and hold payment on all nine",
      impact: "$1.4M fraudulent payout blocked · evidence pack cited",
      skills: ["correlate", "retrieve", "cite", "weigh"],
      preselected: true,
    },
    {
      id: "subrogation",
      label: "Missed subrogation",
      title: "Missed subrogation — commercial property",
      trigger: "Third-party liability sits in the loss report and was never pursued",
      decision: "Open subrogation and serve the carrier inside the statute",
      impact: "$680K recoverable identified · 21 days before time-bar",
      skills: ["detect", "retrieve", "bound", "cite"],
      preselected: true,
    },
    {
      id: "underwriting-drift",
      label: "Underwriting appetite drift",
      title: "Underwriting drift — coastal property",
      trigger: "Bound risk exceeds the cat model's wind exposure appetite",
      decision: "Re-price at +18% or decline, and refer to treaty",
      impact: "$2.6M PML exposure trimmed · appetite restored",
      skills: ["correlate", "simulate", "bound", "weigh"],
      preselected: true,
    },
    {
      id: "medical-leakage",
      label: "Medical bill leakage",
      title: "Medical bill leakage — workers' compensation",
      trigger: "Billed codes exceed the fee schedule on 340 lines",
      decision: "Re-price to schedule and flag the provider for review",
      impact: "$920K indemnity leakage stopped",
      skills: ["detect", "retrieve", "bound", "cite"],
    },
    {
      id: "renewal-churn",
      label: "Renewal churn risk",
      title: "Renewal churn risk — mid-market book",
      trigger: "Service complaints and a 14% rate rise land on the same accounts",
      decision: "Hold the rate on 62 accounts and uplift the remainder",
      impact: "$4.1M premium retained · loss ratio held at 61%",
      skills: ["correlate", "simulate", "weigh", "explain"],
    },
    {
      id: "cat-response",
      label: "Catastrophe response",
      title: "Catastrophe response — hail swath",
      trigger: "The storm track crosses 1,900 in-force property policies",
      decision: "Pre-position adjusters and auto-advance 40% of payments",
      impact: "11 days faster settlement · $2.2M loss adjustment expense avoided",
      skills: ["detect", "correlate", "simulate", "explain"],
    },
    {
      id: "treaty-recovery",
      label: "Reinsurance recovery",
      title: "Reinsurance recovery not filed",
      trigger: "Two large losses breach the excess-of-loss attachment, unceded",
      decision: "Cede both losses and file the recovery this quarter",
      impact: "$3.3M recovery filed · cession error corrected",
      skills: ["retrieve", "cite", "bound", "weigh"],
    },
  ],
  agents: {
    observer: "Exposure Observer",
    evidence: "Claims Evidence Navigator",
    guardian: "Reserve Guardian",
    orchestr: "Underwriting Orchestrator",
  },
  disruption: {
    title: "Catastrophe declared — coastal landfall",
    trigger: "Operator-injected catastrophe across four states",
    decision: "Surge 240 adjusters and auto-advance tier-1 payments",
    impact: "$18M exposure triaged in 6 hours · 71% of service levels held",
    skills: ["detect", "correlate", "retrieve", "simulate", "weigh", "explain"],
  },
};

/* -------------------------------------------------------------------------- */
/* Banking                                                                    */
/* -------------------------------------------------------------------------- */

const BANKING: Industry = {
  id: "banking",
  label: "Banking",
  blurb: "Payments, credit and financial crime, decided against a moving balance sheet.",
  segments: [
    { id: "retail", label: "Retail & digital banking" },
    { id: "commercial", label: "Commercial & corporate" },
    { id: "wealth", label: "Wealth & private banking" },
    { id: "payments", label: "Payments & cards" },
    { id: "markets", label: "Capital markets" },
    { id: "treasury", label: "Treasury & ALM" },
  ],
  sources: [
    { id: "core", label: "Core banking", sub: "accounts · balances", preselected: true },
    { id: "payments", label: "Payment rails", sub: "SWIFT · ACH · instant", preselected: true },
    { id: "cards", label: "Card processor", sub: "authorisations · disputes", preselected: true },
    { id: "kyc", label: "KYC & customer due diligence", sub: "identity · beneficial owners", preselected: true },
    { id: "sanctions", label: "Sanctions & PEP lists", sub: "watchlists · screening", preselected: true },
    { id: "warehouse", label: "Data warehouse", sub: "general ledger · risk marts", preselected: true },
    { id: "crm", label: "Relationship CRM", sub: "relationships · cases" },
    { id: "credit", label: "Credit bureau feeds", sub: "scores · exposures" },
    { id: "docs", label: "Loan document vault", sub: "agreements · covenants" },
    { id: "treasury", label: "Treasury & ALM", sub: "liquidity · rates" },
  ],
  useCases: [
    {
      id: "aml-alerts",
      label: "AML alert storm",
      title: "AML alert storm — one corridor",
      trigger: "1,240 alerts on a single corridor, 96% historically false",
      decision: "Suppress 1,100 with written rationale, escalate 38 to level two",
      impact: "$2.1M investigation cost avoided · SAR quality up 31%",
      skills: ["correlate", "retrieve", "bound", "explain"],
      preselected: true,
    },
    {
      id: "app-fraud",
      label: "Push payment fraud",
      title: "Authorised push payment fraud",
      trigger: "Beneficiary account is new, mule-linked, and the amount is 12× baseline",
      decision: "Hold the payment and step up with the customer",
      impact: "$740K fraud loss prevented · 0.3% false positive rate",
      skills: ["detect", "correlate", "simulate", "weigh"],
      preselected: true,
    },
    {
      id: "covenant-breach",
      label: "Covenant early warning",
      title: "Covenant breach — mid-corporate",
      trigger: "Leverage at 4.2× against a 3.5× covenant, two quarters running",
      decision: "Downgrade to watchlist and reprice at renewal",
      impact: "$18M exposure re-rated · two quarters of early warning",
      skills: ["retrieve", "cite", "simulate", "weigh"],
      preselected: true,
    },
    {
      id: "disputes",
      label: "Card dispute backlog",
      title: "Card dispute backlog — 220 claims",
      trigger: "Merchant evidence contradicts the chargeback claims on file",
      decision: "Auto-resolve 160 and represent 60 with cited evidence",
      impact: "$310K of write-offs avoided · 6 days down to 9 hours",
      skills: ["retrieve", "cite", "bound", "explain"],
      preselected: true,
    },
    {
      id: "liquidity",
      label: "Intraday liquidity",
      title: "Intraday liquidity squeeze",
      trigger: "The nostro buffer is projected to breach by 14:00",
      decision: "Pull forward two repos and delay three low-priority settlements",
      impact: "Buffer held · $46M of idle cash released",
      skills: ["detect", "simulate", "bound", "weigh"],
    },
    {
      id: "reporting-break",
      label: "Regulatory report break",
      title: "Regulatory report break — risk vs. ledger",
      trigger: "The risk mart and the general ledger disagree by $9.2M on one book",
      decision: "Trace the lineage, correct at source, and refile once",
      impact: "Restatement avoided · lineage evidence sealed",
      skills: ["correlate", "retrieve", "cite", "explain"],
    },
    {
      id: "kyc-refresh",
      label: "Ownership change",
      title: "KYC refresh — beneficial owner change",
      trigger: "A registry filing shows a new ultimate beneficial owner",
      decision: "Trigger enhanced due diligence and freeze new limits",
      impact: "Sanctions exposure closed in 4 hours",
      skills: ["detect", "retrieve", "cite", "bound"],
    },
    {
      id: "deposit-flight",
      label: "Deposit flight risk",
      title: "Deposit flight risk — affluent segment",
      trigger: "Rate-sensitive balances are moving to a competitor's offer",
      decision: "Targeted retention pricing across 3,400 relationships",
      impact: "$210M of deposits retained · 11bps of margin cost",
      skills: ["correlate", "simulate", "weigh", "explain"],
    },
  ],
  agents: {
    observer: "Transaction Observer",
    evidence: "Lineage & Evidence Navigator",
    guardian: "Capital Guardian",
    orchestr: "Risk Orchestrator",
  },
  disruption: {
    title: "Correspondent bank outage",
    trigger: "Operator-injected outage across two payment corridors",
    decision: "Reroute via the secondary correspondent, sequenced by value date",
    impact: "$92M in flight rerouted · settlement window held",
    skills: ["detect", "correlate", "retrieve", "simulate", "weigh", "explain"],
  },
};

/* -------------------------------------------------------------------------- */
/* Non-banking finance                                                        */
/* -------------------------------------------------------------------------- */

const NBFC: Industry = {
  id: "nbfc",
  label: "Non-banking finance",
  blurb: "Lending decisions on thin files, and a collections book that moves daily.",
  segments: [
    { id: "consumer", label: "Consumer lending" },
    { id: "sme", label: "SME & equipment finance" },
    { id: "auto", label: "Auto & vehicle finance" },
    { id: "housing", label: "Housing finance" },
    { id: "micro", label: "Microfinance" },
    { id: "bnpl", label: "BNPL & embedded credit" },
    { id: "leasing", label: "Leasing & asset finance" },
  ],
  sources: [
    { id: "los", label: "Loan origination", sub: "applications · offers", preselected: true },
    { id: "lms", label: "Loan management", sub: "schedules · arrears", preselected: true },
    { id: "bureau", label: "Credit bureau", sub: "scores · enquiries", preselected: true },
    { id: "banking", label: "Bank statement feeds", sub: "cash flow · balances", preselected: true },
    { id: "collections", label: "Collections platform", sub: "promises · field visits", preselected: true },
    { id: "mandates", label: "Repayment rails", sub: "mandates · bounces", preselected: true },
    { id: "dealers", label: "Dealer & partner network", sub: "sourcing · subvention" },
    { id: "alt", label: "Alternative data", sub: "device · telco · tax filings" },
    { id: "collateral", label: "Collateral registry", sub: "valuations · liens" },
    { id: "treasury", label: "Borrowing & ALM", sub: "cost of funds · gaps" },
  ],
  useCases: [
    {
      id: "thin-file",
      label: "Thin-file underwriting",
      title: "Thin-file applicant — SME term loan",
      trigger: "No bureau depth, but 26 months of tax filings and bank flow",
      decision: "Approve at $410K on a 9-month step-up structure",
      impact: "Book grown 12% at a constant loss rate",
      skills: ["retrieve", "correlate", "simulate", "explain"],
      preselected: true,
    },
    {
      id: "early-delinquency",
      label: "Early delinquency signal",
      title: "Early delinquency signal — auto book",
      trigger: "Mandate bounces cluster inside one dealer's sourcing",
      decision: "Pause subvention and re-underwrite the cohort",
      impact: "$3.4M of expected credit loss avoided",
      skills: ["detect", "correlate", "bound", "weigh"],
      preselected: true,
    },
    {
      id: "collections-priority",
      label: "Collections prioritisation",
      title: "Collections capacity misallocated",
      trigger: "40% of field visits are going to self-curing accounts",
      decision: "Digital nudge 6,100 accounts and field only the top 900",
      impact: "Roll rate down 180bps · cost to collect down 26%",
      skills: ["simulate", "weigh", "bound", "explain"],
      preselected: true,
    },
    {
      id: "sourcing-fraud",
      label: "Channel sourcing fraud",
      title: "Sourcing fraud — one channel partner",
      trigger: "Identical income documents across 31 applications",
      decision: "Suspend the partner and recall the disbursals in process",
      impact: "$820K of fraudulent disbursal blocked",
      skills: ["detect", "correlate", "cite", "weigh"],
      preselected: true,
    },
    {
      id: "ecl-drift",
      label: "Provision drift",
      title: "Expected credit loss provision drift",
      trigger: "Stage-2 migration is outrunning the model's default curve",
      decision: "Recalibrate the curve and restate the provision with evidence",
      impact: "Audit-ready restatement · $2.2M provision corrected",
      skills: ["retrieve", "simulate", "cite", "bound"],
    },
    {
      id: "alm-gap",
      label: "Asset-liability gap",
      title: "Asset-liability gap — 90-day bucket",
      trigger: "Repayments reprice slower than the borrowing book",
      decision: "Shift $22M of borrowing to a longer tenor",
      impact: "Net interest margin protected at 4.1% · gap closed",
      skills: ["detect", "simulate", "bound", "weigh"],
    },
    {
      id: "repossession",
      label: "Repossess or restructure",
      title: "Repossession decision — commercial vehicle",
      trigger: "Four missed instalments, but telematics shows the asset still earning",
      decision: "Restructure rather than repossess, and monitor weekly",
      impact: "$96K recovery uplift against repossession",
      skills: ["retrieve", "simulate", "weigh", "explain"],
    },
    {
      id: "top-up",
      label: "Top-up eligibility",
      title: "Top-up eligibility — housing book",
      trigger: "18,400 customers past 60% amortisation with clean conduct",
      decision: "Pre-approve top-ups inside the loan-to-value envelope",
      impact: "$29M of book expansion at existing risk",
      skills: ["correlate", "bound", "weigh", "explain"],
    },
  ],
  agents: {
    observer: "Portfolio Observer",
    evidence: "Underwriting Evidence Navigator",
    guardian: "Credit Loss Guardian",
    orchestr: "Lending Orchestrator",
  },
  disruption: {
    title: "Funding line pulled — one lender",
    trigger: "Operator-injected withdrawal of a $60M credit line",
    decision: "Re-sequence disbursals and draw on two standby facilities",
    impact: "Disbursal continuity held · 4-day liquidity gap closed",
    skills: ["detect", "correlate", "retrieve", "simulate", "weigh", "explain"],
  },
};

/* -------------------------------------------------------------------------- */
/* Oil & gas                                                                  */
/* -------------------------------------------------------------------------- */

const OIL_GAS: Industry = {
  id: "oil-gas",
  label: "Oil & gas — procurement & supply",
  blurb:
    "One late valve holds a turnaround, and a held turnaround costs more than the valve ever will.",
  segments: [
    { id: "upstream", label: "Upstream exploration & production" },
    { id: "offshore", label: "Offshore drilling" },
    { id: "midstream", label: "Midstream & pipelines" },
    { id: "downstream", label: "Downstream refining" },
    { id: "lng", label: "LNG & gas processing" },
    { id: "petrochem", label: "Petrochemicals" },
    { id: "services", label: "Oilfield services" },
  ],
  sources: [
    { id: "erp", label: "ERP — materials & maintenance", sub: "purchase orders · reservations", preselected: true },
    { id: "eam", label: "Asset management", sub: "work orders · bills of material", preselected: true },
    { id: "supplier", label: "Supplier & vendor portal", sub: "acknowledgements · shipping notices", preselected: true },
    { id: "expediting", label: "Expediting & inspection", sub: "inspection plans · release notes", preselected: true },
    { id: "logistics", label: "Freight & marine logistics", sub: "vessels · charters · customs", preselected: true },
    { id: "contracts", label: "Contract repository", sub: "master agreements · incoterms", preselected: true },
    { id: "warehouse", label: "Warehouse & yard", sub: "bin stock · consignment" },
    { id: "historian", label: "SCADA & historian", sub: "equipment · run hours" },
    { id: "qaqc", label: "QA/QC & certification", sub: "material certs · non-destructive testing" },
    { id: "planning", label: "Drilling & turnaround plan", sub: "well programme · shutdown windows" },
  ],
  useCases: [
    {
      id: "long-lead-valve",
      label: "Long-lead item slips",
      title: "Long-lead valve slips the turnaround window",
      trigger: "A 12-week emergency shutdown valve now clears inspection 19 days late",
      decision: "Air-freight from the vendor and re-sequence two work packs",
      impact: "$14M of deferred production avoided · shutdown window held",
      skills: ["detect", "retrieve", "simulate", "explain"],
      preselected: true,
    },
    {
      id: "single-source",
      label: "Single-source exposure",
      title: "Single-source exposure — subsea connectors",
      trigger: "One qualified vendor holds 68% of the critical spares list",
      decision: "Qualify a second source and pre-buy 90 days of cover",
      impact: "$31M of outage exposure halved · 6 weeks off lead time",
      skills: ["correlate", "retrieve", "bound", "weigh"],
      preselected: true,
    },
    {
      id: "stranded-spares",
      label: "Stranded critical spares",
      title: "Critical spares stranded across three yards",
      trigger: "The part a rig is waiting on is already sitting in another yard",
      decision: "Transfer 14 items internally and cancel the emergency order",
      impact: "$2.7M of working capital released · 11 days saved",
      skills: ["correlate", "retrieve", "weigh", "bound"],
      preselected: true,
    },
    {
      id: "cert-mismatch",
      label: "Material cert mismatch",
      title: "Material certificate mismatch at the gate",
      trigger: "Heat numbers on the mill certificate do not match the delivered spools",
      decision: "Quarantine the shipment and raise the vendor non-conformance",
      impact: "Non-conforming material stopped before weld-out",
      skills: ["detect", "cite", "bound", "retrieve"],
      preselected: true,
    },
    {
      id: "demurrage",
      label: "Demurrage exposure",
      title: "Demurrage risk — offshore supply vessel",
      trigger: "Berth congestion pushes discharge 31 hours past laytime",
      decision: "Swap the discharge order and split the backload",
      impact: "$420K of demurrage avoided · rig call kept",
      skills: ["simulate", "bound", "weigh", "explain"],
    },
    {
      id: "ld-claim",
      label: "Liquidated damages",
      title: "Liquidated damages exposure — EPC package",
      trigger: "Vendor slippage crosses the contract's damages threshold",
      decision: "Serve notice under clause 22.4 and hold 8% retention",
      impact: "$5.6M claim secured · dispute pack assembled",
      skills: ["retrieve", "cite", "bound", "explain"],
    },
    {
      id: "customs-hold",
      label: "Customs clearance hold",
      title: "Customs hold — imported rotating equipment",
      trigger: "Tariff code and country of origin conflict on the packing list",
      decision: "Refile with corrected origin and escalate to the broker",
      impact: "9 days of clearance delay avoided · $1.1M of idle crew cost",
      skills: ["detect", "retrieve", "cite", "weigh"],
    },
    {
      id: "scope-growth",
      label: "Turnaround scope growth",
      title: "Turnaround scope growth — 14 late work packs",
      trigger: "Inspection findings add scope inside a frozen window",
      decision: "Defer six packs to the next window with an engineering case",
      impact: "Shutdown held to 21 days · $22M deferral avoided",
      skills: ["correlate", "simulate", "weigh", "explain"],
    },
    {
      id: "price-spike",
      label: "Price spike vs. contract",
      title: "Line-pipe price spike against the frame agreement",
      trigger: "Spot steel is 27% over the frame agreement on four call-offs",
      decision: "Trigger the price hold and call off early against the frame",
      impact: "$3.9M of procurement variance protected",
      skills: ["detect", "bound", "weigh", "cite"],
    },
  ],
  agents: {
    observer: "Supply Signal Observer",
    evidence: "Expediting Evidence Navigator",
    guardian: "Production Risk Guardian",
    orchestr: "Turnaround Orchestrator",
  },
  disruption: {
    title: "Strait closure — tanker corridor",
    trigger: "Operator-injected closure across two shipping lanes",
    decision: "Re-route two cargoes and air-lift the critical spares list",
    impact: "$64M of production exposure contained · 71% of commitments held",
    skills: ["detect", "correlate", "retrieve", "simulate", "weigh", "explain"],
  },
};

/* -------------------------------------------------------------------------- */
/* Industrial manufacturing                                                   */
/* -------------------------------------------------------------------------- */

const INDUSTRIAL: Industry = {
  id: "industrial",
  label: "Industrial manufacturing",
  blurb: "Yield, uptime and delivery promises, argued from the shop floor upwards.",
  segments: [
    { id: "discrete", label: "Discrete manufacturing" },
    { id: "process", label: "Process manufacturing" },
    { id: "automotive", label: "Automotive & tier suppliers" },
    { id: "aerospace", label: "Aerospace & defence" },
    { id: "heavy", label: "Heavy equipment" },
    { id: "chemicals", label: "Chemicals" },
    { id: "pharma", label: "Pharmaceutical manufacturing" },
    { id: "utilities", label: "Utilities & power" },
  ],
  sources: [
    { id: "erp", label: "ERP — production & materials", sub: "orders · bills of material", preselected: true },
    { id: "mes", label: "Manufacturing execution", sub: "work orders · yields", preselected: true },
    { id: "historian", label: "SCADA & historian", sub: "sensors · run hours", preselected: true },
    { id: "qms", label: "Quality management", sub: "non-conformances · corrective actions", preselected: true },
    { id: "cmms", label: "Maintenance management", sub: "assets · downtime", preselected: true },
    { id: "supplier", label: "Supplier EDI", sub: "shipping notices · schedules", preselected: true },
    { id: "plm", label: "PLM & engineering", sub: "revisions · change orders" },
    { id: "warranty", label: "Warranty & field service", sub: "claims · returns" },
    { id: "wms", label: "Warehouse & logistics", sub: "stock · shipments" },
    { id: "energy", label: "Energy & utility meters", sub: "consumption · tariffs" },
  ],
  useCases: [
    {
      id: "yield-drift",
      label: "Yield drift",
      title: "Yield drift — line 4 extrusion",
      trigger: "Scrap is up 3.1 points against an unchanged recipe",
      decision: "Retune two setpoints and hold the lot for re-test",
      impact: "$1.8M of annualised scrap recovered",
      skills: ["detect", "correlate", "simulate", "explain"],
      preselected: true,
    },
    {
      id: "downtime-forecast",
      label: "Unplanned downtime",
      title: "Bearing failure forecast — press 7",
      trigger: "The vibration signature matches two prior failures at 340 hours",
      decision: "Pull maintenance into Sunday's planned window",
      impact: "38 hours of unplanned downtime avoided · $2.4M of output held",
      skills: ["detect", "simulate", "weigh", "cite"],
      preselected: true,
    },
    {
      id: "supplier-quality",
      label: "Supplier quality drift",
      title: "Supplier quality drift — tier-2 castings",
      trigger: "Defect rate tripled across three consecutive lots",
      decision: "Switch to the approved alternate and raise a supplier corrective action",
      impact: "Line stoppage avoided · $760K of containment cost saved",
      skills: ["correlate", "retrieve", "bound", "explain"],
      preselected: true,
    },
    {
      id: "otd-risk",
      label: "Delivery date at risk",
      title: "On-time delivery at risk — key account",
      trigger: "A component shortage lands against a committed launch date",
      decision: "Re-sequence the schedule and expedite two part numbers",
      impact: "Launch date held · $3.2M penalty avoided",
      skills: ["simulate", "weigh", "bound", "explain"],
      preselected: true,
    },
    {
      id: "eco-cutin",
      label: "Engineering change cut-in",
      title: "Engineering change in flight",
      trigger: "Change order 4471 obsoletes stock already committed to 12 orders",
      decision: "Sequence the cut-in and run down six weeks of stock",
      impact: "$1.2M of obsolescence avoided · no delivery slip",
      skills: ["retrieve", "cite", "simulate", "weigh"],
    },
    {
      id: "warranty-cluster",
      label: "Warranty cluster",
      title: "Warranty cluster — one build week",
      trigger: "Field failures trace back to a single torque station's drift",
      decision: "Recall 2,100 units from that window and recalibrate",
      impact: "$5.9M of warranty exposure bounded · recall scoped tightly",
      skills: ["detect", "correlate", "cite", "bound"],
    },
    {
      id: "energy-peak",
      label: "Energy cost spike",
      title: "Energy load landing in the peak tariff band",
      trigger: "Furnace load hits the peak band four days running",
      decision: "Shift two heats into the off-peak window",
      impact: "$640K of annual energy cost removed",
      skills: ["detect", "simulate", "bound", "weigh"],
    },
    {
      id: "capacity-mix",
      label: "Capacity mix",
      title: "Capacity mix misallocated",
      trigger: "High-margin lines are queued behind low-margin volume",
      decision: "Re-plan the sequence around contribution margin",
      impact: "$4.4M of margin recovered at constant capacity",
      skills: ["correlate", "simulate", "weigh", "explain"],
    },
  ],
  agents: {
    observer: "Process Observer",
    evidence: "Traceability Navigator",
    guardian: "Throughput Guardian",
    orchestr: "Operations Orchestrator",
  },
  disruption: {
    title: "Tier-1 supplier fire",
    trigger: "Operator-injected loss of a sole-source component plant",
    decision: "Dual-source two part numbers and allocate to tier-1 accounts",
    impact: "$28M of revenue exposure contained · 71% of commitments held",
    skills: ["detect", "correlate", "retrieve", "simulate", "weigh", "explain"],
  },
};

/* -------------------------------------------------------------------------- */
/* Retail                                                                     */
/* -------------------------------------------------------------------------- */

const RETAIL: Industry = {
  id: "retail",
  label: "Retail",
  blurb: "Availability, price and margin, reconciled across every channel at once.",
  segments: [
    { id: "grocery", label: "Grocery & FMCG" },
    { id: "fashion", label: "Fashion & apparel" },
    { id: "hardline", label: "Electronics & hardline" },
    { id: "pharmacy", label: "Pharmacy & health" },
    { id: "quick", label: "Quick commerce" },
    { id: "marketplace", label: "Marketplace" },
    { id: "convenience", label: "Convenience & fuel retail" },
    { id: "luxury", label: "Luxury" },
  ],
  sources: [
    { id: "pos", label: "POS & store systems", sub: "baskets · footfall", preselected: true },
    { id: "ecom", label: "E-commerce platform", sub: "sessions · orders", preselected: true },
    { id: "inventory", label: "Inventory & RFID", sub: "on-hand · shrink", preselected: true },
    { id: "merch", label: "Merchandising & pricing", sub: "assortment · promotions", preselected: true },
    { id: "supplier", label: "Supplier & vendor EDI", sub: "purchase orders · shipping notices", preselected: true },
    { id: "loyalty", label: "Loyalty & customer data", sub: "members · segments", preselected: true },
    { id: "oms", label: "Order management", sub: "fulfilment · returns" },
    { id: "logistics", label: "Distribution & last mile", sub: "waves · routes" },
    { id: "marketing", label: "Marketing platforms", sub: "spend · attribution" },
    { id: "service", label: "Reviews & service", sub: "tickets · sentiment" },
  ],
  useCases: [
    {
      id: "stockout",
      label: "Stockout risk",
      title: "Stockout risk — top-50 line",
      trigger: "Sell-through is outrunning the replenishment plan in 140 stores",
      decision: "Reallocate from slow stores and expedite one distribution push",
      impact: "$1.9M of sales protected · availability back to 97%",
      skills: ["detect", "simulate", "bound", "weigh"],
      preselected: true,
    },
    {
      id: "promo-cannibalisation",
      label: "Promotion cannibalisation",
      title: "Promotion cannibalising full-price sales",
      trigger: "Uplift on the promoted line, decline across three siblings",
      decision: "Cut the depth to 15% and exclude two regions",
      impact: "$2.4M of gross margin recovered",
      skills: ["correlate", "simulate", "weigh", "explain"],
      preselected: true,
    },
    {
      id: "markdown-timing",
      label: "Markdown timing",
      title: "Markdown timing — end of season",
      trigger: "The sell-through curve says the planned markdown is three weeks early",
      decision: "Delay to week nine and deepen only the tail sizes",
      impact: "$3.1M of margin retained · sell-through held at 88%",
      skills: ["simulate", "bound", "weigh", "explain"],
      preselected: true,
    },
    {
      id: "supplier-fill",
      label: "Supplier fill rate",
      title: "Supplier fill rate collapse before peak",
      trigger: "One vendor's fill rate falls to 71% ahead of peak trading",
      decision: "Trigger the alternate vendor and claim under the service clause",
      impact: "Peak availability held · $940K claim filed",
      skills: ["detect", "cite", "bound", "weigh"],
      preselected: true,
    },
    {
      id: "shrink",
      label: "Shrink cluster",
      title: "Shrink cluster — three stores",
      trigger: "Void patterns and RFID gaps align at one till group",
      decision: "Refer to loss prevention with the full evidence trail",
      impact: "$860K of annualised shrink addressed",
      skills: ["detect", "correlate", "cite", "weigh"],
    },
    {
      id: "returns-abuse",
      label: "Returns abuse",
      title: "Serial returns abuse",
      trigger: "2,300 accounts return above 60% with matching device fingerprints",
      decision: "Restrict free returns on the cluster and keep genuine cases whole",
      impact: "$1.4M of returns cost removed · satisfaction unchanged",
      skills: ["correlate", "retrieve", "cite", "bound"],
    },
    {
      id: "last-mile",
      label: "Last-mile failures",
      title: "Last-mile failure rate — one metro",
      trigger: "Failed first-attempt deliveries up 9 points in two weeks",
      decision: "Reroute to locker fulfilment and re-slot the delivery window",
      impact: "$720K of redelivery cost avoided · satisfaction up 6 points",
      skills: ["detect", "simulate", "weigh", "explain"],
    },
    {
      id: "assortment",
      label: "Assortment mismatch",
      title: "Assortment mismatch — new format stores",
      trigger: "Basket data contradicts the planogram in 62 stores",
      decision: "Localise 140 facings and drop 30 lines",
      impact: "$2.8M like-for-like sales uplift",
      skills: ["correlate", "retrieve", "weigh", "bound"],
    },
  ],
  agents: {
    observer: "Demand Observer",
    evidence: "Basket Evidence Navigator",
    guardian: "Margin Guardian",
    orchestr: "Trading Orchestrator",
  },
  disruption: {
    title: "Peak-week distribution centre outage",
    trigger: "Operator-injected loss of a national distribution centre",
    decision: "Ship from store for 2,900 orders and cap same-day promises",
    impact: "$21M of peak revenue protected · 71% of orders held",
    skills: ["detect", "correlate", "retrieve", "simulate", "weigh", "explain"],
  },
};

/* -------------------------------------------------------------------------- */
/* The catalogue                                                              */
/* -------------------------------------------------------------------------- */

export const INDUSTRIES: Industry[] = [
  INSURANCE,
  BANKING,
  NBFC,
  OIL_GAS,
  INDUSTRIAL,
  RETAIL,
];

/// How busy the field runs, and how loud the ambient traffic is. A regional
/// operator and a global one are not looking at the same picture.
export type ScaleOption = {
  id: string;
  label: string;
  sub: string;
  /// Multiplies the background record rate.
  intensity: number;
};

export const SCALES: ScaleOption[] = [
  { id: "regional", label: "Single region", sub: "one country, under 5,000 staff", intensity: 0.6 },
  { id: "national", label: "National", sub: "one country, multi-site", intensity: 0.85 },
  { id: "multinational", label: "Multinational", sub: "5–25 countries", intensity: 1.15 },
  { id: "global", label: "Global", sub: "25+ countries, follow-the-sun", intensity: 1.5 },
];

/// Where the tenancy runs and which rulebook governs it. Drives the hub's
/// governance caption and the deploy node in the control plane.
export type RegionOption = {
  id: string;
  label: string;
  /// Second line under the Cognitive Data Hub.
  governance: string;
  /// Second line under the Deploy node.
  tenancy: string;
};

export const REGIONS: RegionOption[] = [
  { id: "eu", label: "European Union", governance: "resolve · link · govern · GDPR + EU AI Act", tenancy: "your EU tenancy" },
  { id: "uk", label: "United Kingdom", governance: "resolve · link · govern · UK GDPR + FCA", tenancy: "your UK tenancy" },
  { id: "us", label: "United States", governance: "resolve · link · govern · SOC 2 + state privacy", tenancy: "your US tenancy" },
  { id: "gcc", label: "Middle East (GCC)", governance: "resolve · link · govern · UAE/KSA residency", tenancy: "your in-country tenancy" },
  { id: "india", label: "India", governance: "resolve · link · govern · DPDP Act", tenancy: "your India tenancy" },
  { id: "apac", label: "Asia Pacific", governance: "resolve · link · govern · local residency", tenancy: "your APAC tenancy" },
  { id: "global", label: "Multi-region", governance: "resolve · link · govern · per-region residency", tenancy: "your regional tenancies" },
];

/* -------------------------------------------------------------------------- */
/* Bounds                                                                     */
/* -------------------------------------------------------------------------- */

/// The topology has six source slots. Fewer than three and the ingest side of
/// the picture stops reading as a fan-in.
export const MIN_SOURCES = 3;
export const MAX_SOURCES = 6;

/// Two cases is the fewest that still shows concurrency; past six the rotation
/// repeats too slowly for anyone to notice their own case come round.
export const MIN_USE_CASES = 2;
export const MAX_USE_CASES = 6;

/* -------------------------------------------------------------------------- */
/* Lookups                                                                    */
/* -------------------------------------------------------------------------- */

export const findIndustry = (id: string | null | undefined) =>
  INDUSTRIES.find((i) => i.id === id) ?? null;

export const findScale = (id: string | null | undefined) =>
  SCALES.find((s) => s.id === id) ?? null;

export const findRegion = (id: string | null | undefined) =>
  REGIONS.find((r) => r.id === id) ?? null;

/**
 * The six systems the board runs on before anyone has configured anything.
 *
 * Generic on purpose: this is what a visitor who never opens the console sees
 * behind the headline, so it names the systems every one of our industries has
 * rather than the ones only one of them does.
 */
export const DEFAULT_SOURCES: { label: string; sub: string }[] = [
  { label: "ERP", sub: "orders · deliveries" },
  { label: "CRM", sub: "accounts · cases" },
  { label: "IoT Telemetry", sub: "sensors · scans" },
  { label: "Event Streams", sub: "queues · webhooks" },
  { label: "Document Stores", sub: "contracts · email" },
  { label: "Data Warehouse", sub: "ledger · invoices" },
];
