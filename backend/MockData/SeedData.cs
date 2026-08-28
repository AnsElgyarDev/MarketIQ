using System;
using System.Collections.Generic;
using MarketIQ.Backend.Models;

namespace MarketIQ.Backend.MockData
{
    public static class SeedData
    {
        public static List<Campaign> Campaigns { get; } = new List<Campaign>
        {
            new Campaign { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Name = "Spring Sale - Shoes", Platform = "Facebook", Spend = 1200m, Conversions = 120, CostPerResult = 10.00m, Status = "Active" },
            new Campaign { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Name = "Summer Promo - Sunglasses", Platform = "Google", Spend = 800m, Conversions = 40, CostPerResult = 20.00m, Status = "Active" },
            new Campaign { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Name = "Clearance - Jackets", Platform = "Instagram", Spend = 500m, Conversions = 10, CostPerResult = 50.00m, Status = "Paused" },
            new Campaign { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Name = "New Arrivals - Bags", Platform = "TikTok", Spend = 300m, Conversions = 30, CostPerResult = 10.00m, Status = "Active" },
            new Campaign { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), Name = "Brand Awareness", Platform = "LinkedIn", Spend = 1500m, Conversions = 15, CostPerResult = 100.00m, Status = "Active" },
        };
    }
}
