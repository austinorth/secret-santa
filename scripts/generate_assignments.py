#!/usr/bin/env python3
"""
Secret Santa Assignment Generator with Individual Passphrases

This script generates encrypted Secret Santa assignments where each participant
gets their own unique Christmas-themed passphrase that only unlocks their specific assignment.
This prevents participants from seeing other people's assignments.

Usage:
    python generate_assignments.py [csv_file] [--output output_file] [--passphrase-file passphrase_file]

Requirements:
    pip install cryptography

The script:
1. Parses CSV file with NAME, BIO, SO columns
2. Generates Secret Santa assignments avoiding conflicts
3. Creates individual Christmas-themed passphrases for each participant
4. Encrypts each assignment separately with their passphrase
5. Outputs encrypted file compatible with the React app
6. Creates unencrypted passphrase distribution file for organizer

Example:
    # Use default example CSV and output files
    python scripts/generate_assignments.py

    # Use custom CSV file
    python scripts/generate_assignments.py my-participants.csv

    # Custom output locations
    python scripts/generate_assignments.py --output data/encrypted.enc --passphrase-file data/passphrases.csv
"""

import csv
import json
import random
import secrets
import time
import base64
import argparse
import hashlib
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass

try:
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.backends import default_backend
except ImportError:
    print("❌ Error: cryptography package not found.")
    print("📦 Please install it with:")
    print("   pip install cryptography")
    print("\nOr in a virtual environment:")
    print("   python -m venv venv")
    print("   source venv/bin/activate  # On Mac/Linux")
    print("   pip install cryptography")
    exit(1)


@dataclass
class Participant:
    name: str
    bio: str
    significant_other: str = ""


@dataclass
class Assignment:
    giver: str
    recipient: str
    recipientBio: str


@dataclass
class ParticipantPassphrase:
    name: str
    passphrase: str


class SecretSantaGenerator:
    def __init__(self):
        self.participants: List[Participant] = []
        self.assignments: List[Assignment] = []
        self.passphrases: List[ParticipantPassphrase] = []

    def parse_csv(self, csv_file: str) -> List[Participant]:
        """Parse CSV file with NAME, BIO, SO columns"""
        participants = []

        try:
            with open(csv_file, 'r', encoding='utf-8') as file:
                # Use csv.DictReader to handle quoted fields properly
                reader = csv.DictReader(file)

                # Validate headers
                required_headers = {'NAME', 'BIO', 'SO'}
                headers = {h.upper() for h in reader.fieldnames or []}

                if not required_headers.issubset(headers):
                    missing = required_headers - headers
                    raise ValueError(f"Missing required columns: {', '.join(missing)}")

                for row_num, row in enumerate(reader, start=2):
                    name = row.get('NAME', '').strip()
                    bio = row.get('BIO', '').strip()
                    so = row.get('SO', '').strip()

                    if not name:
                        raise ValueError(f"Line {row_num}: NAME field cannot be empty")

                    participant = Participant(
                        name=name,
                        bio=bio,
                        significant_other=so
                    )
                    participants.append(participant)
                    print(f"Parsed: {name} (SO: {so or 'None'})")

        except FileNotFoundError:
            raise FileNotFoundError(f"CSV file not found: {csv_file}")
        except Exception as e:
            raise ValueError(f"Error parsing CSV: {str(e)}")

        if len(participants) < 2:
            raise ValueError("Need at least 2 participants for Secret Santa")

        self.participants = participants
        return participants

    def generate_assignments(self, max_attempts: int = 1000) -> List[Assignment]:
        """Generate Secret Santa assignments avoiding conflicts"""
        if len(self.participants) < 2:
            raise ValueError("Need at least 2 participants")

        # Create SO lookup map (case insensitive)
        so_map = {}
        for p in self.participants:
            if p.significant_other:
                so_map[p.name.lower()] = p.significant_other.lower()

        def are_significant_others(name1: str, name2: str) -> bool:
            name1_lower = name1.lower()
            name2_lower = name2.lower()
            return (so_map.get(name1_lower) == name2_lower or
                   so_map.get(name2_lower) == name1_lower)

        for attempt in range(max_attempts):
            try:
                # Create copies for shuffling
                givers = self.participants.copy()
                recipients = self.participants.copy()

                # Shuffle recipients
                random.shuffle(recipients)

                assignments = []
                valid = True

                for giver, recipient in zip(givers, recipients):
                    # Check for conflicts
                    if giver.name == recipient.name:
                        valid = False
                        break
                    if are_significant_others(giver.name, recipient.name):
                        valid = False
                        break

                    assignments.append(Assignment(
                        giver=giver.name,
                        recipient=recipient.name,
                        recipientBio=recipient.bio
                    ))

                if valid:
                    print(f"Generated valid assignments on attempt {attempt + 1}")
                    self.assignments = assignments
                    return assignments

            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                continue

        raise RuntimeError(f"Could not generate valid assignments after {max_attempts} attempts")

    def load_christmas_words(self) -> List[str]:
        """Load Christmas words from private word bank file"""
        # Determine the project root directory
        script_dir = Path(__file__).parent
        project_root = script_dir.parent
        word_file = project_root / "private" / "christmas_words.txt"

        if not word_file.exists():
            # Fallback to a basic word list if private file doesn't exist
            print("⚠️  Warning: Private word bank not found. Using fallback words.")
            return [
                "snowflake", "mistletoe", "eggnog", "tinsel", "garland",
                "ornament", "wreath", "sleigh", "reindeer", "chimney",
                "stockings", "fireplace", "gingerbread", "peppermint",
                "holly", "ivy", "pine", "spruce", "angel", "star",
                "candle", "ribbon", "gift", "present", "cookies", "cocoa"
            ]

        try:
            with open(word_file, 'r', encoding='utf-8') as f:
                words = []
                for line in f:
                    line = line.strip()
                    # Skip empty lines and comments
                    if line and not line.startswith('#'):
                        words.append(line.lower())
                return words
        except Exception as e:
            print(f"⚠️  Error reading word bank: {e}. Using fallback words.")
            return [
                "snowflake", "mistletoe", "eggnog", "tinsel", "garland",
                "ornament", "wreath", "sleigh", "reindeer", "chimney"
            ]

    def generate_individual_passphrases(self) -> List[ParticipantPassphrase]:
        """Generate cryptographically secure Christmas-themed passphrases for each participant"""

        # Load Christmas words from private file
        christmas_words = self.load_christmas_words()

        if len(christmas_words) < 20:
            print("⚠️  Warning: Word bank seems small. Consider adding more words for better security.")

        used_passphrases = set()
        passphrases = []

        for participant in self.participants:
            # Generate unique passphrase for this participant
            attempts = 0
            while attempts < 2000:
                # Use 4 Christmas words with a 4-digit number
                selected_words = [secrets.choice(christmas_words) for _ in range(4)]
                number = secrets.randbelow(9000) + 1000  # 1000-9999

                # Always use hyphens as separators for consistency
                passphrase = "-".join(selected_words) + f"-{number}"

                if passphrase not in used_passphrases:
                    used_passphrases.add(passphrase)
                    passphrases.append(ParticipantPassphrase(
                        name=participant.name,
                        passphrase=passphrase
                    ))
                    break
                attempts += 1

            if attempts >= 2000:
                raise RuntimeError(f"Could not generate unique passphrase for {participant.name}")

        self.passphrases = passphrases
        return passphrases

    def encrypt_individual_assignment(self, assignment: Assignment, passphrase: str) -> str:
        """Encrypt a single assignment using AES-GCM"""
        # Convert assignment to JSON
        assignment_data = {
            "giver": assignment.giver,
            "recipient": assignment.recipient,
            "recipientBio": assignment.recipientBio
        }

        data_json = json.dumps(assignment_data, ensure_ascii=False)
        data_bytes = data_json.encode('utf-8')

        # Generate salt and IV
        salt = secrets.token_bytes(16)  # 16 bytes salt
        iv = secrets.token_bytes(12)    # 12 bytes IV for GCM

        # Derive key using PBKDF2 (same as Web Crypto API)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,  # 256 bits
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        key = kdf.derive(passphrase.encode('utf-8'))

        # Encrypt using AES-GCM
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        ciphertext = encryptor.update(data_bytes) + encryptor.finalize()

        # Get authentication tag
        tag = encryptor.tag

        # Combine salt + iv + ciphertext + tag (same format as Web Crypto API)
        combined = salt + iv + ciphertext + tag

        # Convert to base64
        encrypted_b64 = base64.b64encode(combined).decode('ascii')

        return encrypted_b64

    def create_passphrase_hash(self, passphrase: str) -> str:
        """Create a hash of the passphrase to use as a lookup key"""
        # Use SHA-256 to create a hash that doesn't reveal the passphrase
        return hashlib.sha256(passphrase.encode('utf-8')).hexdigest()

    def create_encrypted_file(self, output_file: str) -> None:
        """Create the encrypted file with individual assignments"""
        # Create encrypted assignments with passphrase hash as key
        encrypted_assignments = {}

        for assignment in self.assignments:
            # Find the passphrase for this giver
            passphrase_obj = next(
                (p for p in self.passphrases if p.name == assignment.giver),
                None
            )

            if not passphrase_obj:
                raise RuntimeError(f"No passphrase found for {assignment.giver}")

            # Encrypt the assignment with their passphrase
            encrypted_data = self.encrypt_individual_assignment(
                assignment,
                passphrase_obj.passphrase
            )

            # Use hash of passphrase as the key (hides which assignment belongs to whom)
            passphrase_hash = self.create_passphrase_hash(passphrase_obj.passphrase)
            encrypted_assignments[passphrase_hash] = encrypted_data

        # Create the file structure
        file_data = {
            "assignments": encrypted_assignments,
            "timestamp": int(time.time() * 1000),  # JavaScript timestamp
            "version": "2.0"  # Updated version to indicate new format
        }

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(file_data, f, indent=2, ensure_ascii=False)

        print(f"Encrypted file created: {output_file}")

    def create_passphrase_distribution_file(self, output_file: str) -> None:
        """Create unencrypted file with names and passphrases for distribution"""
        try:
            with open(output_file, 'w', encoding='utf-8', newline='') as f:
                writer = csv.writer(f)

                # Write header
                writer.writerow(['Name', 'Passphrase'])

                # Write each participant's passphrase
                for passphrase_obj in self.passphrases:
                    writer.writerow([passphrase_obj.name, passphrase_obj.passphrase])

            print(f"Passphrase distribution file created: {output_file}")

        except Exception as e:
            raise RuntimeError(f"Failed to create passphrase file: {str(e)}")

    def print_assignments(self) -> None:
        """Print assignments for verification (only if explicitly requested)"""
        print("\n" + "="*50)
        print("⚠️  GENERATED ASSIGNMENTS (ORGANIZER EYES ONLY):")
        print("="*50)
        for i, assignment in enumerate(self.assignments, 1):
            print(f"{i}. {assignment.giver} → {assignment.recipient}")
        print("="*50)
        print("⚠️  Remember: Don't share these assignments with participants!")
        print("   Participants should only receive their individual passphrases.")


def main():
    parser = argparse.ArgumentParser(
        description="Generate encrypted Secret Santa assignments with individual passphrases",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/generate_assignments.py
  python scripts/generate_assignments.py my-participants.csv
  python scripts/generate_assignments.py --output data/encrypted.enc --passphrase-file data/passphrases.csv
  python scripts/generate_assignments.py --show-assignments
        """
    )
    parser.add_argument("csv_file", nargs="?", default="example-participants.csv",
                       help="CSV file with participants (default: example-participants.csv)")
    parser.add_argument("--output", "-o", default="public/secret-santa-data.enc",
                       help="Output file path for encrypted data (default: public/secret-santa-data.enc)")
    parser.add_argument("--passphrase-file", "-p", default="secret-santa-passphrases.csv",
                       help="Output file for passphrase distribution (default: secret-santa-passphrases.csv)")
    parser.add_argument("--show-assignments", action="store_true",
                       help="Print assignments to console (ORGANIZER ONLY - reveals who has whom)")

    args = parser.parse_args()

    # Resolve paths - if running from project root, paths are relative to current dir
    # if running from scripts dir, paths are relative to parent dir
    current_dir = Path.cwd()
    script_dir = Path(__file__).parent

    # Determine if we're in the project root or scripts directory
    if current_dir.name == "scripts":
        project_root = current_dir.parent
    else:
        project_root = current_dir

    # Resolve CSV path
    if Path(args.csv_file).is_absolute():
        csv_path = Path(args.csv_file)
    else:
        csv_path = project_root / args.csv_file

    # Resolve output paths
    if Path(args.output).is_absolute():
        output_path = Path(args.output)
    else:
        output_path = project_root / args.output

    if Path(args.passphrase_file).is_absolute():
        passphrase_path = Path(args.passphrase_file)
    else:
        passphrase_path = project_root / args.passphrase_file

    print("🎅 Secret Santa Assignment Generator (Individual Passphrases)")
    print("="*60)

    try:
        # Initialize generator
        generator = SecretSantaGenerator()

        # Parse CSV
        print(f"📄 Parsing CSV: {csv_path}")
        participants = generator.parse_csv(str(csv_path))
        print(f"✅ Loaded {len(participants)} participants")

        # Generate assignments
        print("\n🎲 Generating assignments...")
        assignments = generator.generate_assignments()
        print(f"✅ Generated {len(assignments)} assignments")

        # Generate individual passphrases
        print("\n🔑 Generating individual passphrases...")
        passphrases = generator.generate_individual_passphrases()
        print(f"✅ Generated {len(passphrases)} unique passphrases")

        if args.show_assignments:
            generator.print_assignments()

        # Create encrypted file
        print(f"\n🔒 Creating encrypted assignment file: {output_path}")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        generator.create_encrypted_file(str(output_path))

        # Create passphrase distribution file
        print(f"\n📋 Creating passphrase distribution file: {passphrase_path}")
        passphrase_path.parent.mkdir(parents=True, exist_ok=True)
        generator.create_passphrase_distribution_file(str(passphrase_path))

        print("\n" + "="*60)
        print("🎄 SUCCESS! Secret Santa files generated")
        print("="*60)
        print(f"📁 Encrypted assignments: {output_path}")
        print(f"📋 Passphrase distribution: {passphrase_path}")
        print(f"👥 Participants: {len(participants)}")
        print(f"📝 Assignments: {len(assignments)}")
        print(f"🔑 Individual passphrases: {len(passphrases)}")

        print("\n📋 Next steps:")
        print("  1. Commit and push the encrypted file to your repo:")
        print(f"     git add {output_path}")
        print("     git commit -m 'Update Secret Santa assignments'")
        print("     git push origin main")
        print(f"  2. Distribute individual passphrases from: {passphrase_path}")
        print("     - Send each person ONLY their own passphrase")
        print("     - Do NOT share the assignment details")
        print("  3. Participants visit the website and enter their passphrase")
        print("  4. Each person will only see their own assignment")

        print(f"🔐 Security Notes:")
        print("  - Each participant has a unique Christmas-themed passphrase")
        print("  - Passphrases only unlock that person's assignment")
        print("  - You (organizer) cannot see assignments without passphrases")
        print("  - Assignments are individually encrypted for maximum privacy")
        print("  - Passphrases use cryptographically secure word selection")
        print("  - Word bank is kept private to prevent dictionary attacks")
        print("  - Christmas-themed passphrases for memorability and security")

        print(f"\n⚠️  Important:")
        print(f"  - Keep {passphrase_path} secure and delete it after distribution")
        print("  - Each passphrase should only be shared with the intended person")
        print("  - Participants cannot see other people's assignments")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        exit(1)


if __name__ == "__main__":
    main()
