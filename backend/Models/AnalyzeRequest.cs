using System;
using System.Collections.Generic;

namespace MarketIQ.Backend.Models
{
    public class AnalyzeRequest
    {
        public List<Guid> CampaignIds { get; set; } = new();
    }
}
