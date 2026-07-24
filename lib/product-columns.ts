import type { Product } from "@/types/product";
import type { TableColumn } from "@/types/table-column";

export const PRODUCT_COLUMNS:
TableColumn<Product>[] = [

{
key:"sku",
label:"SKU",
sortable:true
},

{
key:"name",
label:"Producto",
sortable:true
},

{
key:"brand",
label:"Marca",
sortable:true
},

{
key:"price",
label:"Precio",
sortable:true
},

{
key:"stock",
label:"Stock",
sortable:true
},

{
key:"active",
label:"Activo"
}

];