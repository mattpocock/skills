#!/usr/bin/env python3
"""
Upload an .excalidraw file to excalidraw.com and print a shareable URL.

No account required. The diagram is encrypted client-side (AES-GCM) before
upload -- the encryption key is embedded in the URL fragment, so the server
never sees plaintext.

Requirements:
    pip install cryptography

Usage:
    python upload.py <path-to-file.excalidraw>

Example:
    python upload.py ~/diagrams/architecture.excalidraw
    # prints: https://excalidraw.com/#json=abc123,encryptionKeyHere
"""

import json
import os
import struct
import sys
import zlib
import base64
import urllib.request

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:
    print("Error: 'cryptography' package is required for upload.")
    print("Install it with: pip install cryptography")
    sys.exit(1)

# Excalidraw public upload endpoint (no auth needed)
UPLOAD_URL = "https://json.excalidraw.com/api/v2/post/"


def concat_buffers(*buffers: bytes) -> bytes:
    """
    Build the Excalidraw v2 concat-buffers binary format.

    Layout: [version=1 (4B big-endian)] then for each buffer:
            [length (4B big-endian)] [data bytes]
    """
    parts = [struct.pack(">I", 1)]  # version = 1
    for buf in buffers:
        parts.append(struct.pack(">I", len(buf)))
        parts.append(buf)
    return b"".join(parts)


def upload(excalidraw_json: str) -> str:
    """
    Encrypt and upload Excalidraw JSON to excalidraw.com.

    Args:
        excalidraw_json: The full .excalidraw file content as a string.

    Returns:
        Shareable URL string.
    """
    # 1. Inner payload: concat_buffers(file_metadata, data)
    file_metadata = json.dumps({}).encode("utf-8")
    data_bytes = excalidraw_json.encode("utf-8")
    inner_payload = concat_buffers(file_metadata, data_bytes)

    # 2. Compress with zlib
    compressed = zlib.compress(inner_payload)

    # 3. AES-GCM 128-bit encrypt
    raw_key = os.urandom(16)   # 128-bit key
    iv = os.urandom(12)        # 12-byte nonce
    aesgcm = AESGCM(raw_key)
    encrypted = aesgcm.encrypt(iv, compressed, None)

    # 4. Encoding metadata
    encoding_meta = json.dumps({
        "version": 2,
        "compression": "pako@1",
        "encryption": "AES-GCM",
    }).encode("utf-8")

    # 5. Outer payload: concat_buffers(encoding_meta, iv, encrypted)
    payload = concat_buffers(encoding_meta, iv, encrypted)

    # 6. Upload
    req = urllib.request.Request(UPLOAD_URL, data=payload, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        if resp.status != 200:
            raise RuntimeError(f"Upload failed with HTTP {resp.status}")
        result = json.loads(resp.read().decode("utf-8"))

    file_id = result.get("id")
    if not file_id:
        raise RuntimeError(f"Upload returned no file ID. Response: {result}")

    # 7. Key as base64url (JWK 'k' format, no padding)
    key_b64 = base64.urlsafe_b64encode(raw_key).rstrip(b"=").decode("ascii")

    return f"https://excalidraw.com/#json={file_id},{key_b64}"


def main():
    if len(sys.argv) < 2:
        print("Usage: python upload.py <path-to-file.excalidraw>")
        sys.exit(1)

    file_path = sys.argv[1]

    if not os.path.isfile(file_path):
        print(f"Error: File not found: {file_path}")
        sys.exit(1)

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Basic validation: should be valid JSON with an "elements" key
    try:
        doc = json.loads(content)
    except json.JSONDecodeError as e:
        print(f"Error: File is not valid JSON: {e}")
        sys.exit(1)

    if "elements" not in doc:
        print("Warning: File does not contain an 'elements' key. Uploading anyway.")

    url = upload(content)
    print(url)


if __name__ == "__main__":
    main()
