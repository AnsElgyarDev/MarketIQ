using System.Collections.Generic;
using MarketIQ.Backend.Models;

namespace MarketIQ.Backend.Services
{
    public interface ICampaignService
    {
        IReadOnlyList<Campaign> GetAll();
        AnalyzeResponse Analyze(AnalyzeRequest request);
    }
}
