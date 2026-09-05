import { IDonationRepository } from "@/lib/repositories/donation.repository.interface";
import { ImpactReportDTO } from "@/lib/dto/impactReport.dto";

export class ImpactService {
  constructor(private readonly repo: IDonationRepository) {}

  async getImpactReport(): Promise<ImpactReportDTO> {
    const [overall, byCategory, byRecipient, byMonth] = await Promise.all([
      this.repo.getOverallImpactSummary(),
      this.repo.getImpactByCategory(),
      this.repo.getImpactByRecipient(),
      this.repo.getImpactByMonth(),
    ]);

    return { overall, byCategory, byRecipient, byMonth };
  }
}
