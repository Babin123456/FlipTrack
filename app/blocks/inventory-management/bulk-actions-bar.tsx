import { IconDownload, IconCheck, IconTrash } from "@tabler/icons-react";
import styles from "./bulk-actions-bar.module.css";
import { useFetcher } from "react-router";

interface Props { className?: string; count: number; onClear: () => void; selectedIds: string[]; items: any[]; }

export function BulkActionsBar({ className, count, onClear, selectedIds, items }: Props) {
  const fetcher = useFetcher();

  const handleExportCsv = () => {
    const selectedItems = items.filter(item => selectedIds.includes(item.id));
    const csvContent = "SKU,Name,Brand,Size,Purchase Price,Market Value\n" + 
      selectedItems.map(item => [
        `"${item.sku}"`,
        `"${item.name}"`,
        `"${item.brand}"`,
        `"${item.size}"`,
        item.purchasePrice,
        item.marketValue || ""
      ].join(",")).join("\n");
      
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fliptrack_inventory_export.csv";
    a.click();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete these items?")) {
      const formData = new FormData();
      formData.append("intent", "bulk-delete");
      selectedIds.forEach(id => formData.append("ids", id));
      fetcher.submit(formData, { method: "post" });
    }
  };

  const handleMarkSold = () => {
    const formData = new FormData();
    formData.append("intent", "bulk-mark-sold");
    selectedIds.forEach(id => formData.append("ids", id));
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div className={[styles.bar, className].filter(Boolean).join(" ")}>
      <span className={styles.count}>{count} selected</span>
      <div className={styles.actions}>
        <button className={styles.btn} onClick={handleExportCsv}><IconDownload size={13} style={{ display: "inline", marginRight: 4 }} />Export CSV</button>
        <button className={styles.btn} onClick={handleMarkSold}><IconCheck size={13} style={{ display: "inline", marginRight: 4 }} />Mark as Sold</button>
        <button className={[styles.btn, styles.btnDanger].join(" ")} onClick={handleDelete}><IconTrash size={13} style={{ display: "inline", marginRight: 4 }} />Delete</button>
      </div>
      <button className={styles.clearBtn} onClick={onClear}>Clear selection</button>
    </div>
  );
}
