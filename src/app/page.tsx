import Link from "next/link";
import ProductList from "@/components/ProductList";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Our Clothing Store
          </h1>
          <p className="text-gray-600">
            Discover the latest fashion trends and styles
          </p>
        </div>
        <Link
          href="/products/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Add New Product
        </Link>
      </div>

      <ProductList />
    </div>
  );
}
