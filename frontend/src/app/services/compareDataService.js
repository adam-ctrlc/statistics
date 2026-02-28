import axios from "axios";
import { API_BASE_URL } from "../lib/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const compareDataService = {
  /**
   * Fetch comparison options (programs, schools, years, months)
   * @returns {Promise<Object>} Promise resolving to comparison options
   */
  async getComparisonOptions() {
    try {
      const programsResponse = await apiClient.get(`/programs`);
      const schoolsResponse = await apiClient.get(`/schools`);
      const statsResponse = await apiClient.get(`/statistics-data`);
      const years = Array.from(
        new Set(statsResponse.data.data.map((item) => item.exam_year_taken))
      )
        .filter(Boolean)
        .sort((a, b) => b - a);
      const months = Array.from(
        new Set(statsResponse.data.data.map((item) => item.exam_month_taken))
      )
        .filter(Boolean)
        .sort();

      return {
        programs: programsResponse.data.map((p) => ({
          id: p._id,
          name: p.program,
        })),
        schools: schoolsResponse.data.map((s) => ({
          id: s._id,
          name: s.school,
        })),
        years,
        months,
      };
    } catch (error) {
      console.error("Error fetching comparison options:", error);
      throw new Error("Failed to fetch comparison options");
    }
  },

  /**
   * Compare data based on provided criteria
   * @param {Object} criteria - Comparison criteria
   * @returns {Promise<Object>} Promise resolving to comparison results
   */
  async compareData(criteria) {
    try {
      // Fetch statistics for primary selection
      const primaryParams = { programId: criteria.primaryProgram };
      if (criteria.primarySchool)
        primaryParams.schoolId = criteria.primarySchool;
      if (criteria.primaryYear) primaryParams.year = criteria.primaryYear;
      if (criteria.primaryMonth) primaryParams.month = criteria.primaryMonth;
      const primaryResponse = await apiClient.get(
        `/statistics-data`,
        { params: primaryParams }
      );

      // Fetch statistics for secondary selection
      const secondaryParams = { programId: criteria.secondaryProgram };
      if (criteria.secondarySchool)
        secondaryParams.schoolId = criteria.secondarySchool;
      if (criteria.secondaryYear) secondaryParams.year = criteria.secondaryYear;
      if (criteria.secondaryMonth)
        secondaryParams.month = criteria.secondaryMonth;
      const secondaryResponse = await apiClient.get(
        `/statistics-data`,
        { params: secondaryParams }
      );

      // Fetch national passing rates if applicable (assuming endpoint supports filters)
      let primaryNational = null,
        secondaryNational = null;
      if (criteria.primaryYear && criteria.primaryMonth) {
        const primaryNatParams = {
          year: criteria.primaryYear,
          month: criteria.primaryMonth,
          programId: criteria.primaryProgram,
        };
        const primaryNatResponse = await apiClient.get(
          `/national-passing-rates`,
          { params: primaryNatParams }
        );
        primaryNational = primaryNatResponse.data[0] || null;
      }
      if (criteria.secondaryYear && criteria.secondaryMonth) {
        const secondaryNatParams = {
          year: criteria.secondaryYear,
          month: criteria.secondaryMonth,
          programId: criteria.secondaryProgram,
        };
        const secondaryNatResponse = await apiClient.get(
          `/national-passing-rates`,
          { params: secondaryNatParams }
        );
        secondaryNational = secondaryNatResponse.data[0] || null;
      }

      // Structure the response to match what the components expect
      // This is a simplified structure, adjust based on actual API response data
      return {
        primary: {
          name:
            primaryResponse.data.summary?.program_name ||
            criteria.primaryProgram ||
            "Primary",
          school:
            primaryResponse.data.summary?.school_name ||
            criteria.primarySchool ||
            "All Schools",
          totalCount: primaryResponse.data.summary?.total_students || 0,
          passedCount: primaryResponse.data.summary?.passed_students || 0,
          failedCount:
            (primaryResponse.data.summary?.total_students || 0) -
            (primaryResponse.data.summary?.passed_students || 0),
          passRate: primaryResponse.data.summary?.overall_passing_rate || 0,
          failRate: primaryResponse.data.summary?.total_students
            ? 100 - (primaryResponse.data.summary?.overall_passing_rate || 0)
            : 0,
          firstTimeTakers:
            primaryResponse.data.summary?.first_time_takers ?? null,
          firstTimePassRate:
            primaryResponse.data.summary?.first_time_pass_rate ?? null,
          retakers: primaryResponse.data.summary?.retakers ?? null,
          retakerPassRate:
            primaryResponse.data.summary?.retaker_pass_rate ?? null,
          maleCount: primaryResponse.data.summary?.gender?.male?.count ?? null,
          malePct:
            primaryResponse.data.summary?.gender?.male?.percentage ?? null,
          femaleCount:
            primaryResponse.data.summary?.gender?.female?.count ?? null,
          femalePct:
            primaryResponse.data.summary?.gender?.female?.percentage ?? null,
          otherCount:
            primaryResponse.data.summary?.gender?.other?.count ?? null,
          otherPct:
            primaryResponse.data.summary?.gender?.other?.percentage ?? null,
        },
        secondary: {
          name:
            secondaryResponse.data.summary?.program_name ||
            criteria.secondaryProgram ||
            "Secondary",
          school:
            secondaryResponse.data.summary?.school_name ||
            criteria.secondarySchool ||
            "All Schools",
          totalCount: secondaryResponse.data.summary?.total_students || 0,
          passedCount: secondaryResponse.data.summary?.passed_students || 0,
          failedCount:
            (secondaryResponse.data.summary?.total_students || 0) -
            (secondaryResponse.data.summary?.passed_students || 0),
          passRate: secondaryResponse.data.summary?.overall_passing_rate || 0,
          failRate: secondaryResponse.data.summary?.total_students
            ? 100 - (secondaryResponse.data.summary?.overall_passing_rate || 0)
            : 0,
          firstTimeTakers:
            secondaryResponse.data.summary?.first_time_takers ?? null,
          firstTimePassRate:
            secondaryResponse.data.summary?.first_time_pass_rate ?? null,
          retakers: secondaryResponse.data.summary?.retakers ?? null,
          retakerPassRate:
            secondaryResponse.data.summary?.retaker_pass_rate ?? null,
          maleCount:
            secondaryResponse.data.summary?.gender?.male?.count ?? null,
          malePct:
            secondaryResponse.data.summary?.gender?.male?.percentage ?? null,
          femaleCount:
            secondaryResponse.data.summary?.gender?.female?.count ?? null,
          femalePct:
            secondaryResponse.data.summary?.gender?.female?.percentage ?? null,
          otherCount:
            secondaryResponse.data.summary?.gender?.other?.count ?? null,
          otherPct:
            secondaryResponse.data.summary?.gender?.other?.percentage ?? null,
        },
        primaryNational,
        secondaryNational,
      };
    } catch (error) {
      console.error("Error comparing data:", error);
      throw new Error("Failed to compare data");
    }
  },

  async getMonthsAndYearsByProgram(programId) {
    try {
      const statsResponse = await apiClient.get(`/statistics-data`, {
        params: { programId },
      });
      const years = Array.from(
        new Set(statsResponse.data.data.map((item) => item.exam_year_taken))
      )
        .filter(Boolean)
        .sort((a, b) => b - a);
      const months = Array.from(
        new Set(statsResponse.data.data.map((item) => item.exam_month_taken))
      )
        .filter(Boolean)
        .sort();
      return { years, months };
    } catch (error) {
      console.error("Error fetching months/years for program:", error);
      throw new Error("Failed to fetch months/years for program");
    }
  },
};
