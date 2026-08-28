using System.Collections.Generic;

namespace MarketIQ.Backend.Models
{
    public class AnalyzeResponse
    {
        public List<string> WhatToScale { get; set; } = new();
        public List<string> WhatToStop { get; set; } = new();
        public string Summary { get; set; } = string.Empty;
    }
}
