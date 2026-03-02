"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error("You must be logged in.");
        if (response.status === 403) throw new Error("Admin access required.");
        throw new Error(data.error || "Failed to delete product");
      }

      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Failed to delete product. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {loading ? "Deleting..." : "Delete Product"}
    </button>
  );
}
