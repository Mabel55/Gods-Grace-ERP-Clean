const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const BASE_URL = `${API_BASE_URL}`;

export const api = {
  getReportCard: async (studentId, term, session) => {
    const url = `${BASE_URL}/reports/report-card/${studentId}?term=${encodeURIComponent(term)}&academic_session=${encodeURIComponent(session)}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch report card data");
    }
    return response.json();
  }
};