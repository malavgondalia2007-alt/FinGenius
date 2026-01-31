
/* =========================================
   TYPES
========================================= */

export interface SipRecommendation {
  sip_name: string;
  risk_level: "Low" | "Moderate" | "High";
  recommended_amount: number;
  description: string;
}

/* =========================================
   API BASE URL
========================================= */

const API_BASE_URL = "http://127.0.0.1:8000";

/* =========================================
   TOKEN HELPER
========================================= */

const getAuthToken = (): string | null => {
  return localStorage.getItem("fingenius_token");
};

/* =========================================
   SIP API CALL
========================================= */

export const getSipRecommendations = async (): Promise<SipRecommendation[]> => {
  const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/sip/recommendations`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Failed to fetch SIP recommendations",
    }));
    throw new Error(error.detail);
  }

  return response.json();
};
