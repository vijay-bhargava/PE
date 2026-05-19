// Mock data structure for Executive Summary
export const executiveSummaryData = {
  rfqInfo: {
    rfqNumber: "RFQ-2024-001",
    title: "Office Supplies & Equipment Procurement",
    buyer: {
      name: "Sarah Johnson",
      icon: "person"
    },
    date: "2024-01-15",
    versions: {
      count: 3,
      icon: "versions"
    },
    items: {
      count: 3,
      icon: "items"
    },
    status: "Active"
  },
  metrics: {
    vendorParticipation: {
      title: "Vendor Participation",
      current: 3,
      total: 4,
      percentage: 75,
      subtitle: "75% participation rate",
      icon: "groups",
      color: "#4CAF50"
    },
    totalSavings: {
      title: "Total Savings",
      amount: 47,
      currency: "$",
      percentage: 10,
      subtitle: "10% cost reduction",
      icon: "trending_down",
      color: "#2E7D32"
    },
    quoteVersions: {
      title: "Quote Versions",
      count: 3,
      subtitle: "Negotiation rounds",
      icon: "description",
      color: "#1976D2"
    },
    bestFinalPrice: {
      title: "Best Final Price",
      amount: 93,
      currency: "$",
      subtitle: "Lowest current quote",
      icon: "attach_money",
      color: "#FF9800"
    }
  },
  priceChart: {
    title: "Average Quoted Price Trend",
    data: [
      { version: "V1", price: 473, label: "$473" },
      { version: "V2", price: 445, label: "$445" },
      { version: "V3", price: 426, label: "$426" }
    ],
    trend: "decreasing"
  }
};

// Comparative Analysis mock data
export const comparativeAnalysisData = {
  vendors: [
    {
      id: 1,
      name: "ALPHA CORP",
      label: "Jan 15, 2024 at 2:30 PM",
      color: "#2196f3",
      commercialRanking: "L3"
    },
    {
      id: 2,
      name: "BETA SOLUTIONS", 
      label: "Jan 14, 2024 at 4:45 PM",
      color: "#2196f3",
      commercialRanking: "L1"
    },
    {
      id: 3,
      name: "DELTA SUPPLIES",
      label: "Jan 16, 2024 at 9:15 AM", 
      color: "#4caf50",
      commercialRanking: "L2"
    },
    {
      id: 4,
      name: "GAMMA ENTERPRISES",
      label: "Jan 13, 2024 at 11:20 AM",
      color: "#ff9800",
      commercialRanking: "L1"
    },
    {
      id: 5,
      name: "EPSILON TRADING",
      label: "Jan 17, 2024 at 3:45 PM",
      color: "#9c27b0",
      commercialRanking: "L3"
    }
  ],
  items: [
    {
      id: "OFF-001",
      name: "Executive Office Chairs",
      quantity: 25,
      uom: "Each",
      targetPrice: 500.00,
      vendors: {
        1: { 
          price: 492.00, 
          isWinner: false,
          commercialTerms: {
            basePrice: 400.00,
            basePricePercentage: 81.3,
            taxes: 72.00,
            taxesPercentage: 14.6,
            freight: 20.00,
            freightPercentage: 4.1,
            totalLandedPrice: 492.00
          }
        },
        2: { 
          price: 544.20, 
          isWinner: false,
          commercialTerms: {
            basePrice: 450.00,
            basePricePercentage: 82.7,
            taxes: 81.63,
            taxesPercentage: 15.0,
            freight: 12.57,
            freightPercentage: 2.3,
            totalLandedPrice: 544.20
          }
        },
        3: { 
          price: 491.10, 
          isWinner: true,
          commercialTerms: {
            basePrice: 420.00,
            basePricePercentage: 85.5,
            taxes: 58.93,
            taxesPercentage: 12.0,
            freight: 12.17,
            freightPercentage: 2.5,
            totalLandedPrice: 491.10
          }
        },
        4: { 
          price: 485.30, 
          isWinner: false,
          commercialTerms: {
            basePrice: 390.00,
            basePricePercentage: 80.4,
            taxes: 75.30,
            taxesPercentage: 15.5,
            freight: 20.00,
            freightPercentage: 4.1,
            totalLandedPrice: 485.30
          }
        },
        5: { 
          price: 510.85, 
          isWinner: false,
          commercialTerms: {
            basePrice: 435.00,
            basePricePercentage: 85.2,
            taxes: 61.30,
            taxesPercentage: 12.0,
            freight: 14.55,
            freightPercentage: 2.8,
            totalLandedPrice: 510.85
          }
        }
      },
      min: 485.30,
      max: 544.20,
      avg: 504.99
    },
    {
      id: "OFF-002", 
      name: "Ergonomic Keyboards",
      quantity: 50,
      uom: "Each",
      targetPrice: 100.00,
      vendors: {
        1: { 
          price: 92.50, 
          isWinner: true,
          commercialTerms: {
            basePrice: 80.00,
            basePricePercentage: 86.5,
            taxes: 9.60,
            taxesPercentage: 10.4,
            freight: 2.90,
            freightPercentage: 3.1,
            totalLandedPrice: 92.50
          }
        },
        2: { 
          price: 101.76, 
          isWinner: false,
          commercialTerms: {
            basePrice: 85.00,
            basePricePercentage: 83.5,
            taxes: 13.59,
            taxesPercentage: 13.4,
            freight: 3.17,
            freightPercentage: 3.1,
            totalLandedPrice: 101.76
          }
        },
        3: { 
          price: 97.04, 
          isWinner: false,
          commercialTerms: {
            basePrice: 82.50,
            basePricePercentage: 85.0,
            taxes: 11.64,
            taxesPercentage: 12.0,
            freight: 2.90,
            freightPercentage: 3.0,
            totalLandedPrice: 97.04
          }
        },
        4: { 
          price: 89.75, 
          isWinner: false,
          commercialTerms: {
            basePrice: 75.00,
            basePricePercentage: 83.6,
            taxes: 11.25,
            taxesPercentage: 12.5,
            freight: 3.50,
            freightPercentage: 3.9,
            totalLandedPrice: 89.75
          }
        },
        5: { 
          price: 105.20, 
          isWinner: false,
          commercialTerms: {
            basePrice: 88.00,
            basePricePercentage: 83.7,
            taxes: 14.08,
            taxesPercentage: 13.4,
            freight: 3.12,
            freightPercentage: 2.9,
            totalLandedPrice: 105.20
          }
        }
      },
      min: 89.75,
      max: 105.20,
      avg: 97.25
    },
    {
      id: "OFF-003",
      name: "LED Monitors 24\"",
      quantity: 30,
      uom: "Each",
      targetPrice: 350.00,
      vendors: {
        1: { 
          price: 318.80, 
          isWinner: true,
          commercialTerms: {
            basePrice: 280.00,
            taxes: 30.80,
            freight: 8.00,
            totalLandedPrice: 318.80
          }
        },
        2: { 
          price: 339.50, 
          isWinner: false,
          commercialTerms: {
            basePrice: 300.00,
            taxes: 33.50,
            freight: 6.00,
            totalLandedPrice: 339.50
          }
        },
        3: { 
          price: 327.70, 
          isWinner: false,
          commercialTerms: {
            basePrice: 290.00,
            taxes: 32.70,
            freight: 5.00,
            totalLandedPrice: 327.70
          }
        },
        4: { 
          price: 312.45, 
          isWinner: false,
          commercialTerms: {
            basePrice: 275.00,
            taxes: 31.45,
            freight: 6.00,
            totalLandedPrice: 312.45
          }
        },
        5: { 
          price: 345.90, 
          isWinner: false,
          commercialTerms: {
            basePrice: 305.00,
            taxes: 34.90,
            freight: 6.00,
            totalLandedPrice: 345.90
          }
        }
      },
      min: 312.45,
      max: 345.90,
      avg: 328.87
    },
    {
      id: "OFF-004",
      name: "Standing Desks",
      quantity: 15,
      uom: "Each",
      targetPrice: 700.00,
      vendors: {
        1: { 
          price: 675.00, 
          isWinner: false,
          commercialTerms: {
            basePrice: 600.00,
            taxes: 60.00,
            freight: 15.00,
            totalLandedPrice: 675.00
          }
        },
        2: { 
          price: 698.50, 
          isWinner: false,
          commercialTerms: {
            basePrice: 620.00,
            taxes: 62.50,
            freight: 16.00,
            totalLandedPrice: 698.50
          }
        },
        3: { 
          price: 652.30, 
          isWinner: true,
          commercialTerms: {
            basePrice: 580.00,
            taxes: 58.30,
            freight: 14.00,
            totalLandedPrice: 652.30
          }
        },
        4: { 
          price: 648.75, 
          isWinner: false,
          commercialTerms: {
            basePrice: 575.00,
            taxes: 58.75,
            freight: 15.00,
            totalLandedPrice: 648.75
          }
        },
        5: { 
          price: 710.20, 
          isWinner: false,
          commercialTerms: {
            basePrice: 630.00,
            taxes: 65.20,
            freight: 15.00,
            totalLandedPrice: 710.20
          }
        }
      },
      min: 648.75,
      max: 710.20,
      avg: 676.95
    },
    {
      id: "OFF-005",
      name: "Conference Tables",
      quantity: 5,
      uom: "Each",
      targetPrice: 1300.00,
      vendors: {
        1: { 
          price: 1250.00, 
          isWinner: true,
          commercialTerms: {
            basePrice: 1100.00,
            taxes: 125.00,
            freight: 25.00,
            totalLandedPrice: 1250.00
          }
        },
        2: { 
          price: 1350.00, 
          isWinner: false,
          commercialTerms: {
            basePrice: 1200.00,
            taxes: 135.00,
            freight: 15.00,
            totalLandedPrice: 1350.00
          }
        },
        3: { 
          price: 1280.00, 
          isWinner: false,
          commercialTerms: {
            basePrice: 1150.00,
            taxes: 115.00,
            freight: 15.00,
            totalLandedPrice: 1280.00
          }
        },
        4: { 
          price: 1225.50, 
          isWinner: false,
          commercialTerms: {
            basePrice: 1100.00,
            taxes: 110.50,
            freight: 15.00,
            totalLandedPrice: 1225.50
          }
        },
        5: { 
          price: 1375.25, 
          isWinner: false,
          commercialTerms: {
            basePrice: 1220.00,
            taxes: 137.25,
            freight: 18.00,
            totalLandedPrice: 1375.25
          }
        }
      },
      min: 1225.50,
      max: 1375.25,
      avg: 1296.15
    },
    {
      id: "OFF-006",
      name: "Storage Cabinets",
      quantity: 20,
      uom: "Each",
      targetPrice: 280.00,
      vendors: {
        1: { price: 285.50, isWinner: false },
        2: { price: 275.00, isWinner: true },
        3: { price: 290.75, isWinner: false },
        4: { price: 268.90, isWinner: false },
        5: { price: 295.30, isWinner: false }
      },
      min: 268.90,
      max: 295.30,
      avg: 283.09
    },
    {
      id: "OFF-007",
      name: "Desk Lamps",
      quantity: 40,
      uom: "Each",
      targetPrice: 50.00,
      vendors: {
        1: { price: 45.80, isWinner: true },
        2: { price: 52.30, isWinner: false },
        3: { price: 48.90, isWinner: false },
        4: { price: 43.25, isWinner: false },
        5: { price: 54.75, isWinner: false }
      },
      min: 43.25,
      max: 54.75,
      avg: 49.00
    },
    {
      id: "OFF-008",
      name: "Printer Stands",
      quantity: 12,
      uom: "Each",
      targetPrice: 120.00,
      vendors: {
        1: { price: 125.00, isWinner: false },
        2: { price: 118.50, isWinner: true },
        3: { price: 132.00, isWinner: false }
      },
      min: 118.50,
      max: 132.00,
      avg: 125.17
    }
  ],
  packageLevel: {
    vendors: [
      {
        name: "ALPHA CORP",
        packagePrice: "1,100 INR",
        loadingFactor: "View",
        amount: "3210 INR"
      },
      {
        name: "BETA SOLUTIONS", 
        packagePrice: "1,000 INR",
        loadingFactor: "N/A",
        amount: "1000 INR"
      },
      {
        name: "DELTA SUPPLIES",
        packagePrice: "1,100 INR", 
        loadingFactor: "N/A",
        amount: "1100 INR"
      },
      {
        name: "GAMMA ENTERPRISES",
        packagePrice: "950 INR",
        loadingFactor: "View",
        amount: "2850 INR"
      },
      {
        name: "EPSILON TRADING",
        packagePrice: "1,200 INR",
        loadingFactor: "N/A",
        amount: "1350 INR"
      }
    ]
  }
};


//Commercial Comparative mock data
export const commercialComparativeData = {
  vendors: [
    {
      id: 1,
      name: "ALPHA CORP",
      label: "Jan 15, 2024 at 2:30 PM",
      commercialRanking: "L3"
    },
    {
      id: 2,
      name: "BETA SOLUTIONS", 
      label: "Jan 14, 2024 at 4:45 PM",
      commercialRanking: "L1"
    },
    {
      id: 3,
      name: "DELTA SUPPLIES",
      label: "Jan 16, 2024 at 9:15 AM", 
      commercialRanking: "L2"
    },
    {
      id: 4,
      name: "GAMMA ENTERPRISES",
      label: "Jan 13, 2024 at 11:20 AM",
      commercialRanking: "L1"
    },
    {
      id: 5,
      name: "EPSILON TRADING",
      label: "Jan 17, 2024 at 3:45 PM",
      commercialRanking: "L3"
    }
  ],
  commercialTerms: [
    {
      TermsId: "1",
      Name: "Delivery Time",
      Remarks: "Days from order confirmation",
      FieldName: "delivery_time",
      Formulavalue: "0",
      CommValue: "0.0000",
      EnterCommValue: "0.00",
      Valuetype: "",
      IsNetPrice: "N",
      vendors: {
        1: { value: "15 Days" },
        2: { value: "10 Days" },
        3: { value: "12 Days" },
        4: { value: "8 Days" },
        5: { value: "20 Days" }
      }
    },
    {
      TermsId: "2",
      Name: "Logistic Mode",
      Remarks: "Transportation method",
      FieldName: "logistic_mode",
      Formulavalue: "0",
      CommValue: "0.0000",
      EnterCommValue: "0.00",
      Valuetype: "",
      IsNetPrice: "N",
      vendors: {
        1: { value: "Road Transport" },
        2: { value: "Express Delivery" },
        3: { value: "Standard Shipping" },
        4: { value: "Express Delivery" },
        5: { value: "Road Transport" }
      }
    },
    {
      TermsId: "3",
      Name: "Payment Terms",
      Remarks: "Payment schedule",
      FieldName: "payment_terms",
      Formulavalue: "0",
      CommValue: "0.0000",
      EnterCommValue: "0.00",
      Valuetype: "",
      IsNetPrice: "N",
      vendors: {
        1: { value: "30 Days Net" },
        2: { value: "45 Days Net" },
        3: { value: "30 Days Net" },
        4: { value: "60 Days Net" },
        5: { value: "15 Days Net" }
      }
    },
    {
      TermsId: "4",
      Name: "Warranty Period",
      Remarks: "Product warranty duration",
      FieldName: "warranty_period",
      Formulavalue: "0",
      CommValue: "0.0000",
      EnterCommValue: "0.00",
      Valuetype: "",
      IsNetPrice: "N",
      vendors: {
        1: { value: "12 Months" },
        2: { value: "24 Months" },
        3: { value: "18 Months" },
        4: { value: "36 Months" },
        5: { value: "12 Months" }
      }
    },
    {
      TermsId: "5",
      Name: "Service Support",
      Remarks: "After-sales service availability",
      FieldName: "service_support",
      Formulavalue: "0",
      CommValue: "0.0000",
      EnterCommValue: "0.00",
      Valuetype: "",
      IsNetPrice: "N",
      vendors: {
        1: { value: "24/7 Support" },
        2: { value: "Business Hours" },
        3: { value: "24/7 Support" },
        4: { value: "Extended Hours" },
        5: { value: "Business Hours" }
      }
    },
    {
      TermsId: "6",
      Name: "Installation Cost",
      Remarks: "On-site installation charges",
      FieldName: "installation_cost",
      Formulavalue: "0",
      CommValue: "0.0000",
      EnterCommValue: "0.00",
      Valuetype: "Currency",
      IsNetPrice: "N",
      vendors: {
        1: { value: "$0.00" },
        2: { value: "$150.00" },
        3: { value: "$0.00" },
        4: { value: "$0.00" },
        5: { value: "$250.00" }
      }
    },
    {
      TermsId: "7",
      Name: "Early Payment Discount",
      Remarks: "Discount for early payment",
      FieldName: "early_payment_discount",
      Formulavalue: "0",
      CommValue: "0.0000",
      EnterCommValue: "0.00",
      Valuetype: "Percentage",
      IsNetPrice: "N",
      vendors: {
        1: { value: "2%" },
        2: { value: "3%" },
        3: { value: "1.5%" },
        4: { value: "2.5%" },
        5: { value: "1%" }
      }
    },
    {
      TermsId: "8",
      Name: "Compliance Certification",
      Remarks: "Industry certifications",
      FieldName: "compliance_certification",
      Formulavalue: "0",
      CommValue: "0.0000",
      EnterCommValue: "0.00",
      Valuetype: "",
      IsNetPrice: "N",
      vendors: {
        1: { value: "ISO 9001" },
        2: { value: "ISO 9001, ISO 14001" },
        3: { value: "ISO 9001" },
        4: { value: "ISO 9001, ISO 14001, OHSAS 18001" },
        5: { value: "Basic Certification" }
      }
    }
  ]
}

//Technical Comparative mock data
export const technicalComparativeData = {
  vendors: [
    {
      id: 1,
      name: "ALPHA CORP",
      label: "Jan 15, 2024 at 2:30 PM",
      commercialRanking: "L3",
      acceptedCurrency: "INR"
    },
    {
      id: 2,
      name: "BETA SOLUTIONS", 
      label: "Jan 14, 2024 at 4:45 PM",
      commercialRanking: "L1",
      acceptedCurrency: "USD"
    },
    {
      id: 3,
      name: "DELTA SUPPLIES",
      label: "Jan 16, 2024 at 9:15 AM", 
      commercialRanking: "L2",
      acceptedCurrency: "EURO"
    },
    {
      id: 4,
      name: "GAMMA ENTERPRISES",
      label: "Jan 13, 2024 at 11:20 AM",
      commercialRanking: "L1",
      acceptedCurrency: "INR"
    },
    {
      id: 5,
      name: "EPSILON TRADING",
      label: "Jan 17, 2024 at 3:45 PM",
      commercialRanking: "L3",
      acceptedCurrency: "USD"
    }
  ],
  technicalQuestions: [
    {
      id: 1901,
      questionDescription: "Company Registration and Legal Status",
      questionRequirement: "Provide details of company registration",
      questionCategory: "Company Information",
      questionSubCategory: "Legal",
      optionType: 0,
      weightage: 0.00,
      mandatory: 1,
      vendors: {
        1: { 
          answer: "Registered as Private Limited Company since 2015",
          attachedFileName: "ALPHA_CORP_Registration.pdf",
          score: 0.00
        },
        2: { 
          answer: "Public Limited Company established in 2010",
          attachedFileName: "BETA_SOLUTIONS_Certificate.pdf",
          score: 0.00
        },
        3: { 
          answer: "Private Limited Company since 2018",
          attachedFileName: "DELTA_Registration_Docs.pdf",
          score: 0.00
        },
        4: { 
          answer: "Partnership Firm converted to Pvt Ltd in 2020",
          attachedFileName: "GAMMA_Legal_Status.pdf",
          score: 0.00
        },
        5: { 
          answer: "Sole Proprietorship converted to Company in 2019",
          attachedFileName: "EPSILON_Company_Docs.pdf",
          score: 0.00
        }
      }
    },
    {
      id: 1902,
      questionDescription: "Years of Experience in Similar Products",
      questionRequirement: "Minimum 5 years experience required",
      questionCategory: "Experience",
      questionSubCategory: "Product Experience",
      optionType: 0,
      weightage: 0.00,
      mandatory: 1,
      vendors: {
        1: { 
          answer: "8 years in office furniture manufacturing",
          attachedFileName: "ALPHA_Experience_Portfolio.pdf",
          score: 0.00
        },
        2: { 
          answer: "12 years specializing in ergonomic office solutions",
          attachedFileName: "BETA_Project_History.pdf",
          score: 0.00
        },
        3: { 
          answer: "6 years in commercial furniture supply",
          attachedFileName: "DELTA_Experience_Certificate.pdf",
          score: 0.00
        },
        4: { 
          answer: "15+ years in office equipment and furniture",
          attachedFileName: "GAMMA_Experience_Portfolio.pdf",
          score: 0.00
        },
        5: { 
          answer: "4 years in office supplies (Below requirement)",
          attachedFileName: "EPSILON_Work_History.pdf",
          score: 0.00
        }
      }
    },
    {
      id: 1903,
      questionDescription: "Quality Certifications",
      questionRequirement: "ISO 9001 or equivalent quality certification",
      questionCategory: "Quality Assurance",
      questionSubCategory: "Certifications",
      optionType: 0,
      weightage: 0.00,
      mandatory: 1,
      vendors: {
        1: { 
          answer: "ISO 9001:2015 certified",
          attachedFileName: "ALPHA_ISO_Certificate.pdf",
          score: 0.00
        },
        2: { 
          answer: "ISO 9001:2015, ISO 14001:2015 certified",
          attachedFileName: "BETA_Multiple_Certificates.pdf",
          score: 0.00
        },
        3: { 
          answer: "ISO 9001:2015 and GREENGUARD certified",
          attachedFileName: "DELTA_Quality_Certs.pdf",
          score: 0.00
        },
        4: { 
          answer: "ISO 9001, ISO 14001, OHSAS 18001 certified",
          attachedFileName: "GAMMA_All_Certificates.pdf",
          score: 0.00
        },
        5: { 
          answer: "Working towards ISO certification",
          attachedFileName: "EPSILON_Cert_Application.pdf",
          score: 0.00
        }
      }
    },
    {
      id: 1904,
      questionDescription: "Manufacturing Capacity",
      questionRequirement: "Monthly production capacity details",
      questionCategory: "Technical Capability",
      questionSubCategory: "Production",
      optionType: 0,
      weightage: 0.00,
      mandatory: 0,
      vendors: {
        1: { 
          answer: "5000 units per month with scalability to 8000",
          attachedFileName: "ALPHA_Capacity_Details.pdf",
          score: 0.00
        },
        2: { 
          answer: "10000 units per month across 3 facilities",
          attachedFileName: "BETA_Production_Report.pdf",
          score: 0.00
        },
        3: { 
          answer: "3000 units per month, can expand if needed",
          attachedFileName: "DELTA_Manufacturing_Info.pdf",
          score: 0.00
        },
        4: { 
          answer: "12000 units per month with automated lines",
          attachedFileName: "GAMMA_Factory_Capacity.pdf",
          score: 0.00
        },
        5: { 
          answer: "2000 units per month, limited capacity",
          attachedFileName: "EPSILON_Production_Limit.pdf",
          score: 0.00
        }
      }
    },
    {
      id: 1905,
      questionDescription: "Environmental Compliance",
      questionRequirement: "Environmental certifications and green practices",
      questionCategory: "Environmental",
      questionSubCategory: "Sustainability",
      optionType: 0,
      weightage: 0.00,
      mandatory: 0,
      vendors: {
        1: { 
          answer: "GREENGUARD Gold certified, 50% recycled materials",
          attachedFileName: "ALPHA_Environmental_Report.pdf",
          score: 0.00
        },
        2: { 
          answer: "ISO 14001, Carbon neutral manufacturing",
          attachedFileName: "BETA_Sustainability_Report.pdf",
          score: 0.00
        },
        3: { 
          answer: "FSC certified wood, eco-friendly processes",
          attachedFileName: "DELTA_Green_Certificate.pdf",
          score: 0.00
        },
        4: { 
          answer: "Multiple environmental certifications, zero waste",
          attachedFileName: "GAMMA_Environmental_Awards.pdf",
          score: 0.00
        },
        5: { 
          answer: "Basic environmental compliance only",
          attachedFileName: "EPSILON_Basic_Compliance.pdf",
          score: 0.00
        }
      }
    },
    {
      id: 1906,
      questionDescription: "After Sales Support Structure",
      questionRequirement: "Dedicated support team and service network",
      questionCategory: "Service Support",
      questionSubCategory: "After Sales",
      optionType: 0,
      weightage: 0.00,
      mandatory: 1,
      vendors: {
        1: { 
          answer: "Dedicated support team, 24/7 helpline, 50+ service centers",
          attachedFileName: "ALPHA_Support_Structure.pdf",
          score: 0.00
        },
        2: { 
          answer: "Regional support offices, online portal, mobile app",
          attachedFileName: "BETA_Service_Network.pdf",
          score: 0.00
        },
        3: { 
          answer: "Central support team, email/phone support, 20 service points",
          attachedFileName: "DELTA_Support_Details.pdf",
          score: 0.00
        },
        4: { 
          answer: "Comprehensive support network, AI chatbot, 100+ centers",
          attachedFileName: "GAMMA_Complete_Support.pdf",
          score: 0.00
        },
        5: { 
          answer: "Basic email support, limited service network",
          attachedFileName: "EPSILON_Limited_Support.pdf",
          score: 0.00
        }
      }
    },
    {
      id: 1907,
      questionDescription: "Financial Stability",
      questionRequirement: "Last 3 years financial statements and credit rating",
      questionCategory: "Financial",
      questionSubCategory: "Stability",
      optionType: 0,
      weightage: 0.00,
      mandatory: 1,
      vendors: {
        1: { 
          answer: "Consistent growth, A+ credit rating, profitable for 5 years",
          attachedFileName: "ALPHA_Financial_Statements.pdf",
          score: 0.00
        },
        2: { 
          answer: "Strong financials, AAA rating, market leader",
          attachedFileName: "BETA_Audited_Reports.pdf",
          score: 0.00
        },
        3: { 
          answer: "Stable performance, B+ rating, steady growth",
          attachedFileName: "DELTA_Financial_Health.pdf",
          score: 0.00
        },
        4: { 
          answer: "Excellent financial position, AA+ rating, industry leader",
          attachedFileName: "GAMMA_Credit_Report.pdf",
          score: 0.00
        },
        5: { 
          answer: "Recent losses but recovering, C+ rating",
          attachedFileName: "EPSILON_Recovery_Plan.pdf",
          score: 0.00
        }
      }
    },
    {
      id: 1908,
      questionDescription: "Technology and Innovation",
      questionRequirement: "R&D capabilities and technological advancement",
      questionCategory: "Innovation",
      questionSubCategory: "Technology",
      optionType: 0,
      weightage: 0.00,
      mandatory: 0,
      vendors: {
        1: { 
          answer: "In-house R&D team, 5% revenue on innovation, smart furniture",
          attachedFileName: "ALPHA_Innovation_Report.pdf",
          score: 0.00
        },
        2: { 
          answer: "Advanced R&D facility, IoT integration, AI-driven design",
          attachedFileName: "BETA_Technology_Portfolio.pdf",
          score: 0.00
        },
        3: { 
          answer: "Basic R&D, focus on ergonomic improvements",
          attachedFileName: "DELTA_Innovation_Projects.pdf",
          score: 0.00
        },
        4: { 
          answer: "Leading innovation center, multiple patents, smart office solutions",
          attachedFileName: "GAMMA_Patent_Portfolio.pdf",
          score: 0.00
        },
        5: { 
          answer: "Limited R&D, follows market trends",
          attachedFileName: "EPSILON_Basic_Innovation.pdf",
          score: 0.00
        }
      }
    }
  ]
}



export const tempData = {
    "suppliers": [
        {
            "id": 2002,
            "companyName": "AGILEAPT SOLUTIONS PRIVATE LIMITED",
            "status": "Closed",
            "responseDate": "2025-10-06T04:41:52.4199517",
            "vendorId": 281,
            "version": 1,
            "remarks": null,
            "emailId": "gotomansi@gmail.com",
            "contactId": 358,
            "acceptedCurrency": "INR",
            "qTotalScore": 30,
            "packagePrice": null,
            "loadingAmount": 0,
            "rfqVendorAmount": 0,
            "contactPerson": "mansi",
            "ranking": null,
            "techStatus": null
        }
    ],
    "items": [
        {
            "id": 917,
            "itemCode": "",
            "itemName": "Item 1",
            "itemDesc": "desc",
            "remarks": "",
            "version": 1,
            "quantity": 10,
            "targetPrice": 0,
            "uom": "number",
            "rfqId": 476,
            "customerId": 1,
            "plant": "Noida",
            "poNumber": null,
            "unitRate": null,
            "poValue": null,
            "poDate": null,
            "poVendorName": null,
            "vendorItemDetails": [
                {
                    "id": 1033,
                    "vendorDetailId": 2002,
                    "parameterId": 917,
                    "itemPrice": 1500,
                    "convertedItemPrice": 1500,
                    "itemRanking": 1,
                    "vendorId": 281,
                    "version": 1,
                    "vendorItemCommercials": []
                },
                {
                    "id": 1036,
                    "vendorDetailId": 2003,
                    "parameterId": 917,
                    "itemPrice": 1600,
                    "convertedItemPrice": 1600,
                    "itemRanking": null,
                    "vendorId": 282,
                    "version": 1,
                    "vendorItemCommercials": []
                }
            ]
        },
        {
            "id": 918,
            "itemCode": "",
            "itemName": "Item 2",
            "itemDesc": "desc",
            "remarks": "",
            "version": 1,
            "quantity": 15,
            "targetPrice": 0,
            "uom": "Ton",
            "rfqId": 476,
            "customerId": 1,
            "plant": "Delhi",
            "poNumber": null,
            "unitRate": null,
            "poValue": null,
            "poDate": null,
            "poVendorName": null,
            "vendorItemDetails": [
                {
                    "id": 1034,
                    "vendorDetailId": 2002,
                    "parameterId": 918,
                    "itemPrice": 2000,
                    "convertedItemPrice": 2000,
                    "itemRanking": 1,
                    "vendorId": 281,
                    "version": 1,
                    "vendorItemCommercials": []
                },
                {
                    "id": 1037,
                    "vendorDetailId": 2003,
                    "parameterId": 918,
                    "itemPrice": 1900,
                    "convertedItemPrice": 1900,
                    "itemRanking": null,
                    "vendorId": 282,
                    "version": 1,
                    "vendorItemCommercials": []
                }
            ]
        },
        {
            "id": 919,
            "itemCode": "",
            "itemName": "Item 3",
            "itemDesc": "desc",
            "remarks": "",
            "version": 1,
            "quantity": 20,
            "targetPrice": 0,
            "uom": "Unit",
            "rfqId": 476,
            "customerId": 1,
            "plant": "Gurgaon",
            "poNumber": null,
            "unitRate": null,
            "poValue": null,
            "poDate": null,
            "poVendorName": null,
            "vendorItemDetails": [
                {
                    "id": 1035,
                    "vendorDetailId": 2002,
                    "parameterId": 919,
                    "itemPrice": 2500,
                    "convertedItemPrice": 2500,
                    "itemRanking": 1,
                    "vendorId": 281,
                    "version": 1,
                    "vendorItemCommercials": []
                },
                {
                    "id": 1038,
                    "vendorDetailId": 2003,
                    "parameterId": 919,
                    "itemPrice": 2000,
                    "convertedItemPrice": 2000,
                    "itemRanking": null,
                    "vendorId": 282,
                    "version": 1,
                    "vendorItemCommercials": []
                }
            ]
        }
    ],
    "packageCommercialTerms": [
        {
            "id": 2996,
            "termsId": 1,
            "name": "Price",
            "level": "rfq",
            "requirement": null,
            "valueType": "Currency",
            "grandTotalTermName": "Total",
            "version": 1,
            "acceptedCurrency": "INR",
            "vendorPackageCommercial": [
                {
                    "id": 1885,
                    "termsId": 1,
                    "name": "Price",
                    "level": "rfq",
                    "vendorDetailId": 2002,
                    "rfqId": 476,
                    "vendorId": 281,
                    "version": 1,
                    "remarks": null,
                    "requirement": null,
                    "rfqtcId": 2996,
                    "calculateCommValue": null,
                    "enterCommValue": 95000
                },
                {
                    "id": 1893,
                    "termsId": 1,
                    "name": "Price",
                    "level": "rfq",
                    "vendorDetailId": 2003,
                    "rfqId": 476,
                    "vendorId": 282,
                    "version": 1,
                    "remarks": null,
                    "requirement": null,
                    "rfqtcId": 2996,
                    "calculateCommValue": null,
                    "enterCommValue": 84500
                }
            ]
        },
        {
            "id": 2997,
            "termsId": 2,
            "name": "Discount",
            "level": "rfq",
            "requirement": null,
            "valueType": "Percentage",
            "grandTotalTermName": "Total",
            "version": 1,
            "acceptedCurrency": null,
            "vendorPackageCommercial": [
                {
                    "id": 1886,
                    "termsId": 2,
                    "name": "Discount",
                    "level": "rfq",
                    "vendorDetailId": 2002,
                    "rfqId": 476,
                    "vendorId": 281,
                    "version": 1,
                    "remarks": null,
                    "requirement": null,
                    "rfqtcId": 2997,
                    "calculateCommValue": null,
                    "enterCommValue": 10
                },
                {
                    "id": 1894,
                    "termsId": 2,
                    "name": "Discount",
                    "level": "rfq",
                    "vendorDetailId": 2003,
                    "rfqId": 476,
                    "vendorId": 282,
                    "version": 1,
                    "remarks": null,
                    "requirement": null,
                    "rfqtcId": 2997,
                    "calculateCommValue": null,
                    "enterCommValue": 10
                }
            ]
        },
        {
            "id": 2998,
            "termsId": 3,
            "name": "GST",
            "level": "rfq",
            "requirement": null,
            "valueType": "Percentage",
            "grandTotalTermName": "Total",
            "version": 1,
            "acceptedCurrency": null,
            "vendorPackageCommercial": [
                {
                    "id": 1887,
                    "termsId": 3,
                    "name": "GST",
                    "level": "rfq",
                    "vendorDetailId": 2002,
                    "rfqId": 476,
                    "vendorId": 281,
                    "version": 1,
                    "remarks": null,
                    "requirement": null,
                    "rfqtcId": 2998,
                    "calculateCommValue": null,
                    "enterCommValue": 18
                },
                {
                    "id": 1895,
                    "termsId": 3,
                    "name": "GST",
                    "level": "rfq",
                    "vendorDetailId": 2003,
                    "rfqId": 476,
                    "vendorId": 282,
                    "version": 1,
                    "remarks": null,
                    "requirement": null,
                    "rfqtcId": 2998,
                    "calculateCommValue": null,
                    "enterCommValue": 18
                }
            ]
        },
        {
            "id": 2999,
            "termsId": 4,
            "name": "Total",
            "level": "rfq",
            "requirement": null,
            "valueType": "Currency",
            "grandTotalTermName": "Total",
            "version": 1,
            "acceptedCurrency": "INR",
            "vendorPackageCommercial": [
                {
                    "id": 1888,
                    "termsId": 4,
                    "name": "Total",
                    "level": "rfq",
                    "vendorDetailId": 2002,
                    "rfqId": 476,
                    "vendorId": 281,
                    "version": 1,
                    "remarks": null,
                    "requirement": null,
                    "rfqtcId": 2999,
                    "calculateCommValue": null,
                    "enterCommValue": 104600
                },
                {
                    "id": 1896,
                    "termsId": 4,
                    "name": "Total",
                    "level": "rfq",
                    "vendorDetailId": 2003,
                    "rfqId": 476,
                    "vendorId": 282,
                    "version": 1,
                    "remarks": null,
                    "requirement": null,
                    "rfqtcId": 2999,
                    "calculateCommValue": null,
                    "enterCommValue": 93210
                }
            ]
        },
        {
            "id": 3002,
            "termsId": 12,
            "name": "Logistic Charges",
            "level": "rfq",
            "requirement": null,
            "valueType": "Currency",
            "grandTotalTermName": "Total",
            "version": 1,
            "acceptedCurrency": "INR",
            "vendorPackageCommercial": [
                {
                    "id": 1891,
                    "termsId": 12,
                    "name": "Logistic Charges",
                    "level": "rfq",
                    "vendorDetailId": 2002,
                    "rfqId": 476,
                    "vendorId": 281,
                    "version": 1,
                    "remarks": null,
                    "requirement": null,
                    "rfqtcId": 3002,
                    "calculateCommValue": null,
                    "enterCommValue": 2000
                },
                {
                    "id": 1899,
                    "termsId": 12,
                    "name": "Logistic Charges",
                    "level": "rfq",
                    "vendorDetailId": 2003,
                    "rfqId": 476,
                    "vendorId": 282,
                    "version": 1,
                    "remarks": null,
                    "requirement": null,
                    "rfqtcId": 3002,
                    "calculateCommValue": null,
                    "enterCommValue": 1500
                }
            ]
        },
        {
            "id": 3003,
            "termsId": 21,
            "name": "Port Charges",
            "level": "rfq",
            "requirement": null,
            "valueType": "Currency",
            "grandTotalTermName": "Total",
            "version": 1,
            "acceptedCurrency": "INR",
            "vendorPackageCommercial": [
                {
                    "id": 1892,
                    "termsId": 21,
                    "name": "Port Charges",
                    "level": "rfq",
                    "vendorDetailId": 2002,
                    "rfqId": 476,
                    "vendorId": 281,
                    "version": 1,
                    "remarks": null,
                    "requirement": null,
                    "rfqtcId": 3003,
                    "calculateCommValue": null,
                    "enterCommValue": 2000
                },
                {
                    "id": 1900,
                    "termsId": 21,
                    "name": "Port Charges",
                    "level": "rfq",
                    "vendorDetailId": 2003,
                    "rfqId": 476,
                    "vendorId": 282,
                    "version": 1,
                    "remarks": null,
                    "requirement": null,
                    "rfqtcId": 3003,
                    "calculateCommValue": null,
                    "enterCommValue": 1950
                }
            ]
        }
    ]
}

export const tempCommercialData = {
    "suppliers": [
        {
            "id": 2000,
            "companyName": "AGILEAPT SOLUTIONS PRIVATE LIMITED",
            "status": "Closed",
            "responseDate": "2025-09-30T07:24:22.0365922",
            "vendorId": 281,
            "version": 1,
            "remarks": null,
            "emailId": "gotomansi@gmail.com",
            "contactId": 358,
            "acceptedCurrency": "INR",
            "qTotalScore": 3.33,
            "packagePrice": 81575,
            "loadingAmount": 0,
            "rfqVendorAmount": 81575,
            "contactPerson": "mansi",
            "ranking": 2,
            "techStatus": null
        },
        {
            "id": 2001,
            "companyName": "HCL TECHNOLOGIES LIMITED",
            "status": "Closed",
            "responseDate": "2025-09-30T07:22:45.1934149",
            "vendorId": 282,
            "version": 1,
            "remarks": null,
            "emailId": "anurag.gupta@agileapt.com",
            "contactId": 362,
            "acceptedCurrency": "INR",
            "qTotalScore": 0,
            "packagePrice": 77502,
            "loadingAmount": 0,
            "rfqVendorAmount": 77502,
            "contactPerson": "Anurag",
            "ranking": 1,
            "techStatus": null
        }
    ],
    "packageCommercialTerms": [
        {
            "id": 2994,
            "termsId": 9,
            "name": "Delivery Time",
            "level": "rfq",
            "requirement": null,
            "valueType": "",
            "grandTotalTermName": "Total",
            "version": 1,
            "acceptedCurrency": null,
            "vendorPackageCommercial": [
                {
                    "id": 1881,
                    "termsId": 9,
                    "name": "Delivery Time",
                    "level": "rfq",
                    "vendorDetailId": 2001,
                    "rfqId": 474,
                    "vendorId": 282,
                    "version": 1,
                    "remarks": "10 days",
                    "requirement": null,
                    "rfqtcId": 2994,
                    "calculateCommValue": null
                },
                {
                    "id": 1883,
                    "termsId": 9,
                    "name": "Delivery Time",
                    "level": "rfq",
                    "vendorDetailId": 2000,
                    "rfqId": 474,
                    "vendorId": 281,
                    "version": 1,
                    "remarks": "15 days",
                    "requirement": null,
                    "rfqtcId": 2994,
                    "calculateCommValue": null
                }
            ]
        },
        {
            "id": 2995,
            "termsId": 10,
            "name": "Logistic Mode",
            "level": "rfq",
            "requirement": null,
            "valueType": "",
            "grandTotalTermName": "Total",
            "version": 1,
            "acceptedCurrency": null,
            "vendorPackageCommercial": [
                {
                    "id": 1882,
                    "termsId": 10,
                    "name": "Logistic Mode",
                    "level": "rfq",
                    "vendorDetailId": 2001,
                    "rfqId": 474,
                    "vendorId": 282,
                    "version": 1,
                    "remarks": "OK",
                    "requirement": null,
                    "rfqtcId": 2995,
                    "calculateCommValue": null
                },
                {
                    "id": 1884,
                    "termsId": 10,
                    "name": "Logistic Mode",
                    "level": "rfq",
                    "vendorDetailId": 2000,
                    "rfqId": 474,
                    "vendorId": 281,
                    "version": 1,
                    "remarks": "Truck",
                    "requirement": null,
                    "rfqtcId": 2995,
                    "calculateCommValue": null
                }
            ]
        }
    ]
}

export const tempTechnicalData = {
    "suppliers": [
        {
            "id": 2000,
            "companyName": "AGILEAPT SOLUTIONS PRIVATE LIMITED",
            "status": "Closed",
            "responseDate": "2025-09-30T07:24:22.0365922",
            "vendorId": 281,
            "version": 1,
            "remarks": null,
            "emailId": "gotomansi@gmail.com",
            "contactId": 358,
            "acceptedCurrency": "INR",
            "qTotalScore": 3.33,
            "packagePrice": 81575,
            "loadingAmount": 0,
            "rfqVendorAmount": 81575,
            "contactPerson": "mansi",
            "ranking": 2,
            "techStatus": "Approved"
        },
        {
            "id": 2001,
            "companyName": "HCL TECHNOLOGIES LIMITED",
            "status": "Closed",
            "responseDate": "2025-09-30T07:22:45.1934149",
            "vendorId": 282,
            "version": 1,
            "remarks": null,
            "emailId": "anurag.gupta@agileapt.com",
            "contactId": 362,
            "acceptedCurrency": "INR",
            "qTotalScore": 0,
            "packagePrice": 77502,
            "loadingAmount": 0,
            "rfqVendorAmount": 77502,
            "contactPerson": "Anurag",
            "ranking": 1,
            "techStatus": "Pending"
        }
    ],
    "questionDto": [
        {
            "id": 2083,
            "questionDescription": "Demo test 1",
            "attachedFileName": "1/QuestionLibrary/RFQ library/ComparativeAnalysis(21).pdf",
            "optionType": false,
            "weightage": 50,
            "mandatory": false,
            "questionRequirement": "",
            "version": 1,
            "vendorQuestionResponse": [
                {
                    "id": 2161,
                    "rfqId": 474,
                    "questionId": 2083,
                    "vendorId": 282,
                    "version": 1,
                    "answer": "ANS",
                    "ansAttachements": "",
                    "vendorDetailId": 2001,
                    "score": 0,
                    "updateScore": true
                },
                {
                    "id": 2165,
                    "rfqId": 474,
                    "questionId": 2083,
                    "vendorId": 281,
                    "version": 1,
                    "answer": "NO",
                    "ansAttachements": "",
                    "vendorDetailId": 2000,
                    "score": 10,
                    "updateScore": true
                }
            ]
        },
        {
            "id": 2084,
            "questionDescription": "Demo test 2",
            "attachedFileName": "",
            "optionType": true,
            "weightage": 50,
            "mandatory": false,
            "questionRequirement": "",
            "version": 1,
            "vendorQuestionResponse": [
                {
                    "id": 2162,
                    "rfqId": 474,
                    "questionId": 2084,
                    "vendorId": 282,
                    "version": 1,
                    "answer": "truck",
                    "ansAttachements": "",
                    "vendorDetailId": 2001,
                    "score": 15,
                    "updateScore": false
                },
                {
                    "id": 2166,
                    "rfqId": 474,
                    "questionId": 2084,
                    "vendorId": 281,
                    "version": 1,
                    "answer": "truck",
                    "ansAttachements": "",
                    "vendorDetailId": 2000,
                    "score": 16,
                    "updateScore": false
                }
            ]
        },
        {
            "id": 2085,
            "questionDescription": "Demo Test 3",
            "attachedFileName": "",
            "optionType": true,
            "weightage": 50,
            "mandatory": false,
            "questionRequirement": "",
            "version": 1,
            "vendorQuestionResponse": [
                {
                    "id": 2163,
                    "rfqId": 474,
                    "questionId": 2085,
                    "vendorId": 282,
                    "version": 1,
                    "answer": "bus",
                    "ansAttachements": "",
                    "vendorDetailId": 2001,
                    "score": 15.33,
                    "updateScore": false
                },
                {
                    "id": 2167,
                    "rfqId": 474,
                    "questionId": 2085,
                    "vendorId": 281,
                    "version": 1,
                    "answer": "bus",
                    "ansAttachements": "",
                    "vendorDetailId": 2000,
                    "score": 26.67,
                    "updateScore": false
                }
            ]
        },
        {
            "id": 2086,
            "questionDescription": "Q1 here",
            "attachedFileName": "1/RFQ/Buyer/3-Shivangi Sinha/Question//NDA.xlsx",
            "optionType": false,
            "weightage": 0,
            "mandatory": false,
            "questionRequirement": "desc",
            "version": 1,
            "vendorQuestionResponse": [
                {
                    "id": 2164,
                    "rfqId": 474,
                    "questionId": 2086,
                    "vendorId": 282,
                    "version": 1,
                    "answer": "Answer 1",
                    "ansAttachements": "",
                    "vendorDetailId": 2001,
                    "score": 0,
                    "updateScore": true
                },
                {
                    "id": 2168,
                    "rfqId": 474,
                    "questionId": 2086,
                    "vendorId": 281,
                    "version": 1,
                    "answer": "YES",
                    "ansAttachements": "",
                    "vendorDetailId": 2000,
                    "score": 0,
                    "updateScore": true
                }
            ]
        }
    ]
}


export const rfqSummaryData = {
    "rfqInfo": {
        "rfqCode": "RFQ/611",
        "subject": "DEMO RFQ 1 - 29/10/2025",
        "requisitioner": "Shivangi Sinha",
        "startDate": "2025-10-29T10:57:35.8718405",
        "endDate": "2025-10-29T11:05:00",
        "version": 1,
        "items": 1,
        "stage": "Awarded"
    },
    "invitedParticipated": [
        {
            "version": 1,
            "invitedSuppliers": 2,
            "participatedSuppliers": 1
        },
        {
            "version": 1.01,
            "invitedSuppliers": 4,
            "participatedSuppliers": 2
        },
        {
            "version": 1.02,
            "invitedSuppliers": 3,
            "participatedSuppliers": 3
        },
        {
            "version": 2,
            "invitedSuppliers": 5,
            "participatedSuppliers": 4
        }
    ],
    "savingsData": [
        {
            "version": 1,
            "lastInvPrice": 50000,
            "targetPrice": 0,
            "lowestPrice": 30000,
            "highestPrice": 40000
        },
        {
            "version": 1.01,
            "lastInvPrice": 50000,
            "targetPrice": 0,
            "lowestPrice": 25000,
            "highestPrice": 35000
        },
        {
            "version": 1.02,
            "lastInvPrice": 50000,
            "targetPrice": 21000,
            "lowestPrice": 22000,
            "highestPrice": 32000
        },
        {
            "version": 2,
            "lastInvPrice": 50000,
            "targetPrice": 21000,
            "lowestPrice": 20000,
            "highestPrice": 30000
        }
    ],
    "priceSupplierData": [
        {
            "version": 1,
            "supplier": "HCL TECHNOLOGIES LIMITED",
            "price": 50000
        },
        {
            "version": 1,
            "supplier": "AGILEAPT SOLUTIONS PRIVATE LIMITED",
            "price": 55000
        },
        {
            "version": 1.01,
            "supplier": "HCL TECHNOLOGIES LIMITED",
            "price": 40000
        },
        {
            "version": 1.01,
            "supplier": "AGILEAPT SOLUTIONS PRIVATE LIMITED",
            "price": 45000
        },
        {
            "version": 1.02,
            "supplier": "HCL TECHNOLOGIES LIMITED",
            "price": 30000
        },
        {
            "version": 1.02,
            "supplier": "AGILEAPT SOLUTIONS PRIVATE LIMITED",
            "price": 35000
        },
        {
            "version": 2,
            "supplier": "HCL TECHNOLOGIES LIMITED",
            "price": 25000
        }
    ]
}