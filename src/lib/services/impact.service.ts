import { IDonationRepository, DonationFilters } from "@/lib/repositories/donation.repository.interface";
import { ImpactReportDTO } from "@/lib/dto/impactReport.dto";

export class ImpactService {
  constructor(private readonly repo: IDonationRepository) {}

  async getImpactReport(filters: DonationFilters = {}): Promise<ImpactReportDTO> {
    const [overall, byCategory, byRecipient, byMonth] = await Promise.all([
      this.repo.getOverallImpactSummary(filters),
      this.repo.getImpactByCategory(filters),
      this.repo.getImpactByRecipient(filters),
      this.repo.getImpactByMonth(filters),
    ]);

    return { overall, byCategory, byRecipient, byMonth };
  }
}
