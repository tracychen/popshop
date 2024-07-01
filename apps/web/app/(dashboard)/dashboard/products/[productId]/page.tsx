import { EditProductDashboard } from "@/components/dashboard/edit-product";

export default function Page({ params }: { params: { productId: string } }) {
  return <EditProductDashboard productId={Number(params.productId)} />;
}
