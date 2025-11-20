#!/usr/bin/env python3
"""
Test script to verify password truncation is working
Run this on the VPS to verify the fix is deployed
"""

import sys
sys.path.insert(0, '/var/www/androama-landing/backend')

from app.auth import pwd_context, truncate_password

# Test with a very long password
long_password = "a" * 100
print(f"Testing with password length: {len(long_password)} characters")

# Test truncation function
truncated = truncate_password(long_password)
truncated_bytes = truncated.encode('utf-8')
print(f"After truncation: {len(truncated_bytes)} bytes")

# Test hashing
try:
    hashed = pwd_context.hash(long_password)
    print("✅ Password hashing SUCCESSFUL")
    print(f"Hash: {hashed[:50]}...")
    
    # Test verification
    verified = pwd_context.verify(long_password, hashed)
    if verified:
        print("✅ Password verification SUCCESSFUL")
    else:
        print("❌ Password verification FAILED")
except Exception as e:
    print(f"❌ ERROR: {e}")
    print(f"Error type: {type(e)}")
    import traceback
    traceback.print_exc()

