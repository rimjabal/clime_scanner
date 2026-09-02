import qrcode
import os

# List of the 18 actual AC units / locations in the Hirschmann factory
equipements = [
    {"id": "OPEN-SPACE-A", "nom": "Open space A"},
    {"id": "SALLE-DAKHLA", "nom": "Salle Dakhla"},
    {"id": "SALLE-MARRAKECH", "nom": "Salle Marrakech"},
    {"id": "OPEN-SPACE-PROJET", "nom": "Open space Projet"},
    {"id": "VIDEO-CONFERENCE", "nom": "Video conference"},
    {"id": "MEETING-BOX-1", "nom": "Meeting Box 1"},
    {"id": "MEETING-BOX-2", "nom": "Meeting Box 2"},
    {"id": "OPEN-SPACE-LOGISTIQUE", "nom": "Open space logistique"},
    {"id": "SALLE-FES", "nom": "Salle Fes"},
    {"id": "SALLE-OUARZAZAT", "nom": "Salle Ouarzazat"},
    {"id": "COULOIR-RH", "nom": "Couloir RH"},
    {"id": "E-LEARNING-ROOM", "nom": "E-learning Room"},
    {"id": "SALLE-CHEFCHOUEN", "nom": "Salle chefchaouen"},
    {"id": "OPEN-SPACE-B1", "nom": "Open Space B 1"},
    {"id": "OPEN-SPACE-B2", "nom": "Open space B2"},
    {"id": "INCOMING-LAB", "nom": "Incomming Lab"},
    {"id": "WAREHOUSE-BOX-1", "nom": "Ware house box 1"},
    {"id": "WAREHOUSE-BOX-2", "nom": "Ware house box 2"}
]

# Output folder where QR code images will be saved inside 'Generateur_QR'
dossier_sortie = "QRCodes_Usine"
os.makedirs(dossier_sortie, exist_ok=True)

print("⏳ Starting QR code generation for Hirschmann factory...")

for equip in equipements:
    donnees_a_scanner = equip["nom"]  # This uses the exact text name when scanned
    
    # QR code configuration and error correction level
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H, # High correction for industrial use
        box_size=10,
        border=4,
    )
    
    qr.add_data(donnees_a_scanner)
    qr.make(fit=True)
    
    # Create the image in black & white
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save using a safe filename format
    safe_filename = equip["id"]
    chemin_fichier = f"{dossier_sortie}/{safe_filename}.png"
    img.save(chemin_fichier)
    print(f"✅ QR Code ready: {equip['nom']} -> {chemin_fichier}")

print(f"🎉 Done! Generated {len(equipements)} QR codes in the '{dossier_sortie}' folder.")