"use client";

import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users as UsersIcon } from "lucide-react";

interface CustomerData {
  name: string;
  phone: string;
  email: string;
  visits: number;
  lastVisit: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const q = query(collection(db, "appointments"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customerMap = new Map<string, CustomerData>();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const email = data.email?.toLowerCase().trim() || "";
        const phone = data.phone?.trim() || "";
        // use email as primary key, fallback to phone
        const key = email || phone;
        
        if (!key) return;

        if (customerMap.has(key)) {
          const existing = customerMap.get(key)!;
          existing.visits += 1;
          // Keep the most recent date simply by string comparison for simplicity, though real app would compare timestamps
          if (data.date > existing.lastVisit) {
            existing.lastVisit = data.date;
          }
          customerMap.set(key, existing);
        } else {
          customerMap.set(key, {
            name: data.name || "Unknown",
            phone: data.phone || "N/A",
            email: data.email || "N/A",
            visits: 1,
            lastVisit: data.date || "N/A"
          });
        }
      });

      const sortedCustomers = Array.from(customerMap.values()).sort((a, b) => b.visits - a.visits);
      setCustomers(sortedCustomers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <UsersIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm">View details of all your Unique clients.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Total Visits</th>
                <th className="px-6 py-4 font-semibold text-right">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    No customers found yet.
                  </td>
                </tr>
              ) : (
                customers.map((c, i) => (
                  <tr key={i} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4">{c.phone}</td>
                    <td className="px-6 py-4">{c.email}</td>
                    <td className="px-6 py-4 text-primary font-medium">
                      {c.visits} {c.visits === 1 ? 'visit' : 'visits'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400">{c.lastVisit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
