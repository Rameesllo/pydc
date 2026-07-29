import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { 
  initialEquipment, 
  initialBorrowers, 
  initialRequests,
  trustInfo 
} from "../data/helping_hands";

export function useHelpingHands() {
  const [equipment, setEquipment] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and fetch data
  const fetchData = async () => {
    // v4: force full reset — all equipment set to fully available stock
    const version = "hh_v4_fully_available";
    if (!localStorage.getItem(version)) {
      localStorage.removeItem("hh_equipment");
      localStorage.removeItem("hh_borrowers");
      localStorage.removeItem("hh_requests");
      // Clear all old version flags
      localStorage.removeItem("hh_v3_available");
      localStorage.removeItem("hh_v2_reset");
      localStorage.removeItem("hh_v1");
      localStorage.setItem(version, "true");
    }

    setLoading(true);
    setError(null);
    try {
      let eqData = [], borrData = [], reqData = [];
      let fetchSuccess = true;

      // 1. Fetch Equipment
      try {
        const { data, error } = await supabase.from("equipment").select("*").order("id", { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
          eqData = data;
        } else {
          // Empty DB, populate with mock data
          const { error: seedError } = await supabase.from("equipment").insert(initialEquipment);
          if (!seedError) {
            const { data: refreshed } = await supabase.from("equipment").select("*").order("id", { ascending: true });
            eqData = refreshed || initialEquipment;
          } else {
            eqData = initialEquipment;
          }
        }
      } catch (err) {
        console.warn("Supabase equipment fetch failed. Using local storage/fallback:", err?.message || err);
        fetchSuccess = false;
      }

      // 2. Fetch Borrowers
      try {
        const { data, error } = await supabase.from("borrowers").select("*").order("id", { ascending: false });
        if (error) throw error;
        borrData = data || [];
      } catch (err) {
        console.warn("Supabase borrowers fetch failed. Using local storage/fallback:", err?.message || err);
        fetchSuccess = false;
      }

      // 3. Fetch Requests
      try {
        const { data, error } = await supabase.from("requests").select("*").order("id", { ascending: false });
        if (error) throw error;
        reqData = data || [];
      } catch (err) {
        console.warn("Supabase requests fetch failed. Using local storage/fallback:", err?.message || err);
        fetchSuccess = false;
      }

      if (fetchSuccess && eqData.length > 0) {
        // Recalculate available_stock from ACTUAL active borrow records
        // This prevents stale DB values from showing wrong availability
        const activeBorrows = borrData.filter(b => b.status === "Borrowed" || b.status === "Overdue");
        const correctedEqData = eqData.map(eq => {
          const borrowedQty = activeBorrows
            .filter(b => b.equipment_id === eq.id)
            .reduce((sum, b) => sum + (b.quantity || 1), 0);
          const newAvail = Math.max(0, eq.total_stock - borrowedQty);
          return {
            ...eq,
            available_stock: newAvail,
            status: newAvail > 0 ? "Available" : "Out of Stock"
          };
        });

        setEquipment(correctedEqData);
        setBorrowers(borrData);
        setRequests(reqData);
        // Sync corrected values to localStorage
        localStorage.setItem("hh_equipment", JSON.stringify(correctedEqData));
        localStorage.setItem("hh_borrowers", JSON.stringify(borrData));
        localStorage.setItem("hh_requests", JSON.stringify(reqData));
      } else {
        // Fall back to Local Storage if it exists, otherwise use hardcoded mock data
        const localEq = localStorage.getItem("hh_equipment");
        const localBorr = localStorage.getItem("hh_borrowers");
        const localReq = localStorage.getItem("hh_requests");

        // Ensure local equipment also shows correct availability
        const rawEq = localEq ? JSON.parse(localEq) : initialEquipment;
        const finalBorr = localBorr ? JSON.parse(localBorr) : initialBorrowers;
        const finalReq = localReq ? JSON.parse(localReq) : initialRequests;

        const activeBorrowsLocal = finalBorr.filter(b => b.status === "Borrowed" || b.status === "Overdue");
        const finalEq = rawEq.map(eq => {
          const borrowedQty = activeBorrowsLocal
            .filter(b => b.equipment_id === eq.id)
            .reduce((sum, b) => sum + (b.quantity || 1), 0);
          const newAvail = Math.max(0, eq.total_stock - borrowedQty);
          return {
            ...eq,
            available_stock: newAvail,
            status: newAvail > 0 ? "Available" : "Out of Stock"
          };
        });

        setEquipment(finalEq);
        setBorrowers(finalBorr);
        setRequests(finalReq);

        localStorage.setItem("hh_equipment", JSON.stringify(finalEq));
        if (!localBorr) localStorage.setItem("hh_borrowers", JSON.stringify(finalBorr));
        if (!localReq) localStorage.setItem("hh_requests", JSON.stringify(finalReq));
      }
    } catch (globalErr) {
      console.error("Global fetch error in useHelpingHands:", globalErr);
      setError(globalErr.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update localStorage helper
  const updateLocalAndState = (newEq, newBorr, newReq) => {
    if (newEq) {
      setEquipment(newEq);
      localStorage.setItem("hh_equipment", JSON.stringify(newEq));
    }
    if (newBorr) {
      setBorrowers(newBorr);
      localStorage.setItem("hh_borrowers", JSON.stringify(newBorr));
    }
    if (newReq) {
      setRequests(newReq);
      localStorage.setItem("hh_requests", JSON.stringify(newReq));
    }
  };

  // 1. ADD EQUIPMENT
  const addEquipment = async (item) => {
    const newItem = {
      ...item,
      available_stock: item.total_stock,
      status: item.total_stock > 0 ? "Available" : "Out of Stock"
    };

    try {
      const { data, error } = await supabase.from("equipment").insert([newItem]).select();
      if (error) throw error;
      if (data && data[0]) {
        const updated = [...equipment, data[0]];
        updateLocalAndState(updated);
        return data[0];
      }
    } catch (err) {
      console.warn("Adding equipment offline fallback", err.message);
    }

    // Local fallback
    const localNewItem = {
      id: equipment.length > 0 ? Math.max(...equipment.map(e => e.id)) + 1 : 1,
      created_at: new Date().toISOString(),
      ...newItem
    };
    const updated = [...equipment, localNewItem];
    updateLocalAndState(updated);
    return localNewItem;
  };

  // 2. EDIT EQUIPMENT
  const editEquipment = async (id, updatedFields) => {
    const totalStock = parseInt(updatedFields.total_stock);
    const existing = equipment.find(e => e.id === id);
    const borrowedStock = existing ? existing.total_stock - existing.available_stock : 0;
    const availableStock = Math.max(0, totalStock - borrowedStock);

    const payload = {
      ...updatedFields,
      total_stock: totalStock,
      available_stock: availableStock,
      status: availableStock > 0 ? "Available" : "Out of Stock"
    };

    try {
      const { data, error } = await supabase.from("equipment").update(payload).eq("id", id).select();
      if (error) throw error;
      if (data && data[0]) {
        const updated = equipment.map(e => e.id === id ? data[0] : e);
        updateLocalAndState(updated);
        return data[0];
      }
    } catch (err) {
      console.warn("Editing equipment offline fallback", err.message);
    }

    // Local fallback
    const updated = equipment.map(e => e.id === id ? { ...e, ...payload } : e);
    updateLocalAndState(updated);
    return updated.find(e => e.id === id);
  };

  // 3. DELETE EQUIPMENT
  const deleteEquipment = async (id) => {
    try {
      const { error } = await supabase.from("equipment").delete().eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.warn("Deleting equipment offline fallback", err.message);
    }

    // Local fallback
    const updated = equipment.filter(e => e.id !== id);
    updateLocalAndState(updated);
    return true;
  };

  // 4. ADD BORROW RECORD (Check out equipment)
  const addBorrower = async (borrowRecord) => {
    const qty = parseInt(borrowRecord.quantity || 1);
    const equip = equipment.find(e => e.id === parseInt(borrowRecord.equipment_id));
    
    if (!equip || equip.available_stock < qty) {
      throw new Error("Cannot checkout: Not enough stock available!");
    }

    const newAvail = equip.available_stock - qty;
    const equipStatus = newAvail > 0 ? "Available" : "Out of Stock";

    const payload = {
      ...borrowRecord,
      quantity: qty,
      status: "Borrowed"
    };

    // Attempt database updates
    try {
      // Create borrow record
      const { data, error: borrErr } = await supabase.from("borrowers").insert([payload]).select();
      if (borrErr) throw borrErr;

      // Update stock
      const { error: eqErr } = await supabase.from("equipment")
        .update({ available_stock: newAvail, status: equipStatus })
        .eq("id", equip.id);
      
      if (eqErr) throw eqErr;

      if (data && data[0]) {
        fetchData(); // reload all to maintain sync
        return data[0];
      }
    } catch (err) {
      console.warn("Borrowing offline fallback", err.message);
    }

    // Local fallback
    const localBorr = {
      id: borrowers.length > 0 ? Math.max(...borrowers.map(b => b.id)) + 1 : 1,
      created_at: new Date().toISOString(),
      ...payload
    };
    
    const updatedBorr = [localBorr, ...borrowers];
    const updatedEq = equipment.map(e => e.id === equip.id ? { ...e, available_stock: newAvail, status: equipStatus } : e);
    
    updateLocalAndState(updatedEq, updatedBorr);
    return localBorr;
  };

  // 5. RETURN EQUIPMENT
  const returnEquipment = async (borrowerId, actualReturnDate, notes, returnedBy = "Admin") => {
    const record = borrowers.find(b => b.id === borrowerId);
    if (!record || record.status === "Returned") return;

    const equip = equipment.find(e => e.id === record.equipment_id);
    const returnQty = record.quantity || 1;
    const newAvail = equip ? equip.available_stock + returnQty : 0;
    const equipStatus = newAvail > 0 ? "Available" : "Out of Stock";

    try {
      const finalNotes = returnedBy ? `${notes}\n(Returned By: ${returnedBy})` : notes;

      // 1. Update Borrower Record (append returnedBy to notes since column might not exist)
      const { error: borrErr } = await supabase.from("borrowers")
        .update({ 
          status: "Returned", 
          actual_return_date: actualReturnDate, 
          notes: finalNotes
        })
        .eq("id", borrowerId);

      // 2. Update Equipment Stock
      if (equip) {
        const { error: eqErr } = await supabase.from("equipment")
          .update({ available_stock: newAvail, status: equipStatus })
          .eq("id", equip.id);
        if (eqErr) throw eqErr;
      }

      if (borrErr) throw borrErr;
      fetchData();
      return true;
    } catch (err) {
      console.warn("Returning equipment offline fallback", err.message);
    }

    // Local fallback
    const updatedBorr = borrowers.map(b => b.id === borrowerId ? { 
      ...b, 
      status: "Returned", 
      actual_return_date: actualReturnDate, 
      notes,
      returned_by: returnedBy
    } : b);
    
    const updatedEq = equipment.map(e => e.id === record.equipment_id ? { 
      ...e, 
      available_stock: newAvail, 
      status: equipStatus 
    } : e);

    updateLocalAndState(updatedEq, updatedBorr);
    return true;
  };

  // 6. ADD REQUEST (Public User submits booking request)
  const addRequest = async (requestData) => {
    // Strip fields not present in the requests table (e.g. notes)
    const { notes: _notes, ...safeData } = requestData;
    const payload = {
      ...safeData,
      status: "Pending"
    };

    try {
      const { data, error } = await supabase.from("requests").insert([payload]).select();
      if (error) throw error;
      if (data && data[0]) {
        const updated = [data[0], ...requests];
        updateLocalAndState(null, null, updated);
        return data[0];
      }
    } catch (err) {
      console.warn("Requesting equipment offline fallback", err.message);
    }

    // Local fallback
    const localReq = {
      id: requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1,
      created_at: new Date().toISOString(),
      ...payload
    };
    const updated = [localReq, ...requests];
    updateLocalAndState(null, null, updated);
    return localReq;
  };

  // 7. APPROVE / REJECT REQUEST
  const updateRequestStatus = async (requestId, status) => {
    try {
      const { data, error } = await supabase.from("requests")
        .update({ status })
        .eq("id", requestId)
        .select();
      if (error) throw error;

      // If approved, trigger borrow checkout automatically
      if (status === "Approved") {
        const req = requests.find(r => r.id === requestId);
        if (req) {
          const expectedReturn = new Date();
          expectedReturn.setDate(expectedReturn.getDate() + parseInt(req.duration || 30));

          await addBorrower({
            name: req.user_name,
            phone: req.phone,
            address: req.address,
            patient_name: req.patient_name,
            equipment_id: req.equipment_id,
            quantity: 1,
            borrow_date: new Date().toISOString().split("T")[0],
            expected_return_date: expectedReturn.toISOString().split("T")[0],
            notes: `Auto-created from request #${requestId}`
          });
        }
      }

      fetchData();
      return true;
    } catch (err) {
      console.warn("Request status update offline fallback", err.message);
    }

    // Local fallback
    const updated = requests.map(r => r.id === requestId ? { ...r, status } : r);
    updateLocalAndState(null, null, updated);

    // If approved offline, auto-borrow too
    if (status === "Approved") {
      const req = requests.find(r => r.id === requestId);
      if (req) {
        const expectedReturn = new Date();
        expectedReturn.setDate(expectedReturn.getDate() + parseInt(req.duration || 30));

        await addBorrower({
          name: req.user_name,
          phone: req.phone,
          address: req.address,
          patient_name: req.patient_name,
          equipment_id: req.equipment_id,
          quantity: 1,
          borrow_date: new Date().toISOString().split("T")[0],
          expected_return_date: expectedReturn.toISOString().split("T")[0],
          notes: `Auto-created from request #${requestId}`
        });
      }
    }
    return true;
  };

  // Statistics calculation (strictly following 120 total, 87 available, 33 borrowed, 4 overdue schema)
  const totalStockSum = equipment.reduce((sum, e) => sum + (e.total_stock || 0), 0);
  const availableStockSum = equipment.reduce((sum, e) => sum + (e.available_stock || 0), 0);
  const borrowedStockSum = totalStockSum - availableStockSum;

  // Overdue count helper
  const currentDate = new Date().toISOString().split("T")[0];
  const overdueCount = borrowers.filter(b => b.status === "Borrowed" && b.expected_return_date < currentDate).length;

  return {
    equipment,
    borrowers,
    requests,
    stats: {
      total: equipment.length > 0 ? totalStockSum : 120,
      available: equipment.length > 0 ? availableStockSum : 87,
      borrowed: equipment.length > 0 ? borrowedStockSum : 33,
      overdue: borrowers.length > 0 ? overdueCount : 4
    },
    loading,
    error,
    trustInfo,
    addEquipment,
    editEquipment,
    deleteEquipment,
    addBorrower,
    returnEquipment,
    addRequest,
    updateRequestStatus,
    refetch: fetchData
  };
}
