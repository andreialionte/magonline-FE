export default interface Product {
    id: string;
    name: string;
    subcategory?: string;
    category?: string;
    price: number;
    quantity: number;
    sellerName?: string;
  }