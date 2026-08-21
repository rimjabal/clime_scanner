import qrcode
import os

# List of air conditioning units (you can replace this by fetching from your database)
equipements = [
    {"id": "CLIM-ZONE-A-01", "nom": "Production AC"},
    {"id": "CLIM-ZONE-B-02", "nom": "Storage AC"},
    {"id": "CLIM-ZONE-C-03", "nom": "Meeting AC"},
    {"id": "CLIM-ZONE-D-04", "nom": "Lab AC"}
]

# Output folder where QR code images will be saved
dossier_sortie = "QRCodes_Usine"
os.makedirs(dossier_sortie, exist_ok=True)

print("⏳ Starting QR code generation...")

for equip in equipements:
    donnees_a_scanner = equip["id"] 
    
    # QR code configuration and error correction level
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H, # High correction (useful if labels get slightly damaged)
        box_size=10,
        border=4,
    )
    
    qr.add_data(donnees_a_scanner)
    qr.make(fit=True)
    
    # Create the image in black & white
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save
    chemin_fichier = f"{dossier_sortie}/{donnees_a_scanner}.png"
    img.save(chemin_fichier)
    print(f"✅ QR Code ready: {chemin_fichier}")

print(f"🎉 Done! Generated {len(equipements)} QR codes in the '{dossier_sortie}' folder.")