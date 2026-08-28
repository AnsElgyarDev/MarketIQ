using System;

namespace MarketIQ.Backend.Models
{
    public class Campaign
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public decimal Spend { get; set; }
        public int Conversions { get; set; }
        public decimal CostPerResult { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
