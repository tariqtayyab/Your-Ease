import { useParams } from "react-router-dom";
export default function Product() {
  const { id } = useParams();
  return <div className="p-10 text-center">Product detail for <strong>{id}</strong></div>;
}
