import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import ProductForm from "@/components/ProductForm";

export default async function NewProductPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.role !== "admin") {
    redirect("/auth/login?redirect=/products/new");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6 font-medium"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-5">
            <h1 className="text-2xl font-bold">
              <i className="fas fa-plus-circle mr-3"></i>Add New Product
            </h1>
          </div>
          <div className="p-8">
            <ProductForm />
          </div>
        </div>
      </div>
    </div>
  );
}
