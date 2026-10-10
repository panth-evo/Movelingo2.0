import json
from pathlib import Path
from base import get_session, save_chunks

def ingest_relocation_data():
    """
    Person B task: Reads static relocation JSONs and pushes raw text to the database.
    (Person C will later add a step here to run the text through their embedding model before saving).
    """
    db = get_session()
    
    # Path to movelingo/data/countries
    countries_dir = Path(__file__).resolve().parent.parent / "countries"
    
    if not countries_dir.exists():
        print(f"Directory not found: {countries_dir}")
        return
        
    all_chunks = []
    
    for country_path in countries_dir.iterdir():
        if not country_path.is_dir():
            continue
            
        country_code = country_path.name.upper()
        relo_file = country_path / "relocation" / "relocation.json"
        
        if not relo_file.exists():
            continue
            
        with open(relo_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # 1. Parse Routes
        for route in data.get("routes", []):
            text = f"Route: {route.get('name')}. Purpose: {route.get('purpose')}. " \
                   f"Required Language Level: {route.get('required_language_level', 'None')}. " \
                   f"Eligibility: {' '.join(route.get('eligibility', []))}"
            all_chunks.append({
                "text": text,
                "country": country_code,
                "type": "visa_rule",
                "source": "relocation.json",
                "cefr": route.get("required_language_level")
            })
            
        # 2. Parse Checklist
        for item in data.get("checklist", []):
            text = f"Required Document: {item.get('label')}. " \
                   f"Needs Translation: {item.get('needs_translation')}. " \
                   f"Needs Apostille: {item.get('needs_apostille')}."
            all_chunks.append({
                "text": text,
                "country": country_code,
                "type": "visa_checklist",
                "source": "relocation.json"
            })
            
    if all_chunks:
        save_chunks(db, all_chunks)
    else:
        print("No relocation data found to ingest.")

if __name__ == "__main__":
    ingest_relocation_data()
