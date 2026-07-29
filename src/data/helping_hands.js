export const initialEquipment = [
  {
    id: 1,
    name: "Standard Adult Wheelchair",
    category: "Wheelchairs",
    description: "Foldable wheelchair with comfortable armrests and footrests, ideal for patients who have trouble walking.",
    image_url: "https://images.unsplash.com/photo-1579684389782-64d84b5e905d?q=80&w=600&auto=format&fit=crop",
    total_stock: 50,
    available_stock: 50,
    status: "Available"
  },
  {
    id: 2,
    name: "5L Oxygen Concentrator",
    category: "Oxygen",
    description: "High-purity oxygen concentrator, provides continuous oxygen flow of up to 5 Liters per minute.",
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop",
    total_stock: 25,
    available_stock: 25,
    status: "Available"
  },
  {
    id: 3,
    name: "Semi-Fowler Manual Hospital Bed",
    category: "Hospital Beds",
    description: "Adjustable backrest and height, standard hospital bed for home patient care.",
    image_url: "https://images.unsplash.com/photo-1538108149393-fdfd81215362?q=80&w=600&auto=format&fit=crop",
    total_stock: 15,
    available_stock: 15,
    status: "Available"
  },
  {
    id: 4,
    name: "Compressor Nebulizer Machine",
    category: "Nebulizers",
    description: "Compact nebulizer for effective medication delivery to treat respiratory issues like asthma or bronchitis.",
    image_url: "https://images.unsplash.com/photo-1581091170250-e34179e86c05?q=80&w=600&auto=format&fit=crop",
    total_stock: 12,
    available_stock: 12,
    status: "Available"
  },
  {
    id: 5,
    name: "Adjustable Folding Walker",
    category: "Walkers",
    description: "Lightweight aluminum folding walker with adjustable height controls and dual support rails.",
    image_url: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=600&auto=format&fit=crop",
    total_stock: 10,
    available_stock: 10,
    status: "Available"
  },
  {
    id: 6,
    name: "Rebreather Oxygen Mask",
    category: "Oxygen",
    description: "Non-rebreather oxygen masks with reservoir bags, designed to deliver high concentrations of oxygen in emergency care.",
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop",
    total_stock: 8,
    available_stock: 8,
    status: "Available"
  }
];

export const initialBorrowers = [
  {
    id: 1,
    name: "Ramees Ali",
    phone: "+91 9876543210",
    address: "24, MG Road, Padiyanallur",
    patient_name: "Aisha Beevi (Mother)",
    equipment_id: 1,
    quantity: 1,
    borrow_date: "2026-06-01",
    expected_return_date: "2026-07-01",
    actual_return_date: "2026-06-05",
    status: "Returned",
    notes: "Requires wheel lock check on return"
  },
  {
    id: 2,
    name: "Rahman",
    phone: "+91 9876543211",
    address: "10B, Market Street, Padiyanallur",
    patient_name: "Rahman (Self)",
    equipment_id: 2,
    quantity: 1,
    borrow_date: "2026-05-15",
    expected_return_date: "2026-06-15",
    actual_return_date: "2026-06-11",
    status: "Returned",
    notes: "Returned clean and fully functional"
  },
  {
    id: 3,
    name: "Shafi",
    phone: "+91 9876543212",
    address: "Circular Road, Padiyanallur",
    patient_name: "Kamarudeen (Father)",
    equipment_id: 3,
    quantity: 1,
    borrow_date: "2026-05-01",
    expected_return_date: "2026-05-31",
    actual_return_date: "2026-05-30",
    status: "Returned",
    notes: "Follow up call made on June 3"
  }
];

export const initialRequests = [
  {
    id: 1,
    user_name: "Ramees Ali",
    phone: "+91 9876543210",
    address: "24, MG Road, Padiyanallur",
    patient_name: "Aisha Beevi (Mother)",
    equipment_id: 1,
    duration: 30,
    status: "Approved",
    created_at: "2026-06-01T10:00:00.000Z"
  },
  {
    id: 2,
    user_name: "Rahman",
    phone: "+91 9876543211",
    address: "10B, Market Street, Padiyanallur",
    patient_name: "Rahman (Self)",
    equipment_id: 2,
    duration: 30,
    status: "Pending",
    created_at: "2026-06-02T11:30:00.000Z"
  },
  {
    id: 3,
    user_name: "Shafi",
    phone: "+91 9876543212",
    address: "Circular Road, Padiyanallur",
    patient_name: "Kamarudeen (Father)",
    equipment_id: 3,
    duration: 15,
    status: "Returned",
    created_at: "2026-05-01T09:00:00.000Z"
  }
];

export const trustInfo = {
  name: "PYDC Charity Trust",
  tagline: "We Care, We Share, We Help",
  address: "PYDC Trust Building, Near Central Library, Padiyanallur, Chennai - 600052",
  phone: "+91 9876543210",
  email: "helpinghands@pydc.org",
  logo_url: "/pydc_logo.png"
};
