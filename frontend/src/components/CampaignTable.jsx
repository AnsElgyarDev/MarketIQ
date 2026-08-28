import React, { useMemo } from "react";

export default function CampaignTable({
  campaigns: allCampaigns,
  selectedIds = [],
  setSelectedIds,
}) {
  const campaigns = useMemo(
    () =>
      (allCampaigns || []).filter(
        (c) => c.status === "Active" || c.Status === "Active",
      ),
    [allCampaigns],
  );

  function toggle(id) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(Array.from(next));
  }

  function toggleAll() {
    if ((selectedIds || []).length === campaigns.length) setSelectedIds([]);
    else setSelectedIds(campaigns.map((c) => c.id || c.Id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-[#66635B]">
          Showing {campaigns.length} active campaign(s)
        </div>
        <div className="text-sm">
          <button
            onClick={toggleAll}
            className="rounded-lg border border-[#E6E2DD] bg-white px-3 py-1.5 text-sm font-medium text-[#C65D3B] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#DA7756]/60 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#DA7756] focus:ring-offset-2 focus:ring-offset-[#FAF8F5]"
          >
            {(selectedIds || []).length === campaigns.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E6E2DD] bg-white/80 shadow-sm">
        <table className="min-w-full text-left">
          <thead>
            <tr
              className="text-sm text-[#66635B]"
              style={{ backgroundColor: "#F4F1EA" }}
            >
              <th className="py-3 pr-4 pl-4"> </th>
              <th className="py-3 pr-6">Name</th>
              <th className="py-3 pr-6">Platform</th>
              <th className="py-3 pr-6">Spend</th>
              <th className="py-3 pr-6">Conversions</th>
              <th className="py-3 pr-6">Cost / Result</th>
              <th className="py-3 pr-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const id = c.id || c.Id;
              const name = c.name || c.Name;
              const platform = c.platform || c.Platform;
              const spend = c.spend || c.Spend;
              const conversions = c.conversions || c.Conversions;
              const cost = c.costPerResult || c.CostPerResult;
              const status = c.status || c.Status;
              const isSelected = (selectedIds || []).includes(id);

              return (
                <tr
                  key={id}
                  onClick={() => toggle(id)}
                  className={`cursor-pointer border-b border-[#EFE9E2] transition-all duration-200 hover:bg-neutral-50 ${
                    isSelected ? "bg-amber-50/60 shadow-sm" : ""
                  }`}
                  style={{ borderColor: "#EFE9E2" }}
                >
                  <td className="py-3 pr-4 pl-4">
                    <input
                      aria-label={`select-${id}`}
                      className="h-4 w-4 rounded border-[#E6E2DD] bg-white text-[#C65D3B] shadow-sm focus:ring-2 focus:ring-[#DA7756] focus:ring-offset-2 focus:ring-offset-[#FAF8F5]"
                      type="checkbox"
                      checked={isSelected}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => toggle(id)}
                    />
                  </td>
                  <td className="py-3 pr-6 text-[#191919] font-medium">{name}</td>
                  <td className="py-3 pr-6 text-[#66635B]">{platform}</td>
                  <td className="py-3 pr-6 text-[#191919]">
                    ${Number(spend).toLocaleString()}
                  </td>
                  <td className="py-3 pr-6 text-[#191919]">{conversions}</td>
                  <td className="py-3 pr-6 text-[#191919]">
                    ${Number(cost).toFixed(2)}
                  </td>
                  <td className="py-3 pr-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        status === "Active"
                          ? "bg-[#E7F6EE] text-[#166534]"
                          : "bg-[#FFF4E6] text-[#7C2D12]"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-[#66635B]">
                  No active campaigns found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
