export class DonatedItem {
    id: string;
    name: string; 
    category: string | null;
    sku: string | null; // stock keeping unit

    constructor(id: string, name: string, category: string | null = null, sku: string | null = null) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.sku = sku;
    }
}