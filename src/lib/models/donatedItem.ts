export class DonatedItem {
    id: string;
    name: string; 
    category: string;
    sku: string | null; // stock keeping unit

    constructor(id: string, name: string, category: string, sku: string | null = null) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.sku = sku;
    }
}