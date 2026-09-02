using System.Linq;
using MarketIQ.Backend.MockData;
using MarketIQ.Backend.Models;

namespace MarketIQ.Backend.Services
{
    public class InMemoryCampaignService : ICampaignService
    {
        private readonly List<Campaign> _campaigns;

        public InMemoryCampaignService()
        {
            _campaigns = SeedData.Campaigns.ToList();
        }

        public IReadOnlyList<Campaign> GetAll() => _campaigns;

        public AnalyzeResponse Analyze(AnalyzeRequest request)
        {
            var response = new AnalyzeResponse();

            if (request.CampaignIds == null || request.CampaignIds.Count == 0)
            {
                return response; // caller will handle bad request
            }

            var selected = _campaigns.Where(c => request.CampaignIds.Contains(c.Id)).ToList();
            if (!selected.Any()) return response;

            var toScale = selected.OrderBy(c => c.CostPerResult).Take(3)
                .Select(c => $"{c.Name} (Platform: {c.Platform}) - CostPerResult: {c.CostPerResult:C}")
                .ToList();

            var toStop = selected.OrderByDescending(c => c.CostPerResult).Take(3)
                .Select(c => $"{c.Name} (Platform: {c.Platform}) - CostPerResult: {c.CostPerResult:C}")
                .ToList();

            response.WhatToScale = toScale;
            response.WhatToStop = toStop;
            response.Summary = $"Analyzed {selected.Count} campaign(s). Recommended scaling {toScale.Count} and stopping {toStop.Count}.";

            return response;
        }
    }
}
