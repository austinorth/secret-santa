#!/usr/bin/env python3
"""
Secret Santa Assignment Generator

This script replaces the problematic Web Crypto API functionality with a Python-based
solution that generates encrypted Secret Santa assignments compatible with the React app.

Usage:
    python generate_assignments.py [csv_file] [--output output_file] [--passphrase custom_passphrase]

Requirements:
    pip install cryptography

The script:
1. Parses CSV file with NAME, BIO, SO columns
2. Generates Secret Santa assignments avoiding conflicts
3. Encrypts data using AES-GCM (same format as Web Crypto API)
4. Outputs encrypted file compatible with the React app

Example:
    # Use default example CSV and output to public/secret-santa-data.enc
    python scripts/generate_assignments.py

    # Use custom CSV file
    python scripts/generate_assignments.py my-participants.csv

    # Custom output location
    python scripts/generate_assignments.py --output data/encrypted.enc

    # Use custom passphrase
    python scripts/generate_assignments.py --passphrase "my-secret-phrase"
"""

import csv
import json
import random
import secrets
import time
import base64
import argparse
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


class SecretSantaGenerator:
    def __init__(self):
        self.participants: List[Participant] = []
        self.assignments: List[Assignment] = []

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

    def generate_passphrase(self) -> str:
        """Generate a holiday-themed passphrase"""
        words = [
            "snowflake", "mistletoe", "eggnog", "tinsel", "garland",
            "ornament", "wreath", "sleigh", "reindeer", "chimney",
            "stockings", "fireplace", "gingerbread", "peppermint",
            "holly", "ivy", "pine", "spruce", "angel", "star",
            "candle", "ribbon", "gift", "present"
        ]

        selected_words = random.choices(words, k=4)
        number = random.randint(100, 999)
        return "-".join(selected_words) + f"-{number}"

    def encrypt_assignments(self, passphrase: str) -> str:
        """Encrypt assignments using AES-GCM (compatible with Web Crypto API)"""
        # Convert assignments to JSON
        assignments_data = [
            {
                "giver": a.giver,
                "recipient": a.recipient,
                "recipientBio": a.recipientBio
            }
            for a in self.assignments
        ]

        data_json = json.dumps(assignments_data, ensure_ascii=False)
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

    def create_encrypted_file(self, encrypted_data: str, output_file: str) -> None:
        """Create the encrypted file in the format expected by the React app"""
        file_data = {
            "data": encrypted_data,
            "timestamp": int(time.time() * 1000),  # JavaScript timestamp
            "version": "1.0"
        }

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(file_data, f, indent=2, ensure_ascii=False)

        print(f"Encrypted file created: {output_file}")

    def print_assignments(self) -> None:
        """Print assignments for verification"""
        print("\n" + "="*50)
        print("GENERATED ASSIGNMENTS:")
        print("="*50)
        for i, assignment in enumerate(self.assignments, 1):
            print(f"{i}. {assignment.giver} → {assignment.recipient}")
        print("="*50)


def main():
    parser = argparse.ArgumentParser(
        description="Generate encrypted Secret Santa assignments",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/generate_assignments.py
  python scripts/generate_assignments.py my-participants.csv
  python scripts/generate_assignments.py --output data/encrypted.enc
  python scripts/generate_assignments.py --passphrase "my-secret-phrase"
        """
    )
    parser.add_argument("csv_file", nargs="?", default="example-participants.csv",
                       help="CSV file with participants (default: example-participants.csv)")
    parser.add_argument("--output", "-o", default="public/secret-santa-data.enc",
                       help="Output file path (default: public/secret-santa-data.enc)")
    parser.add_argument("--passphrase", "-p", help="Custom passphrase (auto-generated if not provided)")
    parser.add_argument("--show-assignments", action="store_true",
                       help="Print assignments to console (for verification)")

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

    # Resolve output path
    if Path(args.output).is_absolute():
        output_path = Path(args.output)
    else:
        output_path = project_root / args.output

    print("🎅 Secret Santa Assignment Generator")
    print("="*40)

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

        if args.show_assignments:
            generator.print_assignments()

        # Generate or use provided passphrase
        if args.passphrase:
            passphrase = args.passphrase
            print(f"\n🔑 Using provided passphrase")
        else:
            passphrase = generator.generate_passphrase()
            print(f"\n🔑 Generated passphrase: {passphrase}")

        # Encrypt data
        print("\n🔒 Encrypting assignments...")
        encrypted_data = generator.encrypt_assignments(passphrase)
        print("✅ Encryption complete")

        # Create output file
        print(f"\n💾 Creating encrypted file: {output_path}")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        generator.create_encrypted_file(encrypted_data, str(output_path))

        print("\n" + "="*50)
        print("🎄 SUCCESS! Secret Santa file generated")
        print("="*50)
        print(f"📁 File: {output_path}")
        print(f"🔑 Passphrase: {passphrase}")
        print(f"👥 Participants: {len(participants)}")
        print(f"📝 Assignments: {len(assignments)}")
        print("\n📋 Next steps:")
        print("  1. Commit and push the encrypted file to your repo")
        print("  2. Share the passphrase with participants")
        print("  3. Participants can look up their assignments on the website")
        print(f"  4. Keep this passphrase safe: {passphrase}")
        print("\n💡 Tip: The app will automatically load the encrypted file from GitHub Pages")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        exit(1)


if __name__ == "__main__":
    main()
