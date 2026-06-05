import csv
import os

CSV_PATH = r"C:\Users\NISHAKART\Documents\GitHub\MLOPS\DAY 2\unified_multimodal_ecommerce_products_dataset.csv"
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "knowledge_base", "ecommerce_products.txt")
OLD_DOCS_PATH = os.path.join(os.path.dirname(__file__), "knowledge_base", "ecommerce_docs.txt")

def generate_text_knowledge_base(num_rows=150):
    if not os.path.exists(CSV_PATH):
        print(f"Error: Could not find CSV dataset at {CSV_PATH}")
        return

    print(f"Reading first {num_rows} rows from {CSV_PATH}...")
    
    products_text = []
    
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            if count >= num_rows:
                break
                
            name = row.get("product_name", "Unknown").strip()
            brand = row.get("brand", "Unknown").strip()
            retail_price = row.get("retail_price", "N/A").strip()
            discounted_price = row.get("discounted_price", "N/A").strip()
            category = row.get("product_category_tree", "N/A").strip()
            description = row.get("description", "No description").strip()
            
            # Format the product info nicely for RAG
            product_info = f"PRODUCT: {name}\n"
            product_info += f"BRAND: {brand}\n"
            product_info += f"PRICE: Rs. {discounted_price} (Retail: Rs. {retail_price})\n"
            product_info += f"CATEGORY: {category}\n"
            product_info += f"DESCRIPTION: {description}\n"
            product_info += "-" * 50
            
            products_text.append(product_info)
            count += 1

    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    # Write new file
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n\n".join(products_text))
        
    print(f"Successfully generated {OUTPUT_PATH} with {count} products.")
    
    # Remove old mock file if it exists
    if os.path.exists(OLD_DOCS_PATH):
        os.remove(OLD_DOCS_PATH)
        print(f"Removed old mock data file: {OLD_DOCS_PATH}")

if __name__ == "__main__":
    generate_text_knowledge_base()
