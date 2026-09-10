/**
 * iGOT Karmayogi Bharat runs on the Sunbird stack; course discovery and
 * enrollment happen through Sunbird's "Content" and "Learner State" APIs,
 * fronted internally at MoSPI as "Wattson" reporting endpoints.
 *
 * This client is a typed seam: swap MOCK_MODE off and point
 * IGOT_API_BASE_URL / IGOT_SERVICE_TOKEN at real sandbox credentials once
 * issued, without touching any calling code in app/api/igot/sync/route.ts.
 */

const IGOT_API_BASE_URL = process.env.IGOT_API_BASE_URL;
const IGOT_SERVICE_TOKEN = process.env.IGOT_SERVICE_TOKEN;
const MOCK_MODE = !IGOT_API_BASE_URL || !IGOT_SERVICE_TOKEN;

export interface IgotCourseMetadata {
  igotCourseId: string;
  title: string;
  frameworkId: string;
  competencyCodes: string[];
  durationHours: number;
  courseUrl: string;
}

export interface IgotEnrollmentResult {
  igotCourseId: string;
  status: "enrolled" | "already_enrolled" | "in_progress";
  enrolledAt: string;
}

export async function fetchCourseMetadata(igotCourseId: string): Promise<IgotCourseMetadata> {
  if (MOCK_MODE) {
    return {
      igotCourseId,
      title: "CPI Compilation: Advanced Index Methods",
      frameworkId: "mospi-frac-v1",
      competencyCodes: ["FN-STAT-014", "DM-PRICE-002"],
      durationHours: 6,
      courseUrl: "https://igotkarmayogi.gov.in/",
    };
  }

  const res = await fetch(`${IGOT_API_BASE_URL}/content/v3/read/${igotCourseId}`, {
    headers: { Authorization: `Bearer ${IGOT_SERVICE_TOKEN}` },
  });
  if (!res.ok) throw new Error(`iGOT metadata fetch failed: ${res.status}`);
  return res.json();
}

export async function enrollInIgotCourse(params: {
  igotUserId: string;
  igotCourseId: string;
}): Promise<IgotEnrollmentResult> {
  if (MOCK_MODE) {
    // Simulated network latency so the UI's "Syncing…" state is visible
    // during local development without real credentials.
    await new Promise((resolve) => setTimeout(resolve, 700));
    return {
      igotCourseId: params.igotCourseId,
      status: "enrolled",
      enrolledAt: new Date().toISOString(),
    };
  }

  const res = await fetch(`${IGOT_API_BASE_URL}/course/v1/enrol`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${IGOT_SERVICE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: params.igotUserId, courseId: params.igotCourseId }),
  });
  if (!res.ok) throw new Error(`iGOT enrollment failed: ${res.status}`);
  return res.json();
}
