import { ProductSearchResult } from "../../app/search/search-products-type";
import { StoreSearchResult } from "../../app/search/search-stores-type";

export interface FetchFavsResponseType {
  products: ProductSearchResult[];
  stores: StoreSearchResult[];
}
