import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Clothing Store
          </Link>

          <div className="flex gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Home
            </Link>
            <Link
              href="/products/new"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Add Product
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
